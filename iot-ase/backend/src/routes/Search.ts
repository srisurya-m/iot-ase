import express from "express";
import { newSearchController } from "../controllers/Search";

const app = express.Router();

app.post("/new", newSearchController);

export default app;
