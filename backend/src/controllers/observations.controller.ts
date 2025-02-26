import { Request, Response } from "express";
import { QueryTypes } from "sequelize";
import sequelize from "../database/SqlServer";

export const createObservations = async (req: Request, res: Response): Promise<void> => {
    const { id_persona, identificacion, fecha, observacion} = req.body;

    try {
        await sequelize.query(
          `EXEC sp_gestionar_observaciones @accion = 'I',
                                     @id_persona = :id_persona,
                                     @identificacion = :identificacion,
                                     @fecha = :fecha,
                                     @observacion = :observacion`,
          {
            replacements: { id_persona, identificacion, fecha, observacion },
            type: QueryTypes.INSERT,
          }
        );
    
        res.status(201).json({ message: "Obversacion creada exitosamente" });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
}

export const getObservationsByIDPerson = async (req: Request, res: Response): Promise<void> => {
    const { id_persona } = req.params;
  
    try {
      const persons = await sequelize.query(
        `EXEC sp_gestionar_observaciones @accion = 'Q', @id_persona = :id_persona, @identificacion = NULL`,
        {
          replacements: { id_persona },
          type: QueryTypes.SELECT,
        }
      );
  
      if (!persons.length) {
        res.status(404).json({ message: "No se encontraron observaciones para esta persona" });
        return;
      }
  
      res.status(200).json({ data: persons });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  export const getObservationByPerson = async (req: Request, res: Response): Promise<void> => {
    const { identificacion } = req.params;
  
    try {
      const persons = await sequelize.query(
        `EXEC sp_gestionar_observaciones @accion = 'S', @identificacion = :identificacion`,
        {
          replacements: { identificacion },
          type: QueryTypes.SELECT,
        }
      );
  
      if (!persons.length) {
        res.status(404).json({ message: "No se encontraron observaciones para esta identificacion" });
        return;
      }
  
      res.status(200).json({ data: persons });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  export const getAllObservations = async (req: Request, res: Response): Promise<void> => {
    try {
        const persons = await sequelize.query(
            "EXEC sp_gestionar_observaciones @accion = 'G', @id_persona = NULL, @identificacion = NULL", // Agregamos @id_persona
            {
                type: QueryTypes.SELECT, // Tipo de operación SELECT
            }
        );

        res.status(200).json({ message: "Listado de observacioens creadas", data: persons });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};