import cors from "cors";
import { config } from "dotenv";
import express from "express";
import { connectDB, indexCsvData } from "./utils/features";
import path from "path";

import searchRoute from "./routes/Search";
import { Flow } from "./modals/Flow";

config({
  path: "./.env",
});

const csvPath = path.join(__dirname, "..", "iot_intrusion_reduced.csv");

const port = process.env.PORT || 4000;
const app = express();
app.use(express.json());
app.use(cors());

connectDB(process.env.MONGO_URI as string);

app.get("/", (req, res) => {
  res.send("API working with /api/v1");
});

//using routes
app.use("/api/v1/search", searchRoute);
// indexCsvData(csvPath);

app.listen(port, () => {
  console.log(`server is running on http://localhost:${port}`);
});

