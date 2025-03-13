import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { QueryTypes } from "sequelize";
import sequelize from "../database/SqlServer";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user";
import moment from "moment-timezone";


export const register = async (req: Request, res: Response): Promise<void> => {
  const {
    nombre,
    primer_apellido,
    segundo_apellido,
    nombre_usuario,
    correo_electronico,
    contrasena,
    perfil_asignado,
    estado,
    hora_inicial,
    hora_final,
  } = req.body;

  try {
    // Encriptar la contraseña antes de enviar al procedimiento almacenado
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    await sequelize.query(
      "EXEC sp_gestion_usuarios @Action = 'I', @nombre = :nombre, @primer_apellido = :primer_apellido, @segundo_apellido = :segundo_apellido, @nombre_usuario = :nombre_usuario, @correo_electronico = :correo_electronico, @contrasena = :contrasena, @perfil_asignado = :perfil_asignado, @estado =:estado, @hora_inicial = :hora_inicial, @hora_final = :hora_final ",
      {
        replacements: {
          nombre,
          primer_apellido,
          segundo_apellido,
          nombre_usuario,
          correo_electronico,
          contrasena: hashedPassword,
          perfil_asignado,
          estado,
          hora_inicial,
          hora_final,
        },
        type: QueryTypes.INSERT, // Utiliza QueryTypes
      }
    );

    res.status(201).json({ message: "Usuario creado exitosamente" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { nombre_usuario, contrasena } = req.body;

  try {
    // Obtener la información del usuario
    const [user] = await sequelize.query(
      `EXEC sp_gestion_usuarios @Action = 'V', @nombre_usuario = :nombre_usuario`,
      {
        replacements: { nombre_usuario },
        type: QueryTypes.SELECT,
      }
    ) as any[];

    if (!user) {
      res.status(404).json({ message: "Usuario no encontrado / User Not Found" });
      return;
    }

    if (user.estado !== "activo") {
      res.status(403).json({ message: "Usuario inactivo. Contacte al administrador / Inactive user. Contact the administrator." });
      return;
    }

    // Validar si la contraseña es correcta
    const isPasswordValid = await bcrypt.compare(contrasena, user.contrasena);

    if (!isPasswordValid) {
      res.status(401).json({ message: "Contraseña Equivocada / Wrong Password" });
      return;
    }

    // Obtener la hora actual del sistema (de la computadora)
    const currentTime = moment().format("HH:mm:ss");

    // Convertir las horas de la base de datos a formato UTC sin considerar la zona horaria del SQL Server
    const horaInicio = moment.utc(user.hora_inicial, "HH:mm:ss").format("HH:mm:ss");
    const horaFin = moment.utc(user.hora_final, "HH:mm:ss").format("HH:mm:ss");

    console.log(`Hora actual: ${currentTime}, Hora inicio: ${horaInicio}, Hora fin: ${horaFin}`);

    // Validar el rango horario sin depender de la zona horaria del SQL Server
    if (currentTime < horaInicio || currentTime > horaFin) {
      res.status(403).json({ message: "Favor ingresar en las horas admitidas" });
      return;
    }

    // Generar token de autenticación
    const token = jwt.sign(
      {
        id: user.id,
        nombre_usuario: user.nombre_usuario,
        perfil_asignado: user.perfil_asignado,
        correo_electronico: user.correo_electronico,
        estado: user.estado,
        hora_inicial: user.hora_inicial,  // Agregado
        hora_final: user.hora_final       // Agregado
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    res.status(200).json({ message: "Login successful", token });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};




export const getAllUser = async (req: Request, res: Response) => {
  try {
    const users = await sequelize.query("EXEC sp_gestion_usuarios @Action = 'Q'", {
      type: QueryTypes.SELECT,
    });
    res.status(200).json({ message: "List of Users successful", data: users });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      res.status(401).json({ message: "Token de autorización no encontrado" });
      return;
    }

    const decodedToken: any = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    );

    const [user]: any = await sequelize.query(
      "EXEC sp_gestion_usuarios @Action = 'S', @nombre_usuario = :nombre_usuario",
      {
        replacements: { nombre_usuario: decodedToken.nombre_usuario },
        type: QueryTypes.SELECT,
      }
    );

    if (!user) {
      res.status(404).json({ message: "Usuario no encontrado" });
      return;
    }

    const userToken = jwt.sign(
      {
        id: user.id,
        nombre_usuario: user.nombre_usuario,
        perfil_asignado: user.perfil_asignado,
        correo_electronico: user.correo_electronico,
        estado: user.estado,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    res.status(200).json({ token: userToken });
  } catch (error: any) {
    res.status(500).json({ message: "Error al obtener el usuario actual" });
  }
};

// Eliminar un usuario
export const deleteUser = async (req: Request, res: Response) => {
  const userId = req.params.id;

  try {
    const result: any = await sequelize.query(
      "EXEC EliminarUsuario @id = :id",
      {
        replacements: { id: userId },
        type: QueryTypes.DELETE,
      }
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ message: "Delete User successful" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Actualizar un usuario
export const updateUser = async (req: Request, res: Response) => {
  const userId = req.params.id;
  const {
    nombre,
    primer_apellido,
    segundo_apellido,
    nombre_usuario,
    correo_electronico,
    contrasena,
    perfil_asignado,
    estado,
    hora_inicial,
    hora_final,
  } = req.body;

  try {
    const hashedPassword = contrasena && contrasena.trim() !== ''
      ? await bcrypt.hash(contrasena, 10)
      : null;

    await sequelize.query(
      `EXEC sp_gestion_usuarios 
          @Action = 'U',
          @id = :id, 
          @nombre = :nombre, 
          @primer_apellido = :primer_apellido, 
          @segundo_apellido = :segundo_apellido, 
          @nombre_usuario = :nombre_usuario, 
          @correo_electronico = :correo_electronico, 
          @contrasena = :contrasena, 
          @perfil_asignado = :perfil_asignado,
          @estado = :estado,
          @hora_inicial = :hora_inicial,
          @hora_final = :hora_final`,
      {
        replacements: {
          id: userId,
          nombre,
          primer_apellido,
          segundo_apellido,
          nombre_usuario,
          correo_electronico,
          contrasena: hashedPassword,
          perfil_asignado,
          estado,
          hora_inicial,
          hora_final
        },
        type: QueryTypes.UPDATE,
      }
    );

    res.status(200).json({ message: "Update User successful" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};




