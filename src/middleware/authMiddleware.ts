import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

declare global {
    namespace Express {
        interface Request {
            user?: {
                id?: number | string;
                nome?: string;
                email?: string;
                perfil?: string;
            };
        }
    }
}

export function autenticar(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ mensagem: "Token de autenticação ausente." });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ mensagem: "Token de autenticação ausente." });
    }

    const secret = process.env.JWT_SECRET ?? "assistencia-tech-secret";

    if (!secret) {
        return res.status(500).json({ mensagem: "Configuração de autenticação indisponível." });
    }

    try {
        const payload = jwt.verify(token, secret) as {
            id?: number | string;
            nome?: string;
            email?: string;
            perfil?: string;
        };

        req.user = payload;
        return next();
    } catch (error) {
        console.error("[authMiddleware] Token inválido:", error);
        return res.status(401).json({ mensagem: "Token inválido ou expirado." });
    }
}
