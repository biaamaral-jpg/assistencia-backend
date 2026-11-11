import type { AgendamentoDTO } from "../interface/AgendamentoDTO.js";
import { DatabaseModel } from "./DatabaseModel.js";

const database = new DatabaseModel().pool;

class Agendamento {
    private idAgendamento: number = 0;
    private idCliente: number;
    private idEquipamento: number;
    private dataHora: Date | string;
    private status: AgendamentoDTO["status"];

    constructor(
        _idCliente: number,
        _idEquipamento: number,
        _dataHora: Date | string,
        _status: AgendamentoDTO["status"]
    ) {
        this.idCliente = _idCliente;
        this.idEquipamento = _idEquipamento;
        this.dataHora = _dataHora;
        this.status = _status;
    }

    public getIdAgendamento(): number {
        return this.idAgendamento;
    }

    public setIdAgendamento(_idAgendamento: number): void {
        this.idAgendamento = _idAgendamento;
    }

    public getIdCliente(): number {
        return this.idCliente;
    }

    public setIdCliente(_idCliente: number): void {
        this.idCliente = _idCliente;
    }

    public getIdEquipamento(): number {
        return this.idEquipamento;
    }

    public setIdEquipamento(_idEquipamento: number): void {
        this.idEquipamento = _idEquipamento;
    }

    public getDataHora(): Date | string {
        return this.dataHora;
    }

    public setDataHora(_dataHora: Date | string): void {
        this.dataHora = _dataHora;
    }

    public getStatus(): AgendamentoDTO["status"] {
        return this.status;
    }

    public setStatus(_status: AgendamentoDTO["status"]): void {
        this.status = _status;
    }

    private static toDTO(agendamento: any): AgendamentoDTO {
        return {
            idAgendamento: agendamento.id_agendamento,
            idCliente: agendamento.id_cliente,
            idEquipamento: agendamento.id_equipamento,
            dataHora: agendamento.data_hora,
            status: agendamento.status
        };
    }

    static async listarAgendamentos(): Promise<AgendamentoDTO[]> {
        try {
            const query = `
                SELECT *
                FROM agendamento
                ORDER BY data_hora DESC;
            `;

            const respostaBD = await database.query(query);
            return respostaBD.rows.map(Agendamento.toDTO);
        } catch (error) {
            console.error("[AgendamentoModel] Erro ao listar agendamentos:", error);
            throw error;
        }
    }

    static async listarAgendamento(idAgendamento: number): Promise<AgendamentoDTO> {
        try {
            const query = `
                SELECT *
                FROM agendamento
                WHERE id_agendamento = $1;
            `;

            const respostaBD = await database.query(query, [idAgendamento]);

            if (respostaBD.rows.length === 0) {
                throw new Error(`Agendamento com ID ${idAgendamento} não encontrado.`);
            }

            return Agendamento.toDTO(respostaBD.rows[0]);
        } catch (error) {
            console.error(`[AgendamentoModel] Erro ao buscar agendamento (id: ${idAgendamento}):`, error);
            throw error;
        }
    }

    static async cadastrarAgendamento(agendamento: AgendamentoDTO): Promise<boolean> {
        try {
            const query = `
                INSERT INTO agendamento (
                    id_cliente,
                    id_equipamento,
                    data_hora,
                    status
                )
                VALUES ($1, $2, $3, $4)
                RETURNING id_agendamento;
            `;

            const valores = [
                agendamento.idCliente,
                agendamento.idEquipamento,
                agendamento.dataHora,
                agendamento.status
            ];

            const resultado = await database.query(query, valores);

            if (resultado.rows.length === 0) {
                throw new Error("INSERT não retornou ID — cadastro pode ter falhado silenciosamente.");
            }

            console.info(`[AgendamentoModel] Agendamento cadastrado com sucesso. ID: ${resultado.rows[0].id_agendamento}`);
            return true;
        } catch (error) {
            console.error("[AgendamentoModel] Erro ao cadastrar agendamento:", error);
            throw error;
        }
    }

    static async atualizarAgendamento(agendamento: AgendamentoDTO): Promise<boolean> {
        try {
            if (!agendamento.idAgendamento) {
                throw new Error("idAgendamento é obrigatório para atualização.");
            }

            await Agendamento.listarAgendamento(agendamento.idAgendamento);

            const query = `
                UPDATE agendamento SET
                    id_cliente = $1,
                    id_equipamento = $2,
                    data_hora = $3,
                    status = $4
                WHERE id_agendamento = $5;
            `;

            const valores = [
                agendamento.idCliente,
                agendamento.idEquipamento,
                agendamento.dataHora,
                agendamento.status,
                agendamento.idAgendamento
            ];

            const respostaBD = await database.query(query, valores);
            return (respostaBD.rowCount ?? 0) > 0;
        } catch (error) {
            console.error(`[AgendamentoModel] Erro ao atualizar agendamento (id: ${agendamento.idAgendamento}):`, error);
            throw error;
        }
    }

    static async removerAgendamento(idAgendamento: number): Promise<boolean> {
        try {
            await Agendamento.listarAgendamento(idAgendamento);

            const respostaBD = await database.query(
                `DELETE FROM agendamento WHERE id_agendamento = $1;`,
                [idAgendamento]
            );

            return (respostaBD.rowCount ?? 0) > 0;
        } catch (error) {
            console.error(`[AgendamentoModel] Erro ao remover agendamento (id: ${idAgendamento}):`, error);
            throw error;
        }
    }
}

export default Agendamento;
