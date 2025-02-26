import { Request, Response } from "express";
import { QueryTypes } from "sequelize";
import sequelize from "../database/SqlServer";

// Crear una nueva dirección
export const createIncome = async (req: Request, res: Response): Promise<void> => {
  const { id_persona, segmento, subsegmento, patrono, ocupacion, salario_bruto, salario_neto, fecha_ingreso, estado, principal } = req.body;

  try {
    await sequelize.query(
      `EXEC sp_gestion_ingresos @accion = 'I',
                                   @id_persona = :id_persona,
                                   @segmento = :segmento,
                                   @subsegmento = :subsegmento,
                                   @patrono = :patrono,
                                   @ocupacion = :ocupacion,
                                   @salario_bruto = :salario_bruto,
                                   @salario_neto = :salario_neto,
                                   @fecha_ingreso = :fecha_ingreso,
                                   @estado = :estado,
                                   @principal = :principal`,
      {
        replacements: { id_persona, segmento, subsegmento, patrono, ocupacion, salario_bruto, salario_neto, fecha_ingreso, estado, principal },
        type: QueryTypes.INSERT,
      }
    );

    res.status(201).json({ message: "Ingreso creado exitosamente" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar una dirección
export const updateIncome = async (req: Request, res: Response): Promise<void> => {
  const { id_ingreso } = req.params;
  const {
    segmento,
    subsegmento,
    patrono,
    ocupacion,
    salario_bruto,
    salario_neto,
    fecha_ingreso,
    estado,
    principal,
  } = req.body;

  try {
    await sequelize.query(
      `EXEC sp_gestion_ingresos @accion = 'U',
                                @id_ingreso = :id_ingreso,
                                @segmento = :segmento,
                                @subsegmento = :subsegmento,
                                @patrono = :patrono,
                                @ocupacion = :ocupacion,
                                @salario_bruto = :salario_bruto,
                                @salario_neto = :salario_neto,
                                @fecha_ingreso = :fecha_ingreso,
                                @estado = :estado,
                                @principal = :principal`,
      {
        replacements: {
          id_ingreso,
          segmento,
          subsegmento,
          patrono,
          ocupacion,
          salario_bruto,
          salario_neto,
          fecha_ingreso,
          estado,
          principal
        },
        type: QueryTypes.UPDATE
      }
    );

    res.status(200).json({ message: "Persona actualizada exitosamente" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};


// Desactivar una dirección
export const deleteIncome = async (req: Request, res: Response): Promise<void> => {
  const { id_ingreso } = req.params;

  try {
    // Ejecuta el procedimiento almacenado con el tipo de acción 'D'
    await sequelize.query(
      `EXEC sp_gestion_ingresos 
          @accion = 'D', 
          @id_ingreso = :id_ingreso`,
      {
        replacements: {
          tipo_accion: 'D', // Define la acción para desactivar la persona
          id_ingreso: parseInt(id_ingreso, 10) // Convierte id_persona a número si es necesario
        },
        type: QueryTypes.UPDATE
      }
    );

    res.status(200).json({ message: "Ingreso desactivado exitosamente" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener direcciones por ID de persona
export const getIncomesByPerson = async (req: Request, res: Response): Promise<void> => {
  const { id_persona } = req.params;

  try {
    const contactos = await sequelize.query(
      `EXEC sp_gestion_ingresos @accion = 'Q', @id_persona = :id_persona`,
      {
        replacements: { id_persona },
        type: QueryTypes.SELECT,
      }
    );

    if (!contactos.length) {
      res.status(404).json({ message: "No se encontraron ingresos para esta persona" });
      return;
    }

    res.status(200).json({ data: contactos });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getIncomesByID = async (req: Request, res: Response): Promise<void> => {
  const { id_ingreso } = req.params;

  try {
    const contact = await sequelize.query(
      `EXEC sp_gestion_ingresos @accion = 'G', @id_ingreso = :id_ingreso`,
      {
        replacements: { id_ingreso },
        type: QueryTypes.SELECT
      }
    );

    if (!contact.length) {
      res.status(404).json({ message: "Ingreso no encontrada" });
      return;
    }

    res.status(200).json({ data: contact[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllIncomes = async (req: Request, res: Response): Promise<void> => {
  try {
    const persons = await sequelize.query(
      "EXEC sp_gestion_ingresos @accion = 'S', @id_persona = NULL", // Agregamos @id_persona
      {
        type: QueryTypes.SELECT, // Tipo de operación SELECT
      }
    );

    res.status(200).json({ message: "Listado de roles exitoso", data: persons });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getSegmentos = async (req: Request, res: Response): Promise<void> => {
  const { segmento } = req.params;

  try {
    const contactos = await sequelize.query(
      `EXEC sp_obtener_segmentos @p_segmento = :segmento `,
      {
        replacements: { segmento },
        type: QueryTypes.SELECT,
      }
    );

    if (!contactos.length) {
      res.status(404).json({ message: "No se encontraron segmentos" });
      return;
    }

    res.status(200).json({ data: contactos });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};



