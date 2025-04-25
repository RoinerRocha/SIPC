import { Request, Response } from "express";
import { QueryTypes } from "sequelize";
import sequelize from "../database/SqlServer";

export const createReferralDetails = async (req: Request, res: Response): Promise<void> => {
    const { id_remision, identificacion, tipo_documento, estado, observaciones } = req.body;

    try {
        await sequelize.query(
            `EXEC sp_gestion_detalle_remision @accion = 'I',
                                   @id_remision = :id_remision,
                                   @identificacion = :identificacion,
                                   @tipo_documento = :tipo_documento,
                                   @estado = :estado,
                                   @observaciones = :observaciones`,
            {
                replacements: { id_remision, identificacion, tipo_documento, estado, observaciones },
                type: QueryTypes.INSERT,
            }
        );

        res.status(201).json({ message: "Detalle de remision creado exitosamente" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateReferralsDetails = async (req: Request, res: Response): Promise<void> => {
    const { id_dremision } = req.params;
    const {
        estado,
        observaciones,
    } = req.body;

    try {
        await sequelize.query(
            `EXEC sp_gestion_detalle_remision @accion = 'U',
                                @id_dremision = :id_dremision,
                                @estado = :estado,
                                @observaciones = :observaciones`,
            {
                replacements: {
                    id_dremision,
                    estado,
                    observaciones
                },
                type: QueryTypes.UPDATE
            }
        );

        res.status(200).json({ message: "Detalle actualizado exitosamente" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getReferralsDetailsById = async (req: Request, res: Response): Promise<void> => {
    const { id_dremision } = req.params;

    try {
        const contact = await sequelize.query(
            `EXEC sp_gestion_detalle_remision @accion = 'Q', @id_dremision = :id_dremision`,
            {
                replacements: { id_dremision },
                type: QueryTypes.SELECT
            }
        );

        if (!contact.length) {
            res.status(404).json({ message: "Detalle no encontrado" });
            return;
        }

        res.status(200).json({ data: contact[0] });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getReferralsDetailsByIdRemision = async (req: Request, res: Response): Promise<void> => {
    const { id_remision } = req.params;

    try {
        const contactos = await sequelize.query(
            `EXEC sp_gestion_detalle_remision @accion = 'S', @id_remision = :id_remision`,
            {
                replacements: { id_remision },
                type: QueryTypes.SELECT,
            }
        );

        if (!contactos.length) {
            res.status(404).json({ message: "No se encontraron detalles para esta remision" });
            return;
        }

        res.status(200).json({ data: contactos });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getColumnLimits = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await sequelize.query(
            `
        SELECT COLUMN_NAME, CHARACTER_MAXIMUM_LENGTH 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'detalle_remision' 
          AND COLUMN_NAME IN ('identificacion', 'observaciones')
        `,
            {
                type: QueryTypes.SELECT,
            }
        );

        // Aseguramos el tipo correcto
        const limits: Record<string, number> = {};
        (result as { COLUMN_NAME: string; CHARACTER_MAXIMUM_LENGTH: number }[]).forEach(row => {
            limits[row.COLUMN_NAME] = row.CHARACTER_MAXIMUM_LENGTH;
        });

        res.status(200).json(limits);
    } catch (error: any) {
        console.error("Error al obtener límites de columnas:", error);
        res.status(500).json({ error: 'Error interno' });
    }
};
