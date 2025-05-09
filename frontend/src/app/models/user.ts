export interface User {
    id: number;
    nombre: string;
    primer_apellido: string;
    segundo_apellido: string;
    nombre_usuario: string;
    correo_electronico: string;
    contrasena: string;
    perfil_asignado: string;
    estado: string;
    hora_inicial: string; 
    hora_final: string;
    permisos?: string[];
    token: string;
}