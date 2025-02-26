import { Request, Response } from "express";
import { QueryTypes } from "sequelize";
import sequelize from "../database/SqlServer";
import fs from "fs";
import path from "path";
import multer from "multer";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const id_persona = req.body.id_persona;
        const documentosPath = path.join(__dirname, "../../Documentos", id_persona.toString());

        if (!fs.existsSync(documentosPath)) {
            fs.mkdirSync(documentosPath, { recursive: true });
        }

        cb(null, documentosPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
    },
});

export const upload = multer({ storage }).single("archivo");


export const createRequirements = async (req: Request, res: Response): Promise<void> => {
    const { id_persona, tipo_requisito, estado, fecha_vigencia, fecha_vencimiento, observaciones, archivo } = req.body;

    let archivoPath = null;

    if (req.file) {
        archivoPath = path.join("Documentos", id_persona.toString(), req.file.filename);
    }


    try {
        await sequelize.query(
            `EXEC sp_gestion_requisitos @accion = 'I',
                                   @id_persona = :id_persona,
                                   @tipo_requisito = :tipo_requisito,
                                   @estado = :estado,
                                   @fecha_vigencia = :fecha_vigencia,
                                   @fecha_vencimiento = :fecha_vencimiento,
                                   @observaciones = :observaciones,
                                   @archivo = :archivo`,
            {
                replacements: { id_persona, tipo_requisito, estado, fecha_vigencia, fecha_vencimiento, observaciones, archivo: archivoPath },
                type: QueryTypes.INSERT,
            }
        );

        res.status(201).json({ message: "Requisito creado exitosamente" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateRequirements = async (req: Request, res: Response): Promise<void> => {
    const { id_requisito } = req.params;
    const {
        estado,
        fecha_vigencia,
        fecha_vencimiento,
        observaciones,
    } = req.body;

    try {
        await sequelize.query(
            `EXEC sp_gestion_requisitos @accion = 'U',
                                @id_requisito = :id_requisito,
                                @identificacion = NULL,
                                @estado = :estado,
                                @fecha_vigencia = :fecha_vigencia,
                                @fecha_vencimiento = :fecha_vencimiento,
                                @observaciones = :observaciones`,
            {
                replacements: {
                    id_requisito,
                    estado,
                    fecha_vigencia,
                    fecha_vencimiento,
                    observaciones
                },
                type: QueryTypes.UPDATE
            }
        );

        res.status(200).json({ message: "Requisito actualizado exitosamente" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getRequirementsByPerson = async (req: Request, res: Response): Promise<void> => {
    const { id_persona } = req.params;

    try {
        const miembro = await sequelize.query(
            `EXEC sp_gestion_requisitos @accion = 'Q', @id_persona = :id_persona, @identificacion = NULL`,
            {
                replacements: { id_persona },
                type: QueryTypes.SELECT
            }
        );

        if (!miembro.length) {
            res.status(404).json({ message: "Requisito no encontrado" });
            return;
        }

        // Devuelve todos los resultados en lugar del primero
        res.status(200).json({ data: miembro });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getRequirementsById = async (req: Request, res: Response): Promise<void> => {
    const { id_requisito } = req.params;

    try {
        const contact = await sequelize.query(
            `EXEC sp_gestion_requisitos @accion = 'S', @id_requisito = :id_requisito`,
            {
                replacements: { id_requisito },
                type: QueryTypes.SELECT
            }
        );

        if (!contact.length) {
            res.status(404).json({ message: "Requisito no encontrada" });
            return;
        }

        res.status(200).json({ data: contact[0] });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getRequirementsByIdentification = async (req: Request, res: Response): Promise<void> => {
    const { identificacion } = req.params;

    try {
        const miembro = await sequelize.query(
            `EXEC sp_gestion_requisitos @accion = 'G', @identificacion = :identificacion`,
            {
                replacements: { identificacion },
                type: QueryTypes.SELECT
            }
        );

        if (!miembro.length) {
            res.status(404).json({ message: "Requisito no encontrado para esta persona" });
            return;
        }

        // Devuelve todos los resultados en lugar del primero
        res.status(200).json({ data: miembro });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getAllRequirements = async (req: Request, res: Response): Promise<void> => {
    try {
        const requirement = await sequelize.query(
            "EXEC sp_gestion_requisitos @accion = 'A', @id_requisito = NULL, @id_persona = NULL, @identificacion = NULL", // Agregamos @id_persona
            {
                type: QueryTypes.SELECT, // Tipo de operación SELECT
            }
        );

        res.status(200).json({ message: "Listado de requisitos exitoso", data: requirement });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getAllBaseRequirements = async (req: Request, res: Response): Promise<void> => {
    try {
        const requirement = await sequelize.query(
            "EXEC sp_gestion_requisitos @accion = 'X'", // Agregamos @id_persona
            {
                type: QueryTypes.SELECT, // Tipo de operación SELECT
            }
        );

        res.status(200).json({ message: "Listado de requisitos base exitoso", data: requirement });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

