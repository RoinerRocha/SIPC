import { Request, Response } from "express";
import { QueryTypes } from "sequelize";
import sequelize from "../database/SqlServer";

export const createNormalizers = async (req: Request, res: Response): Promise<void> => {
    const { nombre, tipo, empresa, estado, fecha_registro } = req.body;

    try {
        await sequelize.query(
            `EXEC sp_gestion_normalizadores @accion = 'I',
                                     @nombre = :nombre,
                                     @tipo = :tipo,
                                     @empresa = :empresa,
                                     @estado = :estado,
                                     @fecha_registro = :fecha_registro`,
            {
                replacements: { nombre, tipo, empresa, estado, fecha_registro },
                type: QueryTypes.INSERT,
            }
        );

        res.status(201).json({ message: "Normalizacion creada exitosamente" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateNormalizers = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const {
        nombre,
        tipo,
        empresa,
        estado,
        fecha_registro,
    } = req.body;

    try {
        await sequelize.query(
            `EXEC sp_gestion_normalizadores @accion = 'U',
                                @id = :id,
                                @nombre = :nombre,
                                @tipo = :tipo,
                                @empresa = :empresa,
                                @estado = :estado,
                                @fecha_registro = :fecha_registro`,
            {
                replacements: {
                    id,
                    nombre,
                    tipo,
                    empresa,
                    estado,
                    fecha_registro
                },
                type: QueryTypes.UPDATE
            }
        );

        res.status(200).json({ message: "Normalizador actualizado exitosamente" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};


export const getNormalizersById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        const normalizer = await sequelize.query(
            `EXEC sp_gestion_normalizadores @accion = 'Q', @id = :id`,
            {
                replacements: { id },
                type: QueryTypes.SELECT
            }
        );

        if (!normalizer.length) {
            res.status(404).json({ message: "Normalizacion no encontrada" });
            return;
        }

        res.status(200).json({ data: normalizer[0] });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getAllNormalizers = async (req: Request, res: Response): Promise<void> => {
    try {
        const normalizer = await sequelize.query(
            "EXEC sp_gestion_normalizadores @accion = 'A' ", // Agregamos @id_persona
            {
                type: QueryTypes.SELECT, // Tipo de operación SELECT
            }
        );

        res.status(200).json({ message: "Listado de normalizaciones", data: normalizer });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};


export const getNormalizeByCompany = async (req: Request, res: Response): Promise<void> => {
    const { empresa } = req.params;

    try {
        const company = await sequelize.query(
            `EXEC sp_gestion_normalizadores @accion = 'S', @empresa = :empresa`,
            {
                replacements: { empresa },
                type: QueryTypes.SELECT,
            }
        );

        if (!company.length) {
            res.status(404).json({ message: "No se encontraron Normalizaciones para esta compania" });
            return;
        }

        res.status(200).json({ data: company });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getUniqueCompanies = async (req: Request, res: Response): Promise<void> => {
    try {
        const companies = await sequelize.query(
            `EXEC sp_gestion_normalizadores @accion = 'E'`,
            {
                type: QueryTypes.SELECT,
            }
        );

        res.status(200).json({ message: "Lista de empresas únicas", data: companies });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getFiscalesAndIngenierosByEmpresa = async (req: Request, res: Response): Promise<void> => {
    const { empresa } = req.params;

    try {
        const results = await sequelize.query(
            `EXEC sp_gestion_normalizadores @accion = 'F', @empresa = :empresa`,
            {
                replacements: { empresa },
                type: QueryTypes.SELECT,
            }
        );

        res.status(200).json({ message: "Fiscales e ingenieros obtenidos", data: results });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
