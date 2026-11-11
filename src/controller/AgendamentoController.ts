import Agendamento from "../model/Agendamento.js";
import { type Request, type Response } from "express";
import type { AgendamentoDTO } from "../interface/AgendamentoDTO.js";

class AgendamentoController extends Agendamento {
    static async todos(req: Request, res: Response) {
        try {
            const listaDeAgendamentos = await Agendamento.listarAgendamentos();

            if (listaDeAgendamentos.length === 0) {
                res.status(204).send();
                return;
            }

            res.status(200).json(listaDeAgendamentos);
        } catch (error) {
            console.error("[AgendamentoController] Erro ao listar agendamentos:", error);
            res.status(500).json({
                mensagem: "Erro interno ao recuperar a lista de agendamentos."
            });
        }
    }

    static async agendamento(req: Request, res: Response) {
        try {
            const idAgendamento = parseInt(req.params.idAgendamento as string);

            if (isNaN(idAgendamento) || idAgendamento <= 0) {
                res.status(400).json({
                    mensagem: "ID inválido. Informe um número inteiro positivo."
                });
                return;
            }

            const agendamento = await Agendamento.listarAgendamento(idAgendamento);
            res.status(200).json(agendamento);
        } catch (error: any) {
            console.error(`[AgendamentoController] Erro ao buscar agendamento (id: ${req.params.idAgendamento}):`, error);

            if (error.message?.includes("não encontrado")) {
                res.status(404).json({ mensagem: error.message });
                return;
            }

            res.status(500).json({
                mensagem: "Erro interno ao recuperar o agendamento."
            });
        }
    }

    static async cadastrar(req: Request, res: Response) {
        try {
            const dadosRecebidos: AgendamentoDTO = req.body;

            if (
                !dadosRecebidos.idCliente ||
                !dadosRecebidos.idEquipamento ||
                !dadosRecebidos.dataHora ||
                !dadosRecebidos.status
            ) {
                res.status(400).json({
                    mensagem: "Campos obrigatórios ausentes: idCliente, idEquipamento, dataHora e status."
                });
                return;
            }

            const novoAgendamento = new Agendamento(
                dadosRecebidos.idCliente,
                dadosRecebidos.idEquipamento,
                dadosRecebidos.dataHora,
                dadosRecebidos.status
            );

            const result = await Agendamento.cadastrarAgendamento(
                novoAgendamento as unknown as AgendamentoDTO
            );

            if (result) {
                res.status(201).json({
                    mensagem: "Agendamento cadastrado com sucesso."
                });
                return;
            }

            res.status(400).json({
                mensagem: "Não foi possível cadastrar o agendamento."
            });
        } catch (error) {
            console.error("[AgendamentoController] Erro ao cadastrar agendamento:", error);
            res.status(500).json({
                mensagem: "Erro interno ao cadastrar o agendamento."
            });
        }
    }

    static async atualizar(req: Request, res: Response) {
        try {
            const idAgendamento = parseInt(req.params.idAgendamento as string);

            if (isNaN(idAgendamento) || idAgendamento <= 0) {
                res.status(400).json({
                    mensagem: "ID inválido. Informe um número inteiro positivo."
                });
                return;
            }

            const dadosRecebidos: AgendamentoDTO = req.body;

            if (
                !dadosRecebidos.idCliente ||
                !dadosRecebidos.idEquipamento ||
                !dadosRecebidos.dataHora ||
                !dadosRecebidos.status
            ) {
                res.status(400).json({
                    mensagem: "Campos obrigatórios ausentes: idCliente, idEquipamento, dataHora e status."
                });
                return;
            }

            const agendamento: AgendamentoDTO = {
                idAgendamento,
                idCliente: dadosRecebidos.idCliente,
                idEquipamento: dadosRecebidos.idEquipamento,
                dataHora: dadosRecebidos.dataHora,
                status: dadosRecebidos.status
            };

            const result = await Agendamento.atualizarAgendamento(agendamento);

            if (result) {
                res.status(200).json({
                    mensagem: "Agendamento atualizado com sucesso."
                });
                return;
            }

            res.status(404).json({
                mensagem: "Agendamento não encontrado."
            });
        } catch (error: any) {
            console.error(`[AgendamentoController] Erro ao atualizar agendamento (id: ${req.params.idAgendamento}):`, error);

            if (error.message?.includes("não encontrado")) {
                res.status(404).json({ mensagem: error.message });
                return;
            }

            res.status(500).json({
                mensagem: "Erro interno ao atualizar o agendamento."
            });
        }
    }

    static async remover(req: Request, res: Response) {
        try {
            const idAgendamento = parseInt(req.params.idAgendamento as string);

            if (isNaN(idAgendamento) || idAgendamento <= 0) {
                res.status(400).json({
                    mensagem: "ID inválido. Informe um número inteiro positivo."
                });
                return;
            }

            const result = await Agendamento.removerAgendamento(idAgendamento);

            if (result) {
                res.status(200).json({
                    mensagem: "Agendamento removido com sucesso."
                });
                return;
            }

            res.status(404).json({
                mensagem: "Agendamento não encontrado."
            });
        } catch (error: any) {
            console.error(`[AgendamentoController] Erro ao remover agendamento (id: ${req.params.idAgendamento}):`, error);

            if (error.message?.includes("não encontrado")) {
                res.status(404).json({ mensagem: error.message });
                return;
            }

            res.status(500).json({
                mensagem: "Erro interno ao remover o agendamento."
            });
        }
    }
}

export default AgendamentoController;
