import { Request, Response } from "express";
import { QueryTypes } from "sequelize";
import sequelize from "../database/SqlServer";

export const getAllStateFiles = async (req: Request, res: Response): Promise<void> => {
    try {
        const stateFiles = await sequelize.query(
            "EXEC sp_gestion_estado_expediente @accion = 'A'", // Agregamos @id_persona
            {
                type: QueryTypes.SELECT, // Tipo de operación SELECT
            }
        );

        res.status(200).json({ message: "Listado de Estadios de expedientes", data: stateFiles });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};