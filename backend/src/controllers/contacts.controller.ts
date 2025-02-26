import { Request, Response } from "express";
import { QueryTypes } from "sequelize";
import sequelize from "../database/SqlServer";

// Crear una nueva dirección
export const createContact = async (req: Request, res: Response): Promise<void> => {
    const { id_persona, tipo_contacto, identificador, estado, fecha_registro, comentarios } = req.body;
  
    try {
      await sequelize.query(
        `EXEC sp_gestion_contactos @accion = 'I',
                                   @id_persona = :id_persona,
                                   @tipo_contacto = :tipo_contacto,
                                   @identificador = :identificador,
                                   @estado = :estado,
                                   @fecha_registro = :fecha_registro,
                                   @comentarios = :comentarios`,
        {
          replacements: { id_persona, tipo_contacto, identificador, estado, fecha_registro, comentarios  },
          type: QueryTypes.INSERT,
        }
      );
  
      res.status(201).json({ message: "Contacto creado exitosamente" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
  
  // Actualizar una dirección
  export const updateContacts = async (req: Request, res: Response): Promise<void> => {
    const { id_contacto } = req.params;
    const { tipo_contacto, identificador, estado, comentarios } = req.body;
  
    try {
      await sequelize.query(
        `EXEC sp_gestion_contactos @accion = 'U',
                                   @id_contacto = :id_contacto,
                                   @tipo_contacto = :tipo_contacto,
                                   @identificador = :identificador,
                                   @estado = :estado,
                                   @comentarios = :comentarios`,
        {
          replacements: { id_contacto, tipo_contacto, identificador, estado, comentarios },
          type: QueryTypes.UPDATE,
        }
      );
  
      res.status(200).json({ message: "Contacto actualizado exitosamente" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
  
  // Desactivar una dirección
  export const deleteContacts = async (req: Request, res: Response): Promise<void> => {
      const { id_contacto } = req.params;
    
      try {
        // Ejecuta el procedimiento almacenado con el tipo de acción 'D'
        await sequelize.query(
          `EXEC sp_gestion_contactos 
          @accion = 'D', 
          @id_contacto = :id_contacto`,
          {
            replacements: {
              tipo_accion: 'D', // Define la acción para desactivar la persona
              id_contacto: parseInt(id_contacto, 10) // Convierte id_persona a número si es necesario
            },
            type: QueryTypes.UPDATE
          }
        );
    
        res.status(200).json({ message: "Contacto desactivado exitosamente" });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
  };
  
  // Obtener direcciones por ID de persona
  export const getContactsByPerson = async (req: Request, res: Response): Promise<void> => {
    const { id_persona } = req.params;
  
    try {
      const contactos = await sequelize.query(
        `EXEC sp_gestion_contactos @accion = 'Q', @id_persona = :id_persona`,
        {
          replacements: { id_persona },
          type: QueryTypes.SELECT,
        }
      );
  
      if (!contactos.length) {
        res.status(404).json({ message: "No se encontraron contactos para esta persona" });
        return;
      }
  
      res.status(200).json({ data: contactos });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  export const getContactsByID = async (req: Request, res: Response): Promise<void> => {
    const { id_contacto } = req.params;
  
    try {
      const contact = await sequelize.query(
        `EXEC sp_gestion_contactos @accion = 'G', @id_contacto = :id_contacto`,
        {
          replacements: { id_contacto },
          type: QueryTypes.SELECT
        }
      );
  
      if (!contact.length) {
        res.status(404).json({ message: "Contacto no encontrada" });
        return;
      }
  
      res.status(200).json({ data: contact[0] });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
  
  export const getAllContacts = async (req: Request, res: Response): Promise<void> => {
      try {
          const persons = await sequelize.query(
              "EXEC sp_gestion_contactos @accion = 'S', @id_persona = NULL", // Agregamos @id_persona
              {
                  type: QueryTypes.SELECT, // Tipo de operación SELECT
              }
          );
  
          res.status(200).json({ message: "Listado de roles exitoso", data: persons });
      } catch (error: any) {
          res.status(500).json({ error: error.message });
      }
  };
  