
import express from "express";
import cors, { type CorsOptions } from "cors";
import { router } from "./routes.js";

const server = express();

server.use(express.json());

const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://interface-info-tech.vercel.app",
    process.env.FRONTEND_URL,
].filter((origin): origin is string => Boolean(origin));

const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }

        callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
};

server.use(cors(corsOptions));
server.options(/.*/, cors(corsOptions));

server.use(router);

export { server };
