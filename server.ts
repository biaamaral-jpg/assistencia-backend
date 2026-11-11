import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {router} from "./routes.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 3333);

app.use(cors());
app.use(express.json());
app.use(router);

export default app;
