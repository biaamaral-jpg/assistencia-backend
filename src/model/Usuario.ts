import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { DatabaseModel } from "./DatabaseModel.js";

const database = new DatabaseModel().pool;
const JWT_SECRET = process.env.JWT_SECRET ?? "assistencia-tech-secret";

export interface UsuarioLoginPayload {
    id: number | string;
    nome: string;
    email: string;
    perfil?: string;
}

function normalizarEmail(email: string): string {
    return email.trim().toLowerCase();
}

function gerarHashSenha(senha: string): string {
    return crypto.createHash("sha256").update(senha).digest("hex");
}

class Usuario {
    static async autenticar(email: string, senha: string): Promise<{ token: string; usuario: UsuarioLoginPayload }> {
        const emailNormalizado = normalizarEmail(email);
        const senhaNormalizada = senha.trim();

        const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@assistenciatecnica.com").trim().toLowerCase();
        const adminSenha = process.env.ADMIN_PASSWORD ?? "admin123";

        if (emailNormalizado === adminEmail && senhaNormalizada === adminSenha) {
            const payload: UsuarioLoginPayload = {
                id: "admin",
                nome: "Administrador",
                email: adminEmail,
                perfil: "admin"
            };

            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });

            return {
                token,
                usuario: payload
            };
        }

        try {
            const query = `
                SELECT id_usuario, nome, email, senha
                FROM usuario
                WHERE email = $1
                LIMIT 1;
            `;

            const resultado = await database.query(query, [emailNormalizado]);

            if (resultado.rows.length === 0) {
                throw new Error("Credenciais inválidas.");
            }

            const usuarioBD = resultado.rows[0];
            const senhaArmazenada = String(usuarioBD.senha ?? "");
            const senhaValida =
                senhaArmazenada === senhaNormalizada ||
                senhaArmazenada === gerarHashSenha(senhaNormalizada);

            if (!senhaValida) {
                throw new Error("Credenciais inválidas.");
            }

            const payload: UsuarioLoginPayload = {
                id: Number(usuarioBD.id_usuario),
                nome: String(usuarioBD.nome ?? "Usuário"),
                email: String(usuarioBD.email ?? emailNormalizado),
                perfil: "usuario"
            };

            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });

            return {
                token,
                usuario: payload
            };
        } catch (error: any) {
            if (error?.code === "42P01") {
                throw new Error("Credenciais inválidas.");
            }

            throw error;
        }
    }
}

export default Usuario;
