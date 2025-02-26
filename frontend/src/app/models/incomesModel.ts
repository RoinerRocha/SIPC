export  interface incomesModel {
    id_ingreso: number;
    id_persona: number;
    segmento: string;
    subsegmento: string;
    patrono: string;
    ocupacion: string;
    salario_bruto: number;
    salario_neto: number;
    fecha_ingreso: Date;
    estado: string;
    principal: boolean;
}