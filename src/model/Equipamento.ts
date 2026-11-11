import type { EquipamentoDTO } from "../interface/EquipamentoDTO.js";
import { DatabaseModel } from "./DatabaseModel.js";

const database = new DatabaseModel().pool;

class Equipamento {
    private idEquipamento: number = 0;
    private idCliente: number | undefined;
    private tipo: string;
    private marca: string;
    private modelo: string;

    constructor(_tipo: string, _marca: string, _modelo: string, _idCliente?: number) {
        this.tipo = _tipo;
        this.marca = _marca;
        this.modelo = _modelo;
        this.idCliente = _idCliente;
    }

    public getIdEquipamento(): number {
        return this.idEquipamento;
    }

    public setIdEquipamento(_idEquipamento: number): void {
        this.idEquipamento = _idEquipamento;
    }

    public getIdCliente(): number | undefined {
        return this.idCliente;
    }

    public setIdCliente(_idCliente?: number): void {
        this.idCliente = _idCliente;
    }

    public getTipo(): string {
        return this.tipo;
    }

    public setTipo(_tipo: string): void {
        this.tipo = _tipo;
    }

    public getMarca(): string {
        return this.marca;
    }

    public setMarca(_marca: string): void {
        this.marca = _marca;
    }

    public getModelo(): string {
        return this.modelo;
    }

    public setModelo(_modelo: string): void {
        this.modelo = _modelo;
    }

    private static toDTO(equipamento: any): EquipamentoDTO {
        return {
            idEquipamento: equipamento.id_equipamento,
            idCliente: equipamento.id_cliente ?? undefined,
            tipo: equipamento.tipo,
            marca: equipamento.marca,
            modelo: equipamento.modelo
        };
    }

    static async listarEquipamentos(): Promise<EquipamentoDTO[]> {
        try {
            const query = `
                SELECT *
                FROM equipamento
                ORDER BY modelo ASC;
            `;

            const respostaBD = await database.query(query);
            return respostaBD.rows.map(Equipamento.toDTO);
        } catch (error) {
            console.error("[EquipamentoModel] Erro ao listar equipamentos:", error);
            throw error;
        }
    }

    static async listarEquipamento(idEquipamento: number): Promise<EquipamentoDTO> {
        try {
            const query = `
                SELECT *
                FROM equipamento
                WHERE id_equipamento = $1;
            `;

            const respostaBD = await database.query(query, [idEquipamento]);

            if (respostaBD.rows.length === 0) {
                throw new Error(`Equipamento com ID ${idEquipamento} não encontrado.`);
            }

            return Equipamento.toDTO(respostaBD.rows[0]);
        } catch (error) {
            console.error(`[EquipamentoModel] Erro ao buscar equipamento (id: ${idEquipamento}):`, error);
            throw error;
        }
    }

    static async cadastrarEquipamento(equipamento: EquipamentoDTO): Promise<boolean> {
        try {
            const query = `
                INSERT INTO equipamento (
                    id_cliente,
                    tipo,
                    marca,
                    modelo
                )
                VALUES ($1, $2, $3, $4)
                RETURNING id_equipamento;
            `;

            const valores = [
                equipamento.idCliente ?? null,
                equipamento.tipo.trim(),
                equipamento.marca.trim(),
                equipamento.modelo.trim()
            ];

            const resultado = await database.query(query, valores);

            if (resultado.rows.length === 0) {
                throw new Error("INSERT não retornou ID — cadastro pode ter falhado silenciosamente.");
            }

            console.info(`[EquipamentoModel] Equipamento cadastrado com sucesso. ID: ${resultado.rows[0].id_equipamento}`);
            return true;
        } catch (error) {
            console.error("[EquipamentoModel] Erro ao cadastrar equipamento:", error);
            throw error;
        }
    }

    static async atualizarEquipamento(equipamento: EquipamentoDTO): Promise<boolean> {
        try {
            if (!equipamento.idEquipamento) {
                throw new Error("idEquipamento é obrigatório para atualização.");
            }

            await Equipamento.listarEquipamento(equipamento.idEquipamento);

            const query = `
                UPDATE equipamento SET
                    id_cliente = $1,
                    tipo = $2,
                    marca = $3,
                    modelo = $4
                WHERE id_equipamento = $5;
            `;

            const valores = [
                equipamento.idCliente ?? null,
                equipamento.tipo.trim(),
                equipamento.marca.trim(),
                equipamento.modelo.trim(),
                equipamento.idEquipamento
            ];

            const respostaBD = await database.query(query, valores);
            return (respostaBD.rowCount ?? 0) > 0;
        } catch (error) {
            console.error(`[EquipamentoModel] Erro ao atualizar equipamento (id: ${equipamento.idEquipamento}):`, error);
            throw error;
        }
    }

    static async removerEquipamento(idEquipamento: number): Promise<boolean> {
        try {
            await Equipamento.listarEquipamento(idEquipamento);

            await database.query(`DELETE FROM agendamento WHERE id_equipamento = $1;`, [idEquipamento]);

            const respostaBD = await database.query(
                `DELETE FROM equipamento WHERE id_equipamento = $1;`,
                [idEquipamento]
            );

            return (respostaBD.rowCount ?? 0) > 0;
        } catch (error) {
            console.error(`[EquipamentoModel] Erro ao remover equipamento (id: ${idEquipamento}):`, error);
            throw error;
        }
    }
}

export default Equipamento;
