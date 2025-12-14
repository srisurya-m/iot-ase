import axios from "axios";
import { Request, Response } from "express";
import { datasetKeywords } from "../utils/features";
import { HuggingFaceResponse } from "../types/types";
import { GoogleGenAI } from "@google/genai";
import { Pinecone } from "@pinecone-database/pinecone";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});
const pineconeIndex = pinecone.Index("iot-ase");

const classifyQuery = async (query: string): Promise<"iot" | "general"> => {
  try {
    console.log("classifying using BaRT");
    const lowerQuery = query.toLowerCase();

    if (datasetKeywords.some((kw) => lowerQuery.includes(kw))) {
      return "iot";
    }

    // Use Hugging Face's BART model for more nuanced classification
    const response = await axios.post<HuggingFaceResponse>(
      "https://api-inference.huggingface.co/models/facebook/bart-large-mnli",
      {
        inputs: `Classify the following query as either related to the Bot-IoT dataset (IoT security) or General. Query: ${query}`,
        parameters: { candidate_labels: ["iot", "general"] },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const { labels, scores } = response.data;
    const maxScoreIndex = scores.indexOf(Math.max(...scores));
    const predicted = labels[maxScoreIndex];

    // Return "iot" only if the model's confidence is high (>= 0.7)
    if (predicted === "iot" && scores[maxScoreIndex] >= 0.7) {
      return "iot";
    }

    return "general";
  } catch (error) {
    // Fallback classification in case the API call fails
    console.error("BART Classifier error:", error);
    const lowerQuery = query.toLowerCase();
    if (datasetKeywords.some((kw) => lowerQuery.includes(kw))) {
      return "iot";
    }
    return "general";
  }
};

export const transformQuery = async (query: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: query }] }],
    config: {
      systemInstruction: `You are a query rewriting expert. 
      Rephrase the user question into a standalone question understandable without chat history. 
      Only output the rewritten question.`,
    },
  });
  return response.text!;
};

export const generateAnswer = async (
  queryType: "iot" | "general",
  query: string
): Promise<{ answer: string }> => {
  if (queryType === "general")
    return { answer: "I am not trained to handle such queries." };

  const standaloneQuery = await transformQuery(query);

  const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GEMINI_API_KEY!,
    model: "text-embedding-004",
  });
  const queryVector = await embeddings.embedQuery(standaloneQuery);

  const searchResults = await pineconeIndex.query({
    topK: 35,
    vector: queryVector,
    includeMetadata: true,
  });

  const context = searchResults.matches
    .map((m) => m.metadata?.text)
    .filter(Boolean)
    .join("\n\n---\n\n");

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: standaloneQuery }] }],
    config: {
      systemInstruction: `You are a Data Structures and Algorithm Expert. 
      Answer the user's question based ONLY on the provided context. 
      If the answer is not in the context, reply: "I could not find the answer in the provided document."
      
      Context: ${context}`,
    },
  });

  return { answer: response.text! };
};

const reviewAnswerConsistency = (
  queryType: "iot" | "general",
  generatedContent: string
): string => {
  console.log(
    `[Reviewer] Checking Topic: ${queryType}, Content: ${generatedContent}`
  );

  const refusalMessage = "I am not trained to handle such queries.";

  if (queryType === "iot") {
    if (generatedContent.includes(refusalMessage)) {
      console.log(
        "[Reviewer] OVERRIDE: IoT query incorrectly received a 'general' refusal."
      );
      return "I apologize, but an error occurred while processing your IoT query.";
    }
    return generatedContent;
  } else {
    if (!generatedContent.includes(refusalMessage)) {
      console.log(
        "[Reviewer] OVERRIDE: General query did not receive the standard refusal."
      );

      return refusalMessage;
    }

    return generatedContent; 
  }
};

export const newSearchController = async (
  req: Request,
  res: Response
): Promise<Response<any>> => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing query",
      });
    }

    const queryType = await classifyQuery(query);

    const { answer: generatedAnswer } = await generateAnswer(queryType, query);

    const finalResponse = reviewAnswerConsistency(queryType, generatedAnswer);

    return res.status(200).json({
      success: true,
      queryType: queryType,
      answer: finalResponse,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
