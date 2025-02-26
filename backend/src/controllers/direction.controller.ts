import { Request, Response } from "express";
import { QueryTypes } from "sequelize";
import sequelize from "../database/SqlServer";

// Crear una nueva dirección
export const createDireccion = async (req: Request, res: Response): Promise<void> => {
  const { id_persona, provincia, canton, distrito, barrio, otras_senas, tipo_direccion, estado } = req.body;

  try {
    await sequelize.query(
      `EXEC sp_gestion_direccion @accion = 'I',
                                 @id_persona = :id_persona,
                                 @provincia = :provincia,
                                 @canton = :canton,
                                 @distrito = :distrito,
                                 @barrio = :barrio,
                                 @otras_senas = :otras_senas,
                                 @tipo_direccion = :tipo_direccion,
                                 @estado = :estado`,
      {
        replacements: { id_persona, provincia, canton, distrito, barrio, otras_senas, tipo_direccion, estado },
        type: QueryTypes.INSERT,
      }
    );

    res.status(201).json({ message: "Dirección creada exitosamente" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar una dirección
export const updateDireccion = async (req: Request, res: Response): Promise<void> => {
  const { id_direccion } = req.params;
  const { provincia, canton, distrito, barrio, otras_senas, tipo_direccion, estado } = req.body;

  try {
    await sequelize.query(
      `EXEC sp_gestion_direccion @accion = 'U',
                                 @id_direccion = :id_direccion,
                                 @provincia = :provincia,
                                 @canton = :canton,
                                 @distrito = :distrito,
                                 @barrio = :barrio,
                                 @otras_senas = :otras_senas,
                                 @tipo_direccion = :tipo_direccion,
                                 @estado = :estado`,
      {
        replacements: { id_direccion, provincia, canton, distrito, barrio, otras_senas, tipo_direccion, estado },
        type: QueryTypes.UPDATE,
      }
    );

    res.status(200).json({ message: "Dirección actualizada exitosamente" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Desactivar una dirección
export const deleteDireccion = async (req: Request, res: Response): Promise<void> => {
    const { id_direccion } = req.params;
  
    try {
      // Ejecuta el procedimiento almacenado con el tipo de acción 'D'
      await sequelize.query(
        `EXEC sp_gestion_direccion 
        @accion = 'D', 
        @id_direccion = :id_direccion`,
        {
          replacements: {
            tipo_accion: 'D', // Define la acción para desactivar la persona
            id_direccion: parseInt(id_direccion, 10) // Convierte id_persona a número si es necesario
          },
          type: QueryTypes.UPDATE
        }
      );
  
      res.status(200).json({ message: "Persona desactivada exitosamente" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
};

// Obtener direcciones por ID de persona
export const getDireccionesByPersona = async (req: Request, res: Response): Promise<void> => {
  const { id_persona } = req.params;

  try {
    const direcciones = await sequelize.query(
      `EXEC sp_gestion_direccion @accion = 'Q', @id_persona = :id_persona`,
      {
        replacements: { id_persona },
        type: QueryTypes.SELECT,
      }
    );

    if (!direcciones.length) {
      res.status(404).json({ message: "No se encontraron direcciones para esta persona" });
      return;
    }

    res.status(200).json({ data: direcciones });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getDireccionesByID = async (req: Request, res: Response): Promise<void> => {
  const { id_direccion } = req.params;

  try {
    const direccion = await sequelize.query(
      `EXEC sp_gestion_direccion @accion = 'G', @id_direccion = :id_direccion`,
      {
        replacements: { id_direccion },
        type: QueryTypes.SELECT
      }
    );

    if (!direccion.length) {
      res.status(404).json({ message: "Direccion no encontrada" });
      return;
    }

    res.status(200).json({ data: direccion[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllDirections = async (req: Request, res: Response): Promise<void> => {
    try {
        const persons = await sequelize.query(
            "EXEC sp_gestion_direccion @accion = 'S', @id_persona = NULL", // Agregamos @id_persona
            {
                type: QueryTypes.SELECT, // Tipo de operación SELECT
            }
        );

        res.status(200).json({ message: "Listado de roles exitoso", data: persons });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};


