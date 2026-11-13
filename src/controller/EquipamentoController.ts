import Equipamento from "../model/Equipamento.js";
import { type Request, type Response } from "express";
import type { EquipamentoDTO } from "../interface/EquipamentoDTO.js";

class EquipamentoController extends Equipamento {
    static async todos(req: Request, res: Response) {
        try {
            const listaDeEquipamentos = await Equipamento.listarEquipamentos();

            if (listaDeEquipamentos.length === 0) {
                res.status(204).send();
                return;
            }

            res.status(200).json(listaDeEquipamentos);
        } catch (error) {
            console.error("[EquipamentoController] Erro ao listar equipamentos:", error);
            res.status(500).json({
                mensagem: "Erro interno ao recuperar a lista de equipamentos."
            });
        }
    }

    static async equipamento(req: Request, res: Response) {
        try {
            const idEquipamento = Number(req.params.id);

            if (!Number.isInteger(idEquipamento) || idEquipamento <= 0) {
                res.status(400).json({
                    mensagem: "ID inválido. Informe um número inteiro positivo."
                });
                return;
            }

            const equipamento = await Equipamento.listarEquipamento(idEquipamento);
            res.status(200).json(equipamento);
        } catch (error: any) {
            console.error(`[EquipamentoController] Erro ao buscar equipamento (id: ${req.params.id}):`, error);

            if (error.message?.includes("não encontrado")) {
                res.status(404).json({ mensagem: error.message });
                return;
            }

            res.status(500).json({
                mensagem: "Erro interno ao recuperar o equipamento."
            });
        }
    }

    static async cadastrar(req: Request, res: Response) {
        try {
            const dadosRecebidos: EquipamentoDTO = req.body;

            if (
                !dadosRecebidos.tipo ||
                !dadosRecebidos.marca ||
                !dadosRecebidos.modelo
            ) {
                res.status(400).json({
                    mensagem: "Campos obrigatórios ausentes: tipo, marca e modelo."
                });
                return;
            }

            const novoEquipamento = new Equipamento(
                dadosRecebidos.tipo,
                dadosRecebidos.marca,
                dadosRecebidos.modelo,
                dadosRecebidos.idCliente
            );

            const result = await Equipamento.cadastrarEquipamento(
                novoEquipamento as unknown as EquipamentoDTO
            );

            if (result) {
                res.status(201).json({
                    mensagem: "Equipamento cadastrado com sucesso."
                });
                return;
            }

            res.status(400).json({
                mensagem: "Não foi possível cadastrar o equipamento."
            });
        } catch (error) {
            console.error("[EquipamentoController] Erro ao cadastrar equipamento:", error);
            res.status(500).json({
                mensagem: "Erro interno ao cadastrar o equipamento."
            });
        }
    }

    static async atualizar(req: Request, res: Response) {
        try {
            const idEquipamento = Number(req.params.id);

            if (!Number.isInteger(idEquipamento) || idEquipamento <= 0) {
                res.status(400).json({
                    mensagem: "ID inválido. Informe um número inteiro positivo."
                });
                return;
            }

            const dadosRecebidos: EquipamentoDTO = req.body;

            if (
                !dadosRecebidos.tipo ||
                !dadosRecebidos.marca ||
                !dadosRecebidos.modelo
            ) {
                res.status(400).json({
                    mensagem: "Campos obrigatórios ausentes: tipo, marca e modelo."
                });
                return;
            }

            const equipamento: EquipamentoDTO = {
                idEquipamento,
                ...(dadosRecebidos.idCliente !== undefined
                    ? { idCliente: dadosRecebidos.idCliente }
                    : {}),
                tipo: dadosRecebidos.tipo,
                marca: dadosRecebidos.marca,
                modelo: dadosRecebidos.modelo
            };

            const result = await Equipamento.atualizarEquipamento(equipamento);

            if (result) {
                res.status(200).json({
                    mensagem: "Equipamento atualizado com sucesso."
                });
                return;
            }

            res.status(404).json({
                mensagem: "Equipamento não encontrado."
            });
        } catch (error: any) {
            console.error(`[EquipamentoController] Erro ao atualizar equipamento (id: ${req.params.idEquipamento}):`, error);

            if (error.message?.includes("não encontrado")) {
                res.status(404).json({ mensagem: error.message });
                return;
            }

            res.status(500).json({
                mensagem: "Erro interno ao atualizar o equipamento."
            });
        }
    }

    static async remover(req: Request, res: Response) {
        try {
            const idEquipamento = Number(req.params.id);

            if (!Number.isInteger(idEquipamento) || idEquipamento <= 0) {
                res.status(400).json({
                    mensagem: "ID inválido. Informe um número inteiro positivo."
                });
                return;
            }

            const result = await Equipamento.removerEquipamento(idEquipamento);

            if (result) {
                res.status(200).json({
                    mensagem: "Equipamento removido com sucesso."
                });
                return;
            }

            res.status(404).json({
                mensagem: "Equipamento não encontrado."
            });
        } catch (error: any) {
            console.error(`[EquipamentoController] Erro ao remover equipamento (id: ${req.params.id}):`, error);

            if (error.message?.includes("não encontrado")) {
                res.status(404).json({ mensagem: error.message });
                return;
            }

            res.status(500).json({
                mensagem: "Erro interno ao remover o equipamento."
            });
        }
    }
}

export default EquipamentoController;
