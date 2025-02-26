import { Request, Response } from "express";
import { QueryTypes } from "sequelize";
import sequelize from "../database/SqlServer";

// @id_persona = NULL,
// @identificacion = NULL

export const updateFiles = async (req: Request, res: Response): Promise<void> => {
    const { codigo, usuario_sistema } = req.params;
    const {
        estado,
        fecha_creacion,
        fecha_emitido,
        fecha_enviado_entidad,
        ubicacion,
        etiqueta,
        entidad,
        observaciones,
        remitente,
        asignadoa,
        tipo_expediente,
        numero_bono,
        proposito_bono,
        monto_bono,
        contrato_CFIA,
        acta_traslado,
        fecha_envio_acta,
        estado_emitido,
        fecha_aprobado,
        folio_real,
        numero_plano,
        area_construccion,
        ingeniero_responsable,
        fiscal,
        monto_compra_venta,
        monto_presupuesto,
        monto_solucion,
        monto_comision,
        monto_costo_terreno,
        monto_honorarios_abogado,
        monto_patrimonio_familiar,
        monto_poliza,
        monto_fiscalizacion,
        monto_kilometraje,
        monto_afiliacion,
        monto_trabajo_social,
        monto_construccion,
        constructora_asignada,
        boleta,
        acuerdo_aprobacion,
        monto_estudio_social,
        monto_aporte_familia,
        patrimonio_familiar,
        monto_gastos_formalizacion,
        monto_aporte_gastos,
        monto_diferencia_aporte,
        monto_prima_seguros,
    } = req.body;

    try {
        await sequelize.query(
            `EXEC sp_gestion_expediente @tipo = 'U',
                                @codigo = :codigo,
                                @estado = :estado,
                                @fecha_creacion = :fecha_creacion,
                                @fecha_emitido = :fecha_emitido,
                                @fecha_enviado_entidad = :fecha_enviado_entidad,
                                @ubicacion = :ubicacion,
                                @etiqueta = :etiqueta,
                                @entidad = :entidad,
                                @observaciones = :observaciones,
                                @remitente = :remitente,
                                @asignadoa = :asignadoa,
                                @tipo_expediente = :tipo_expediente,
                                @numero_bono = :numero_bono,
                                @proposito_bono = :proposito_bono,
                                @monto_bono = :monto_bono,
                                @contrato_CFIA = :contrato_CFIA,
                                @acta_traslado = :acta_traslado,
                                @fecha_envio_acta = :fecha_envio_acta,
                                @estado_emitido = :estado_emitido,
                                @fecha_aprobado = :fecha_aprobado,
                                @folio_real = :folio_real,
                                @numero_plano = :numero_plano,
                                @area_construccion = :area_construccion,
                                @ingeniero_responsable = :ingeniero_responsable,
                                @fiscal = :fiscal,
                                @monto_compra_venta = :monto_compra_venta,
                                @monto_presupuesto = :monto_presupuesto,
                                @monto_solucion = :monto_solucion,
                                @monto_comision = :monto_comision,
                                @monto_costo_terreno = :monto_costo_terreno,
                                @monto_honorarios_abogado = :monto_honorarios_abogado,
                                @monto_patrimonio_familiar = :monto_patrimonio_familiar,
                                @monto_poliza = :monto_poliza,
                                @monto_fiscalizacion = :monto_fiscalizacion,
                                @monto_kilometraje = :monto_kilometraje,
                                @monto_afiliacion = :monto_afiliacion,
                                @monto_trabajo_social = :monto_trabajo_social,
                                @monto_construccion = :monto_construccion,
                                @constructora_asignada = :constructora_asignada,
                                @boleta = :boleta,
                                @acuerdo_aprobacion = :acuerdo_aprobacion,
                                @monto_estudio_social = :monto_estudio_social,
                                @monto_aporte_familia = :monto_aporte_familia,
                                @patrimonio_familiar = :patrimonio_familiar,
                                @monto_gastos_formalizacion = :monto_gastos_formalizacion,
                                @monto_aporte_gastos = :monto_aporte_gastos,
                                @monto_diferencia_aporte = :monto_diferencia_aporte,
                                @monto_prima_seguros = :monto_prima_seguros,
                                @usuario_sistema = :usuario_sistema`,
            {
                replacements: {
                    codigo,
                    estado,
                    fecha_creacion,
                    fecha_emitido,
                    fecha_enviado_entidad,
                    ubicacion,
                    etiqueta,
                    entidad,
                    observaciones,
                    remitente,
                    asignadoa,
                    tipo_expediente,
                    numero_bono,
                    proposito_bono,
                    monto_bono,
                    contrato_CFIA,
                    acta_traslado,
                    fecha_envio_acta,
                    estado_emitido,
                    fecha_aprobado,
                    folio_real,
                    numero_plano,
                    area_construccion,
                    ingeniero_responsable,
                    fiscal,
                    monto_compra_venta,
                    monto_presupuesto,
                    monto_solucion,
                    monto_comision,
                    monto_costo_terreno,
                    monto_honorarios_abogado,
                    monto_patrimonio_familiar,
                    monto_poliza,
                    monto_fiscalizacion,
                    monto_kilometraje,
                    monto_afiliacion,
                    monto_trabajo_social,
                    monto_construccion,
                    constructora_asignada,
                    boleta,
                    acuerdo_aprobacion,
                    monto_estudio_social,
                    monto_aporte_familia,
                    patrimonio_familiar,
                    monto_gastos_formalizacion,
                    monto_aporte_gastos,
                    monto_diferencia_aporte,
                    monto_prima_seguros,
                    usuario_sistema
                },
                type: QueryTypes.UPDATE
            }
        );

        res.status(200).json({ message: "Expediente actualizado exitosamente" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getFilesByPerson = async (req: Request, res: Response): Promise<void> => {
    const { identificacion } = req.params;

    try {
        const contactos = await sequelize.query(
            `EXEC sp_gestion_expediente @tipo = 'Q', @identificacion = :identificacion, @codigo = NULL, @id_persona = NULL, @tipo_expediente = NULL`,
            {
                replacements: { identificacion },
                type: QueryTypes.SELECT,
            }
        );

        if (!contactos.length) {
            res.status(404).json({ message: "No se encontraron expedientes para esta persona" });
            return;
        }

        res.status(200).json({ data: contactos });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};


export const getHistoryFiles = async (req: Request, res: Response): Promise<void> => {
    const { codigo } = req.params;

    try {
        const miembro = await sequelize.query(
            `EXEC sp_gestion_expediente @tipo = 'B', @codigo = :codigo, @id_persona = NULL, @identificacion = NULL, @tipo_expediente = NULL`,
            {
                replacements: { codigo },
                type: QueryTypes.SELECT
            }
        );

        if (!miembro.length) {
            res.status(404).json({ message: "Expediente no encontrado" });
            return;
        }

        // Devuelve todos los resultados en lugar del primero
        res.status(200).json({ data: miembro });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getFilesByIdPerson = async (req: Request, res: Response): Promise<void> => {
    const { id_persona } = req.params;

    try {
        const miembro = await sequelize.query(
            `EXEC sp_gestion_expediente @tipo = 'P', @id_persona = :id_persona, @codigo = NULL, @identificacion = NULL`,
            {
                replacements: { id_persona },
                type: QueryTypes.SELECT
            }
        );

        if (!miembro.length) {
            res.status(404).json({ message: "Expediente no encontrado" });
            return;
        }

        // Devuelve todos los resultados en lugar del primero
        res.status(200).json({ data: miembro });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};


export const getFilesByCode = async (req: Request, res: Response): Promise<void> => {
    const { codigo } = req.params;

    try {
        const miembro = await sequelize.query(
            `EXEC sp_gestion_expediente @tipo = 'S', @codigo = :codigo, @id_persona = NULL, @identificacion = NULL, @tipo_expediente = NULL`,
            {
                replacements: { codigo },
                type: QueryTypes.SELECT
            }
        );

        if (!miembro.length) {
            res.status(404).json({ message: "Expediente no encontrado" });
            return;
        }

        res.status(200).json({ data: miembro[0] });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getAllFiles = async (req: Request, res: Response): Promise<void> => {
    try {
        const files = await sequelize.query(
            "EXEC sp_gestion_expediente @tipo = 'A', @codigo = NULL, @id_persona = NULL, @identificacion = NULL, @tipo_expediente = NULL", // Agregamos @id_persona
            {
                type: QueryTypes.SELECT, // Tipo de operación SELECT
            }
        );

        res.status(200).json({ message: "Listado de expedientes exitoso", data: files });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};