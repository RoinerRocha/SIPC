import { Request, Response } from "express";
import { QueryTypes } from "sequelize";
import sequelize from "../database/SqlServer";

export const getAllProvince = async (req: Request, res: Response): Promise<void> => {
    try {
        const requirement = await sequelize.query(
            "EXEC sp_obtener_ubicacion", // Agregamos @id_persona
            {
                type: QueryTypes.SELECT, // Tipo de operación SELECT
            }
        );

        res.status(200).json({ message: "Listado de Provincias", data: requirement });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getCantonByProvince = async (req: Request, res: Response): Promise<void> => {
    const { provincia } = req.params;

    try {
        const ubication = await sequelize.query(
            `EXEC sp_obtener_ubicacion @provincia = :provincia`,
            {
                replacements: { provincia },
                type: QueryTypes.SELECT
            }
        );

        if (!ubication.length) {
            res.status(404).json({ message: "Cantones no encontrados" });
            return;
        }

        res.status(200).json({ data: ubication });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getDistrictByProvinciaCanton = async (req: Request, res: Response): Promise<void> => {
    const { provincia, canton } = req.params;

    try {
        const ubication = await sequelize.query(
            `EXEC sp_obtener_ubicacion  @provincia = :provincia, @canton = :canton`,
            {
                replacements: { provincia, canton },
                type: QueryTypes.SELECT
            }
        );

        if (!ubication.length) {
            res.status(404).json({ message: "Distritos no encontrados" });
            return;
        }

        res.status(200).json({ data: ubication });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getNeighborhoodByProvinciaCantonDistrict = async (req: Request, res: Response): Promise<void> => {
    const { provincia, canton, distrito } = req.params;

    try {
        const ubication = await sequelize.query(
            `EXEC sp_obtener_ubicacion  @provincia = :provincia, @canton = :canton, @distrito = :distrito`,
            {
                replacements: { provincia, canton, distrito },
                type: QueryTypes.SELECT
            }
        );

        if (!ubication.length) {
            res.status(404).json({ message: "Barrios no encontrados" });
            return;
        }

        res.status(200).json({ data: ubication });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

