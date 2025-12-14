# 🤖 Agentic GPT for IoT: Context-Grounded Network Intrusion Intelligence

## Overview

The **Agentic GPT for IoT** is a specialized intelligence platform designed to provide highly accurate, context-grounded analysis of IoT network intrusion data. It implements an **Agentic Retrieval-Augmented Generation (RAG)** framework to ensure that all responses are synthesized directly from a proprietary dataset of network flow traffic features.

This system is engineered to mitigate Large Language Model (LLM) hallucinations by enforcing strict domain boundaries and utilizing a multi-agent validation architecture.

## ✨ Key Features

* **Context-Grounded Analysis:** Responses are guaranteed to be factual, based solely on the statistical and feature summaries derived from the IoT network traffic dataset.
* **Multi-Agent Architecture:** Includes an Agentic Classifier for query routing and a Reviewer Agent for iterative answer validation.
* **Domain Boundary Enforcement:** Queries outside the scope of IoT network intelligence are rejected to maintain system integrity.
* **Supported Attack Classes:** Provides intelligence on DDoS, DoS, Mirai variants, spoofing, scanning, and benign traffic.
* **Query Types:** Optimized for Retrieval, Statistical (Weight), and Comparative Reasoning tasks over flow-level features.

## 📐 Architecture and Data Flow

The system integrates several components to create a reliable RAG pipeline:

1.  **Knowledge Construction:** Raw numeric flow-level features (duration, variance, rates, etc.) are converted into natural-language feature summaries.
2.  **Indexing:** These summaries are converted into dense vector embeddings using the `models/text-embedding-004` model and stored in **Pinecone**.
3.  **Agentic Routing:** The user query is classified to ensure it is domain-specific.
4.  **Retrieval & Augmentation:** The top-K relevant feature summaries are fetched and injected into the prompt.
5.  **Generation & Review:** A **Gemini Generative Model** synthesizes the final answer, which is then validated by the Reviewer Agent before being returned.

## 🛠️ Technology Stack

| Component | Technology / Model | Purpose |
| :--- | :--- | :--- |
| **Backend Framework** | Node.js, Express.js (TypeScript) | API and Business Logic |
| **Frontend Framework** | React (TypeScript), Vite, SASS/SCSS | User Interface and Interaction |
| **Vector Database** | Pinecone | Storage and Semantic Retrieval of Embeddings |
| **Generative Models** | Gemini Generative Model | Synthesis and High-Level Reasoning (LLM Generator) |
| **Embedding Model** | `models/text-embedding-004` | Converting text to vector space (for Pinecone) |
| **Database** | MongoDB (via Mongoose) | Structured Data Persistence |
| **Tooling** | Pandas, LangChain SDKs | Data preparation and RAG orchestration |

## 🚀 Setup and Installation

### Prerequisites

* Node.js (v18+)
* MongoDB Instance (Local or Remote)
* Pinecone API Key and Index (e.g., `iot-ase`)
* Google Gemini API Key

### 1. Backend Setup

```bash
# Navigate to the backend directory
cd iot-ase/backend

# Install dependencies
npm install

# Create a .env file and populate variables
cp .env.example .env 
# Add your MONGO_URI, PINECONE_API_KEY, GEMINI_API_KEY, etc.

# Build TypeScript to JavaScript
npm run build

# Start the server (runs from dist/app.js)
npm start
