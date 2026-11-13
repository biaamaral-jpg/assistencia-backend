import type { Request, Response } from "express";
import Usuario from "../model/Usuario.js";

class AuthController {
    static async login(req: Request, res: Response) {
        try {
            const { email, senha } = req.body ?? {};

            if (!email || !senha) {
                return res.status(400).json({
                    mensagem: "Email e senha são obrigatórios."
                });
            }

            const { token, usuario } = await Usuario.autenticar(email, senha);

            return res.status(200).json({
                mensagem: "Login realizado com sucesso.",
                token,
                usuario
            });
        } catch (error: any) {
            console.error("[AuthController] Erro no login:", error);

            return res.status(401).json({
                mensagem: error?.message ?? "Credenciais inválidas."
            });
        }
    }
}

export default AuthController;
