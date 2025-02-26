export interface contactsModel {
    id_contacto: number;
    id_persona: number;
    tipo_contacto: string;
    identificador: string;
    estado: string;
    fecha_registro: Date;
    comentarios: string;
}