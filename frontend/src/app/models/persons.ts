export interface personModel {
    id_persona: number;
    tipo_identificacion: string;
    numero_identifiacion: string;
    nombre: string;
    primer_apellido: string;
    segundo_apellido: string;
    fecha_nacimiento: Date;
    genero: string;
    estado_civil: string;
    nacionalidad: string;
    fecha_registro: Date;
    usuario_registro: string;
    nivel_estudios: string;
    asesor: string;
    estado: string;
    discapacidad: string;
}