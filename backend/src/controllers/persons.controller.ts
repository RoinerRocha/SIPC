import { Request, Response } from "express";
import { QueryTypes } from "sequelize";
import fs from "fs";
import path from "path";
import sequelize from "../database/SqlServer";

// Crear una nueva persona
export const createPerson = async (req: Request, res: Response): Promise<void> => {
  const {
    id_persona,
    tipo_identificacion,
    numero_identifiacion,
    nombre,
    primer_apellido,
    segundo_apellido,
    fecha_nacimiento,
    genero,
    estado_civil,
    nacionalidad,
    fecha_registro,
    usuario_registro,
    nivel_estudios,
    asesor,
    discapacidad
  } = req.body;

  try {
    await sequelize.query(
      `EXEC sp_gestion_persona @tipo_accion = 'I',
                              @id_persona = :id_persona,
                              @tipo_identificacion = :tipo_identificacion,
                              @numero_identifiacion = :numero_identifiacion,
                              @nombre = :nombre,
                              @primer_apellido = :primer_apellido,
                              @segundo_apellido = :segundo_apellido,
                              @fecha_nacimiento = :fecha_nacimiento,
                              @genero = :genero,
                              @estado_civil = :estado_civil,
                              @nacionalidad = :nacionalidad,
                              @fecha_registro = :fecha_registro,
                              @usuario_registro = :usuario_registro,
                              @nivel_estudios = :nivel_estudios,
                              @asesor = :asesor,
                              @discapacidad = :discapacidad`,
      {
        replacements: {
          id_persona,
          tipo_identificacion,
          numero_identifiacion,
          nombre,
          primer_apellido,
          segundo_apellido,
          fecha_nacimiento,
          genero,
          estado_civil,
          nacionalidad,
          fecha_registro,
          usuario_registro,
          nivel_estudios,
          asesor,
          discapacidad
        },
        type: QueryTypes.INSERT
      }
    );
    const documentosPath = path.join(__dirname, "../../Documentos", id_persona.toString());

    if (!fs.existsSync(documentosPath)) {
      fs.mkdirSync(documentosPath, { recursive: true });
    }

    res.status(201).json({ message: "Persona creada exitosamente" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar una persona
export const updatePerson = async (req: Request, res: Response): Promise<void> => {
  const { id_persona, usuario_sistema } = req.params;
  const {
    tipo_identificacion,
    numero_identifiacion,
    nombre,
    primer_apellido,
    segundo_apellido,
    fecha_nacimiento,
    genero,
    estado_civil,
    nacionalidad,
    fecha_registro,
    usuario_registro,
    nivel_estudios,
    asesor,
    discapacidad
  } = req.body;

  try {
    await sequelize.query(
      `EXEC sp_gestion_persona @tipo_accion = 'U',
                              @id_persona = :id_persona,
                              @tipo_identificacion = :tipo_identificacion,
                              @numero_identifiacion = :numero_identifiacion,
                              @nombre = :nombre,
                              @primer_apellido = :primer_apellido,
                              @segundo_apellido = :segundo_apellido,
                              @fecha_nacimiento = :fecha_nacimiento,
                              @genero = :genero,
                              @estado_civil = :estado_civil,
                              @nacionalidad = :nacionalidad,
                              @fecha_registro = :fecha_registro,
                              @usuario_registro = :usuario_registro,
                              @nivel_estudios = :nivel_estudios,
                              @asesor = :asesor,
                              @discapacidad = :discapacidad,
                              @usuario_sistema = :usuario_sistema`,
      {
        replacements: {
          id_persona,
          tipo_identificacion,
          numero_identifiacion,
          nombre,
          primer_apellido,
          segundo_apellido,
          fecha_nacimiento,
          genero,
          estado_civil,
          nacionalidad,
          fecha_registro,
          usuario_registro,
          nivel_estudios,
          asesor,
          discapacidad,
          usuario_sistema
        },
        type: QueryTypes.UPDATE
      }
    );

    res.status(200).json({ message: "Persona actualizada exitosamente" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar (desactivar) una persona
export const deletePerson = async (req: Request, res: Response): Promise<void> => {
    const { id_persona } = req.params;
  
    try {
      // Ejecuta el procedimiento almacenado con el tipo de acción 'D'
      await sequelize.query(
        `EXEC sp_gestion_persona 
        @tipo_accion = 'D', 
        @id_persona = :id_persona`,
        {
          replacements: {
            tipo_accion: 'D', // Define la acción para desactivar la persona
            id_persona: parseInt(id_persona, 10) // Convierte id_persona a número si es necesario
          },
          type: QueryTypes.UPDATE
        }
      );
  
      res.status(200).json({ message: "Persona desactivada exitosamente" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

export const getAllPersons = async (req: Request, res: Response): Promise<void> => {
    try {
        const persons = await sequelize.query(
            "EXEC sp_gestion_persona @tipo_accion = 'S', @id_persona = NULL", // Agregamos @id_persona
            {
                type: QueryTypes.SELECT, // Tipo de operación SELECT
            }
        );

        res.status(200).json({ message: "Listado de roles exitoso", data: persons });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener una persona por ID
export const getPersonById = async (req: Request, res: Response): Promise<void> => {
  const { id_persona } = req.params;

  try {
    const person = await sequelize.query(
      `EXEC sp_gestion_persona @tipo_accion = 'Q', @id_persona = :id_persona`,
      {
        replacements: { id_persona },
        type: QueryTypes.SELECT
      }
    );

    if (!person.length) {
      res.status(404).json({ message: "Persona no encontrada" });
      return;
    }

    res.status(200).json({ data: person[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPersonByIdentifcation = async (req: Request, res: Response): Promise<void> => {
  const { numero_identifiacion } = req.params;

  try {
    const person = await sequelize.query(
      `EXEC sp_gestion_persona @tipo_accion = 'N', @numero_identifiacion = :numero_identifiacion,  @id_persona = NULL`,
      {
        replacements: { numero_identifiacion },
        type: QueryTypes.SELECT
      }
    );

    if (!person.length) {
      res.status(404).json({ message: "Persona no encontrada" });
      return;
    }

    res.status(200).json({ data: person[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPersonHistoryChanges = async (req: Request, res: Response): Promise<void> => {
  const { id_persona } = req.params;

  try {
      const miembro = await sequelize.query(
          `EXEC sp_gestion_persona @tipo_accion = 'B', @id_persona = :id_persona`,
          {
              replacements: { id_persona },
              type: QueryTypes.SELECT
          }
      );

      if (!miembro.length) {
          res.status(404).json({ message: "Persona no encontrada" });
          return;
      }

      // Devuelve todos los resultados en lugar del primero
      res.status(200).json({ data: miembro });
  } catch (error: any) {
      res.status(500).json({ error: error.message });
  }
};

export const getAllDisabilities = async (req: Request, res: Response): Promise<void> => {
  try {
      const disability = await sequelize.query(
          "EXEC sp_get_discapacidades", // Agregamos @id_persona
          {
              type: QueryTypes.SELECT, // Tipo de operación SELECT
          }
      );

      res.status(200).json({ message: "Listado de roles exitoso", data: disability });
  } catch (error: any) {
      res.status(500).json({ error: error.message });
  }
};
