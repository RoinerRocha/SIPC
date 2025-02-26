import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import cors from "cors";
import { exceptionMiddleware } from "./Middleware/exceptionMiddleware";

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(exceptionMiddleware);


export default app