export interface referralsModel {
    id_remision: number;
    fecha_preparacion: Date;
    fecha_envio: Date;
    usuario_prepara: string;
    entidad_destino: string;
    estado: string;
}