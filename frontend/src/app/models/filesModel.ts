export interface filesModel {
    codigo: number;
    id_persona: number;
    beneficiario: string;
    provincia: string;
    canton: string;
    distrito:string;
    otras_senas: string;
    barrio: string;
    identificacion: string;
    estado: string;
    fecha_creacion: Date;
    fecha_emitido: Date;
    fecha_enviado_entidad: Date;
    ubicacion: string;
    etiqueta: string;
    entidad: string;
    observaciones: string;
    remitente: string;
    asignadoa: string;
    tipo_expediente: string;
    numero_bono: string,
    proposito_bono: string,
    monto_bono: number,
    contrato_CFIA: string,
    acta_traslado: string,
    fecha_envio_acta: Date,
    estado_emitido: string,
    fecha_aprobado: Date,
    folio_real: string,
    numero_plano: string,
    area_construccion: number; // DECIMAL(18,2) en SQL -> number en TypeScript
    ingeniero_responsable: string;
    fiscal: string;
    monto_compra_venta: number;
    monto_presupuesto: number;
    monto_solucion: number;
    monto_comision: number;
    monto_costo_terreno: number;
    monto_honorarios_abogado: number;
    monto_patrimonio_familiar: number;
    monto_poliza: number;
    monto_fiscalizacion: number;
    monto_kilometraje: number;
    monto_afiliacion: number;
    monto_trabajo_social: number;
    monto_construccion: number;
    constructora_asignada: string;
    boleta: string;
    acuerdo_aprobacion: string;
    monto_estudio_social: number;
    monto_aporte_familia: number;
    patrimonio_familiar: string;
    monto_gastos_formalizacion: number;
    monto_aporte_gastos: number;
    monto_diferencia_aporte: number;
    monto_prima_seguros: number;
    usuario_sistema: string;
}