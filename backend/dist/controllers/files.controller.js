"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllFiles = exports.getFilesByCode = exports.getFilesByIdPerson = exports.getHistoryFiles = exports.getFilesByPerson = exports.updateFiles = void 0;
const sequelize_1 = require("sequelize");
const SqlServer_1 = __importDefault(require("../database/SqlServer"));
// @id_persona = NULL,
// @identificacion = NULL
const updateFiles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { codigo, usuario_sistema } = req.params;
    const { estado, fecha_creacion, fecha_emitido, fecha_enviado_entidad, ubicacion, etiqueta, entidad, observaciones, remitente, asignadoa, tipo_expediente, numero_bono, proposito_bono, monto_bono, contrato_CFIA, acta_traslado, fecha_envio_acta, estado_emitido, fecha_aprobado, folio_real, numero_plano, area_construccion, ingeniero_responsable, fiscal, monto_compra_venta, monto_presupuesto, monto_solucion, monto_comision, monto_costo_terreno, monto_honorarios_abogado, monto_patrimonio_familiar, monto_poliza, monto_fiscalizacion, monto_kilometraje, monto_afiliacion, monto_construccion, constructora_asignada, boleta, acuerdo_aprobacion, monto_estudio_social, monto_aporte_familia, patrimonio_familiar, monto_gastos_formalizacion, monto_aporte_gastos, monto_diferencia_aporte, monto_prima_seguros, situacion_empresa, expediente, nuevo_bono, responsable, estado_entidad, codigo_apc, exoneracion_ley_9635, profesional, contrato_empresa, programa_empresa, estado_banhvi, proposito_banhvi, contacto, observaciones_ente, analista_constructora, analista_ente, inscrito_hacienda, fecha_sello_cfia, fecha_entrega, fecha_devuelto, fecha_entrega_recuperado, fecha_reingreso, fecha_299, fecha_enviado_banhvi, fecha_carta_agua_recibida, fecha_entrega_declaratoria, fecha_ingreso_cfia, fecha_salida_cfia, fecha_entregado_para_enviar, fecha_envio_docs_beneficiario, fecha_llegada_oficina, fecha_permiso_ente, fecha_formalizacion, fecha_pago_aporte, fecha_enviado_construir, fecha_pago_avaluo, fecha_pago_formalizacion, fecha_pago_ts, monto_pago_avaluo, monto_aporte, monto_pago_formalizacion, monto_pago_trabajo_social, comprobante_trabrajo_social, comprobante_pago_avaluo, comprobante_pago_formalizacion, comprobante_aporte, dias_emitido, dias_desde_entrega, } = req.body;
    try {
        yield SqlServer_1.default.query(`EXEC sp_gestion_expediente @tipo = 'U',
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
                                @dias_desde_entrega = :dias_desde_entrega`, {
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
                dias_desde_entrega
            },
            type: sequelize_1.QueryTypes.UPDATE
        });
        res.status(200).json({ message: "Expediente actualizado exitosamente" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.updateFiles = updateFiles;
const getFilesByPerson = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { identificacion } = req.params;
    try {
        const contactos = yield SqlServer_1.default.query(`EXEC sp_gestion_expediente @tipo = 'Q', @identificacion = :identificacion, @codigo = NULL, @id_persona = NULL, @tipo_expediente = NULL`, {
            replacements: { identificacion },
            type: sequelize_1.QueryTypes.SELECT,
        });
        if (!contactos.length) {
            res.status(404).json({ message: "No se encontraron expedientes para esta persona" });
            return;
        }
        res.status(200).json({ data: contactos });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getFilesByPerson = getFilesByPerson;
const getHistoryFiles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { codigo } = req.params;
    try {
        const miembro = yield SqlServer_1.default.query(`EXEC sp_gestion_expediente @tipo = 'B', @codigo = :codigo, @id_persona = NULL, @identificacion = NULL, @tipo_expediente = NULL`, {
            replacements: { codigo },
            type: sequelize_1.QueryTypes.SELECT
        });
        if (!miembro.length) {
            res.status(404).json({ message: "Expediente no encontrado" });
            return;
        }
        // Devuelve todos los resultados en lugar del primero
        res.status(200).json({ data: miembro });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getHistoryFiles = getHistoryFiles;
const getFilesByIdPerson = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id_persona } = req.params;
    try {
        const miembro = yield SqlServer_1.default.query(`EXEC sp_gestion_expediente @tipo = 'P', @id_persona = :id_persona, @codigo = NULL, @identificacion = NULL`, {
            replacements: { id_persona },
            type: sequelize_1.QueryTypes.SELECT
        });
        if (!miembro.length) {
            res.status(404).json({ message: "Expediente no encontrado" });
            return;
        }
        // Devuelve todos los resultados en lugar del primero
        res.status(200).json({ data: miembro });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getFilesByIdPerson = getFilesByIdPerson;
const getFilesByCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { codigo } = req.params;
    try {
        const miembro = yield SqlServer_1.default.query(`EXEC sp_gestion_expediente @tipo = 'S', @codigo = :codigo, @id_persona = NULL, @identificacion = NULL, @tipo_expediente = NULL`, {
            replacements: { codigo },
            type: sequelize_1.QueryTypes.SELECT
        });
        if (!miembro.length) {
            res.status(404).json({ message: "Expediente no encontrado" });
            return;
        }
        res.status(200).json({ data: miembro[0] });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getFilesByCode = getFilesByCode;
const getAllFiles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const files = yield SqlServer_1.default.query("EXEC sp_gestion_expediente @tipo = 'A', @codigo = NULL, @id_persona = NULL, @identificacion = NULL, @tipo_expediente = NULL", // Agregamos @id_persona
        {
            type: sequelize_1.QueryTypes.SELECT, // Tipo de operación SELECT
        });
        res.status(200).json({ message: "Listado de expedientes exitoso", data: files });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getAllFiles = getAllFiles;
