import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Pinecone } from "@pinecone-database/pinecone";
import csv from "csv-parser";
import fs from "fs";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";



export const connectDB = (uri: string) => {
  mongoose
    .connect(uri)
    .then((c) => console.log(`DB connected to ${c.connection.host}`))
    .catch((e) => console.log(e));
};

export const datasetKeywords = [
  "bot-iot",
  "bot iot",
  "bot-iot dataset",
  "unsw canberra",
  "pcap",
  "argus",
  "csv flows",
  "ddos",
  "dos",
  "keylogging",
  "data exfiltration",
  "os scan",
  "service scan",
  "srate",
  "drate",
];

function chunkText(text: string, chunkSize = 90): string[] {
  const words = text.split(" ");
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize).join(" "));
  }
  return chunks;
}

export const indexCsvData = async (filePath: string) => {
  const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY!});
  const index = pinecone.Index("iot-ase");

  // Prepare embedding model
  const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GEMINI_API_KEY!,
    model: "text-embedding-004", // 768-dim
  });

  const rows: string[] = [];

  // Read CSV into memory
  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        const text = Object.entries(row)
          .map(([key, value]) => `${key}: ${value}`)
          .join(", ");
        rows.push(text);
      })
      .on("end", () => {
        console.log(`Loaded ${rows.length} rows from CSV`);
        resolve();
      })
      .on("error", reject);
  });

  const BATCH_SIZE = 200;
  const MAX_UPSERT_BATCH = 100;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);

    const chunkedTexts: string[] = [];
    const chunkMap: { id: string; text: string }[] = [];

    // Chunk each row
    for (const text of batch) {
      const chunks = chunkText(text, 90);
      for (const chunk of chunks) {
        const id = uuidv4();
        chunkedTexts.push(chunk);
        chunkMap.push({ id, text: chunk });
      }
    }

    if (chunkedTexts.length === 0) continue;

    const embeddingsBatch: number[][] = [];
    for (let s = 0; s < chunkedTexts.length; s += 50) {
      const slice = chunkedTexts.slice(s, s + 50);
      const sliceEmbeddings = await embeddings.embedDocuments(slice);
      embeddingsBatch.push(...sliceEmbeddings);
    }

    const upserts = chunkMap.map((c, idx) => ({
      id: c.id,
      values: embeddingsBatch[idx],
      metadata: { text: c.text },
    }));

    // Upsert in Pinecone
    for (let u = 0; u < upserts.length; u += MAX_UPSERT_BATCH) {
      const upsertSlice = upserts.slice(u, u + MAX_UPSERT_BATCH);
      await index.upsert(upsertSlice);
    }

    console.log(
      `Indexed rows ${i + 1} → ${Math.min(i + BATCH_SIZE, rows.length)} (chunks: ${chunkMap.length})`
    );
  }

  console.log("Full CSV indexed into Pinecone with text-embedding-004");
};
