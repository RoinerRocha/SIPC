import { Request, Response } from "express";
import { QueryTypes } from "sequelize";
import sequelize from "../database/SqlServer";

export const createFamilyMember = async (req: Request, res: Response): Promise<void> => {
    const { idpersona, cedula, nombre_completo, fecha_nacimiento, relacion, ingresos, observaciones } = req.body;

    try {
        await sequelize.query(
            `EXEC sp_gestion_nucleo_familiar @opcion = 'I',
                                   @idpersona = :idpersona,
                                   @cedula = :cedula,
                                   @nombre_completo = :nombre_completo,
                                   @fecha_nacimiento = :fecha_nacimiento,
                                   @relacion = :relacion,
                                   @ingresos = :ingresos,
                                   @observaciones = :observaciones`,
            {
                replacements: { idpersona, cedula, nombre_completo, fecha_nacimiento, relacion, ingresos, observaciones },
                type: QueryTypes.INSERT,
            }
        );

        res.status(201).json({ message: "Integrante familiar creado exitosamente" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateMember = async (req: Request, res: Response): Promise<void> => {
    const { idnucleo } = req.params;
    const {
        cedula,
        nombre_completo,
        fecha_nacimiento,
        relacion,
        ingresos,
        observaciones,
    } = req.body;

    try {
        await sequelize.query(
            `EXEC sp_gestion_nucleo_familiar @opcion = 'U',
                                @idnucleo = :idnucleo,
                                @cedula = :cedula,
                                @nombre_completo = :nombre_completo,
                                @fecha_nacimiento = :fecha_nacimiento,
                                @relacion = :relacion,
                                @ingresos = :ingresos,
                                @observaciones = :observaciones`,
            {
                replacements: {
                    idnucleo,
                    cedula,
                    nombre_completo,
                    fecha_nacimiento,
                    relacion,
                    ingresos,
                    observaciones
                },
                type: QueryTypes.UPDATE
            }
        );

        res.status(200).json({ message: "Miembro familiar actualizado exitosamente" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteMember = async (req: Request, res: Response): Promise<void> => {
    const { idnucleo } = req.params;
  
    try {
      // Ejecuta el procedimiento almacenado con el tipo de acción 'D'
      await sequelize.query(
        `EXEC sp_gestion_nucleo_familiar 
        @opcion = 'D', 
        @idnucleo = :idnucleo`,
        {
          replacements: {
            tipo_accion: 'D', // Define la acción para desactivar la persona
            idnucleo: parseInt(idnucleo, 10) // Convierte id_persona a número si es necesario
          },
          type: QueryTypes.DELETE
        }
      );
  
      res.status(200).json({ message: "Miembro familiar eliminado exitosamente" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

export const getMemberByPerson = async (req: Request, res: Response): Promise<void> => {
    const { idpersona } = req.params;

    try {
        const contactos = await sequelize.query(
            `EXEC sp_gestion_nucleo_familiar @opcion = 'Q', @idpersona = :idpersona`,
            {
                replacements: { idpersona },
                type: QueryTypes.SELECT,
            }
        );

        if (!contactos.length) {
            res.status(404).json({ message: "No se encontraron familiares para esta persona" });
            return;
        }

        res.status(200).json({ data: contactos });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getMemberByID = async (req: Request, res: Response): Promise<void> => {
    const { idnucleo } = req.params;

    try {
        const miembro = await sequelize.query(
            `EXEC sp_gestion_nucleo_familiar @opcion = 'S', @idnucleo = :idnucleo`,
            {
                replacements: { idnucleo },
                type: QueryTypes.SELECT
            }
        );

        if (!miembro.length) {
            res.status(404).json({ message: "Miembro no encontrado" });
            return;
        }

        res.status(200).json({ data: miembro[0] });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
