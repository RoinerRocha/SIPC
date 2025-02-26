import { Request, Response } from "express";
import { QueryTypes } from "sequelize";
import sequelize from "../database/SqlServer";

export const createReferral = async (req: Request, res: Response): Promise<void> => {
    const { fecha_preparacion, fecha_envio, usuario_prepara, entidad_destino, estado } = req.body;

    try {
        await sequelize.query(
            `EXEC sp_gestion_maestro_remision @accion = 'I',
                                   @fecha_preparacion = :fecha_preparacion,
                                   @fecha_envio = :fecha_envio,
                                   @usuario_prepara = :usuario_prepara,
                                   @entidad_destino = :entidad_destino,
                                   @estado = :estado`,
            {
                replacements: { fecha_preparacion, fecha_envio, usuario_prepara, entidad_destino, estado },
                type: QueryTypes.INSERT,
            }
        );

        res.status(201).json({ message: "Remision creado exitosamente" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};


export const updateReferrals = async (req: Request, res: Response): Promise<void> => {
    const { id_remision } = req.params;
    const {
        estado,
        entidad_destino,
    } = req.body;

    try {
        await sequelize.query(
            `EXEC sp_gestion_maestro_remision @accion = 'U',
                                @id_remision = :id_remision,
                                @estado = :estado,
                                @entidad_destino = :entidad_destino`,
            {
                replacements: {
                    id_remision,
                    estado,
                    entidad_destino
                },
                type: QueryTypes.UPDATE
            }
        );

        res.status(200).json({ message: "Remision actualizada exitosamente" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};



export const getReferralsById = async (req: Request, res: Response): Promise<void> => {
    const { id_remision } = req.params;

    try {
        const contact = await sequelize.query(
            `EXEC sp_gestion_maestro_remision @accion = 'Q', @id_remision = :id_remision`,
            {
                replacements: { id_remision },
                type: QueryTypes.SELECT
            }
        );

        if (!contact.length) {
            res.status(404).json({ message: "Remision no encontrada" });
            return;
        }

        res.status(200).json({ data: contact[0] });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getAllReferrals = async (req: Request, res: Response): Promise<void> => {
    try {
        const requirement = await sequelize.query(
            "EXEC sp_gestion_maestro_remision @accion = 'A' ", // Agregamos @id_persona
            {
                type: QueryTypes.SELECT, // Tipo de operación SELECT
            }
        );

        res.status(200).json({ message: "Listado de remisiones exitoso", data: requirement });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
