import { Request, Response } from "express";
import statesModel from "../models/states";
import { QueryTypes } from "sequelize"; 
import sequelize from "../database/SqlServer";

export const saveStates = async (req: Request, res: Response): Promise<void> => {
    const { estado } = req.body;
  
    try {
      await sequelize.query(
        "EXEC sp_gestion_estados @Action = 'I',  @estado = :estado",
        {
          replacements: {
            estado,
          },
          type: QueryTypes.INSERT, // Tipo de operación, ya que estamos insertando un nuevo rol
        }
      );
  
      res.status(201).json({ message: "Estado creado exitosamente" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
};

export const getStates = async (req: Request, res: Response): Promise<void> => {
    try {
      const estados = await sequelize.query(
        "EXEC sp_gestion_estados @Action = 'Q'",
        {
          type: QueryTypes.SELECT, // Tipo de operación SELECT
        }
      );
  
      res.status(200).json({ message: "Listado de estados exitoso", data: estados });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
};
  