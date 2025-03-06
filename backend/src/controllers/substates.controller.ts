import { Request, Response } from "express";
import { QueryTypes } from "sequelize";
import sequelize from "../database/SqlServer";

export const getAllCompanySituation = async (req: Request, res: Response): Promise<void> => {
    try {
        const files = await sequelize.query(
            "EXEC sp_gestion_subestados_expediente @accion = 'A'",
            {
                type: QueryTypes.SELECT, // Tipo de operación SELECT
            }
        );

        res.status(200).json({ message: "Situacion Empresa exitoso", data: files });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getAllCompanyProgram = async (req: Request, res: Response): Promise<void> => {
    try {
        const files = await sequelize.query(
            "EXEC sp_gestion_subestados_expediente @accion = 'B'",
            {
                type: QueryTypes.SELECT, // Tipo de operación SELECT
            }
        );

        res.status(200).json({ message: "Programa Empresa exitoso", data: files });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getAllBanhviState = async (req: Request, res: Response): Promise<void> => {
    try {
        const files = await sequelize.query(
            "EXEC sp_gestion_subestados_expediente @accion = 'C'",
            {
                type: QueryTypes.SELECT, // Tipo de operación SELECT
            }
        );

        res.status(200).json({ message: "Estado Banhvi exitoso", data: files });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getAllBanhviPurpose = async (req: Request, res: Response): Promise<void> => {
    try {
        const files = await sequelize.query(
            "EXEC sp_gestion_subestados_expediente @accion = 'D'",
            {
                type: QueryTypes.SELECT, // Tipo de operación SELECT
            }
        );

        res.status(200).json({ message: "Proposito Banhvi exitoso", data: files });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};