import { Request, Response } from "express";
import { QueryTypes } from "sequelize";
import sequelize from "../database/SqlServer";
import fs from "fs";
import path from "path";
import multer from "multer";
import { uploadFileToAzure, getFileFromAzure } from "../util/azureStorage";

const storage = multer.memoryStorage();
export const upload = multer({ storage }).single("archivo");

export const createPayment = async (req: Request, res: Response): Promise<void> => {
  const {
    id_persona,
    identificacion,
    comprobante,
    tipo_pago,
    fecha_pago,
    fecha_presentacion,
    estado,
    monto,
    moneda,
    usuario,
    observaciones,
    tipo_movimiento
  } = req.body;

  let archivoPath = null;

  try {
    if (req.file) {
      const filename = `${Date.now()}_${req.file.originalname}`;
      archivoPath = await uploadFileToAzure(filename, req.file.buffer);
    }

    await sequelize.query(
      `EXEC sp_gestion_pagos @accion = 'I',
              @id_persona = :id_persona,
              @identificacion = :identificacion,
              @comprobante = :comprobante,
              @tipo_pago = :tipo_pago,
              @fecha_pago = :fecha_pago,
              @fecha_presentacion = :fecha_presentacion,
              @estado = :estado,
              @monto = :monto,
              @moneda = :moneda,
              @usuario = :usuario,
              @observaciones = :observaciones,
              @archivo = :archivo,
              @tipo_movimiento = :tipo_movimiento`,
      {
        replacements: {
          id_persona,
          identificacion,
          comprobante,
          tipo_pago,
          fecha_pago,
          fecha_presentacion,
          estado,
          monto,
          moneda,
          usuario,
          observaciones,
          archivo: archivoPath,
          tipo_movimiento
        },
        type: QueryTypes.INSERT
      }
    );

    res.status(201).json({ message: "Pago creado exitosamente" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePayment = async (req: Request, res: Response): Promise<void> => {
  const { id_pago } = req.params;
  const {
    estado,
    observaciones,
  } = req.body;

  try {
    await sequelize.query(
      `EXEC sp_gestion_pagos @accion = 'U',
                              @id_pago = :id_pago,
                              @estado = :estado,
                              @observaciones = :observaciones`,
      {
        replacements: {
          id_pago,
          estado,
          observaciones
        },
        type: QueryTypes.UPDATE
      }
    );

    res.status(200).json({ message: "Pago actualizado exitosamente" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPaymentsByPerson = async (req: Request, res: Response): Promise<void> => {
  const { identificacion } = req.params;

  try {
    const persons = await sequelize.query(
      `EXEC sp_gestion_pagos @accion = 'Q', @identificacion = :identificacion`,
      {
        replacements: { identificacion },
        type: QueryTypes.SELECT,
      }
    );

    if (!persons.length) {
      res.status(404).json({ message: "No se encontraron pagos para esta persona" });
      return;
    }

    res.status(200).json({ data: persons });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPaymentsByIDPerson = async (req: Request, res: Response): Promise<void> => {
  const { id_persona } = req.params;

  try {
    const persons = await sequelize.query(
      `EXEC sp_gestion_pagos @accion = 'S', @id_persona = :id_persona`,
      {
        replacements: { id_persona },
        type: QueryTypes.SELECT,
      }
    );

    if (!persons.length) {
      res.status(404).json({ message: "No se encontraron pagos para esta persona" });
      return;
    }

    res.status(200).json({ data: persons });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPaymentsByIDPago = async (req: Request, res: Response): Promise<void> => {
  const { id_pago } = req.params;

  try {
    const payments = await sequelize.query(
      `EXEC sp_gestion_pagos @accion = 'G', @id_pago = :id_pago`,
      {
        replacements: { id_pago },
        type: QueryTypes.SELECT
      }
    );

    if (!payments.length) {
      res.status(404).json({ message: "Ingreso no encontrada" });
      return;
    }

    res.status(200).json({ data: payments[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    const payments = await sequelize.query(
      "EXEC sp_gestion_pagos @accion = 'A', @id_pago = NULL", // Agregamos @id_persona
      {
        type: QueryTypes.SELECT, // Tipo de operación SELECT
      }
    );

    res.status(200).json({ message: "Listado de observacioens creadas", data: payments });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const downloadPaymentFile = async (req: Request, res: Response): Promise<void> => {
  const { filename } = req.params;

  try {
    const fileStream = await getFileFromAzure(filename);
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    res.setHeader("Content-Type", "application/octet-stream");

    fileStream.pipe(res);
  } catch (error: any) {
    res.status(500).json({ error: "Error al descargar el archivo: " + error.message });
  }
};

export const getColumnLimits = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await sequelize.query(
      `
      SELECT COLUMN_NAME, CHARACTER_MAXIMUM_LENGTH 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'pagos' 
        AND COLUMN_NAME IN ('comprobante', 'observaciones')
      `,
      {
        type: QueryTypes.SELECT,
      }
    );

    // Aseguramos el tipo correcto
    const limits: Record<string, number> = {};
    (result as { COLUMN_NAME: string; CHARACTER_MAXIMUM_LENGTH: number }[]).forEach(row => {
      limits[row.COLUMN_NAME] = row.CHARACTER_MAXIMUM_LENGTH;
    });

    res.status(200).json(limits);
  } catch (error: any) {
    console.error("Error al obtener límites de columnas:", error);
    res.status(500).json({ error: 'Error interno' });
  }
};