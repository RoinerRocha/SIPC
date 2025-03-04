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

export const getStateFilesByGroup = async (req: Request, res: Response): Promise<void> => {
    const { grupo } = req.params;

    try {
        const group = await sequelize.query(
            `EXEC sp_gestion_estado_expediente @accion = 'Q', @grupo = :grupo`,
            {
                replacements: { grupo },
                type: QueryTypes.SELECT,
            }
        );

        if (!group.length) {
            res.status(404).json({ message: "No se encontraron estados para este grupo" });
            return;
        }

        res.status(200).json({ data: group });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};