export interface personHistoryModel {
    id_persona: number;
    fecha: Date;
    objeto: string;
    campo_modificado: string;
    valor_anterior: string;
    valor_nuevo: string;
    usuario: string;
}