export  interface historyFilesModel {
    fecha: Date;
    codigo: number;
    campo_modificado: string;
    valor_anterior: string;
    valor_nuevo: string;
    usuario: string;
}