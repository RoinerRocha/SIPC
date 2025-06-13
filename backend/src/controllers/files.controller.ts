import { Request, Response } from "express";
import { QueryTypes } from "sequelize";
import sequelize from "../database/SqlServer";

// @id_persona = NULL,
// @identificacion = NULL

// Función utilitaria: convierte '' o undefined en null
const toNullableDate = (value: any) => {
    return value === '' || value === undefined ? null : value;
};


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

        situacion_empresa,
        expediente,
        nuevo_bono,
        responsable,
        estado_entidad,
        codigo_apc,
        exoneracion_ley_9635,
        profesional,
        contrato_empresa,
        programa_empresa,
        estado_banhvi,
        proposito_banhvi,
        contacto,
        observaciones_ente,
        analista_constructora,
        analista_ente,
        inscrito_hacienda,
        fecha_sello_cfia,
        fecha_entrega,
        fecha_devuelto,
        fecha_entrega_recuperado,
        fecha_reingreso,
        fecha_299,
        fecha_enviado_banhvi,
        fecha_carta_agua_recibida,
        fecha_entrega_declaratoria,
        fecha_ingreso_cfia,
        fecha_salida_cfia,
        fecha_entregado_para_enviar,
        fecha_envio_docs_beneficiario,
        fecha_llegada_oficina,
        fecha_permiso_ente,
        fecha_formalizacion,
        fecha_pago_aporte,
        fecha_enviado_construir,
        fecha_pago_avaluo,
        fecha_pago_formalizacion,
        fecha_pago_ts,
        monto_pago_avaluo,
        monto_aporte,
        monto_pago_formalizacion,
        monto_pago_trabajo_social,
        comprobante_trabrajo_social,
        comprobante_pago_avaluo,
        comprobante_pago_formalizacion,
        comprobante_aporte,
        dias_emitido,
        dias_desde_entrega,
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
                                @usuario_sistema = :usuario_sistema,
                                @situacion_empresa = :situacion_empresa,
                                @expediente = :expediente,
                                @nuevo_bono = :nuevo_bono,
                                @responsable = :responsable,
                                @estado_entidad = :estado_entidad,
                                @codigo_apc = :codigo_apc,
                                @exoneracion_ley_9635 = :exoneracion_ley_9635,
                                @profesional = :profesional,
                                @contrato_empresa = :contrato_empresa,
                                @programa_empresa = :programa_empresa,
                                @estado_banhvi = :estado_banhvi,
                                @proposito_banhvi = :proposito_banhvi,
                                @contacto = :contacto,
                                @observaciones_ente = :observaciones_ente,
                                @analista_constructora = :analista_constructora,
                                @analista_ente = :analista_ente,
                                @inscrito_hacienda = :inscrito_hacienda,
                                @fecha_sello_cfia = :fecha_sello_cfia,
                                @fecha_entrega = :fecha_entrega,
                                @fecha_devuelto = :fecha_devuelto,
                                @fecha_entrega_recuperado = :fecha_entrega_recuperado,
                                @fecha_reingreso = :fecha_reingreso,
                                @fecha_299 = :fecha_299,
                                @fecha_enviado_banhvi = :fecha_enviado_banhvi,
                                @fecha_carta_agua_recibida = :fecha_carta_agua_recibida,
                                @fecha_entrega_declaratoria = :fecha_entrega_declaratoria,
                                @fecha_ingreso_cfia = :fecha_ingreso_cfia,
                                @fecha_salida_cfia = :fecha_salida_cfia,
                                @fecha_entregado_para_enviar = :fecha_entregado_para_enviar,
                                @fecha_envio_docs_beneficiario = :fecha_envio_docs_beneficiario,
                                @fecha_llegada_oficina = :fecha_llegada_oficina,
                                @fecha_permiso_ente = :fecha_permiso_ente,
                                @fecha_formalizacion = :fecha_formalizacion,
                                @fecha_pago_aporte = :fecha_pago_aporte,
                                @fecha_enviado_construir = :fecha_enviado_construir,
                                @fecha_pago_avaluo = :fecha_pago_avaluo,
                                @fecha_pago_formalizacion = :fecha_pago_formalizacion,
                                @fecha_pago_ts = :fecha_pago_ts,
                                @monto_pago_avaluo = :monto_pago_avaluo,
                                @monto_aporte = :monto_aporte,
                                @monto_pago_formalizacion = :monto_pago_formalizacion,
                                @monto_pago_trabajo_social = :monto_pago_trabajo_social,
                                @comprobante_trabrajo_social = :comprobante_trabrajo_social,
                                @comprobante_pago_avaluo = :comprobante_pago_avaluo,
                                @comprobante_pago_formalizacion = :comprobante_pago_formalizacion,
                                @comprobante_aporte = :comprobante_aporte,
                                @dias_emitido = :dias_emitido,
                                @dias_desde_entrega = :dias_desde_entrega`,
            {
                replacements: {
                    codigo,
                    estado,
                    fecha_creacion: toNullableDate(fecha_creacion),
                    fecha_emitido: toNullableDate(fecha_emitido),
                    fecha_enviado_entidad: toNullableDate(fecha_enviado_entidad),
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
                    fecha_envio_acta: toNullableDate(fecha_envio_acta),
                    estado_emitido,
                    fecha_aprobado: toNullableDate(fecha_aprobado),
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
                    usuario_sistema,

                    situacion_empresa,
                    expediente,
                    nuevo_bono,
                    responsable,
                    estado_entidad,
                    codigo_apc,
                    exoneracion_ley_9635,
                    profesional,
                    contrato_empresa,
                    programa_empresa,
                    estado_banhvi,
                    proposito_banhvi,
                    contacto,
                    observaciones_ente,
                    analista_constructora,
                    analista_ente,
                    inscrito_hacienda,
                    fecha_sello_cfia: toNullableDate(fecha_sello_cfia),
                    fecha_entrega: toNullableDate(fecha_entrega),
                    fecha_devuelto: toNullableDate(fecha_devuelto),
                    fecha_entrega_recuperado: toNullableDate(fecha_entrega_recuperado),
                    fecha_reingreso: toNullableDate(fecha_reingreso),
                    fecha_299: toNullableDate(fecha_299),
                    fecha_enviado_banhvi: toNullableDate(fecha_enviado_banhvi),
                    fecha_carta_agua_recibida: toNullableDate(fecha_carta_agua_recibida),
                    fecha_entrega_declaratoria: toNullableDate(fecha_entrega_declaratoria),
                    fecha_ingreso_cfia: toNullableDate(fecha_ingreso_cfia),
                    fecha_salida_cfia: toNullableDate(fecha_salida_cfia),
                    fecha_entregado_para_enviar: toNullableDate(fecha_entregado_para_enviar),
                    fecha_envio_docs_beneficiario: toNullableDate(fecha_envio_docs_beneficiario),
                    fecha_llegada_oficina: toNullableDate(fecha_llegada_oficina),
                    fecha_permiso_ente: toNullableDate(fecha_permiso_ente),
                    fecha_formalizacion: toNullableDate(fecha_formalizacion),
                    fecha_pago_aporte: toNullableDate(fecha_pago_aporte),
                    fecha_enviado_construir: toNullableDate(fecha_enviado_construir),
                    fecha_pago_avaluo: toNullableDate(fecha_pago_avaluo),
                    fecha_pago_formalizacion: toNullableDate(fecha_pago_formalizacion),
                    fecha_pago_ts: toNullableDate(fecha_pago_ts),
                    monto_pago_avaluo,
                    monto_aporte,
                    monto_pago_formalizacion,
                    monto_pago_trabajo_social,
                    comprobante_trabrajo_social,
                    comprobante_pago_avaluo,
                    comprobante_pago_formalizacion,
                    comprobante_aporte,
                    dias_emitido,
                    dias_desde_entrega
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

export const getColumnLimits = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await sequelize.query(
            `
        SELECT COLUMN_NAME, CHARACTER_MAXIMUM_LENGTH 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'expediente' 
          AND COLUMN_NAME IN ('numero_bono', 'contrato_empresa', 'expediente', 'nuevo_bono', 'codigo_apc', 'exoneracion_ley_9635', 'profesional', 
          'contacto', 'remitente', 'asignadoa', 'observaciones', 'observaciones_ente', 'numero_bono', 'contrato_CFIA', 'etiqueta', 
          'acta_traslado', 'boleta', 'acuerdo_aprobacion', 'folio_real', 'numero_plano', 'ubicacion', 'inscrito_hacienda', 
          'comprobante_pago_avaluo', 'comprobante_pago_formalizacion', 'comprobante_trabrajo_social', 'comprobante_aporte')
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