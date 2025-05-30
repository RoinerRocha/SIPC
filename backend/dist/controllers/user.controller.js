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
exports.updateUserPassword = exports.updateUser = exports.deleteUser = exports.getCurrentUser = exports.getAllUser = exports.login = exports.register = void 0;
const sequelize_1 = require("sequelize");
const SqlServer_1 = __importDefault(require("../database/SqlServer"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { nombre, primer_apellido, segundo_apellido, nombre_usuario, correo_electronico, contrasena, perfil_asignado, estado, hora_inicial, hora_final, } = req.body;
    try {
        // Encriptar la contraseña antes de enviar al procedimiento almacenado
        const hashedPassword = yield bcrypt_1.default.hash(contrasena, 10);
        const formattedHoraInicial = hora_inicial ? (0, moment_timezone_1.default)(hora_inicial, "HH:mm:ss").format("HH:mm:ss") : null;
        const formattedHoraFinal = hora_final ? (0, moment_timezone_1.default)(hora_final, "HH:mm:ss").format("HH:mm:ss") : null;
        yield SqlServer_1.default.query("EXEC sp_gestion_usuarios @Action = 'I', @nombre = :nombre, @primer_apellido = :primer_apellido, @segundo_apellido = :segundo_apellido, @nombre_usuario = :nombre_usuario, @correo_electronico = :correo_electronico, @contrasena = :contrasena, @perfil_asignado = :perfil_asignado, @estado =:estado, @hora_inicial = :hora_inicial, @hora_final = :hora_final ", {
            replacements: {
                nombre,
                primer_apellido,
                segundo_apellido,
                nombre_usuario,
                correo_electronico,
                contrasena: hashedPassword,
                perfil_asignado,
                estado,
                hora_inicial: formattedHoraInicial,
                hora_final: formattedHoraFinal,
            },
            type: sequelize_1.QueryTypes.INSERT, // Utiliza QueryTypes
        });
        res.status(201).json({ message: "Usuario creado exitosamente" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { nombre_usuario, contrasena } = req.body;
    try {
        // Obtener la información del usuario
        const [user] = yield SqlServer_1.default.query(`EXEC sp_gestion_usuarios @Action = 'V', @nombre_usuario = :nombre_usuario`, {
            replacements: { nombre_usuario },
            type: sequelize_1.QueryTypes.SELECT,
        });
        if (!user) {
            res.status(404).json({ message: "Usuario no encontrado" });
            return;
        }
        if (user.estado !== "activo") {
            res.status(403).json({ message: "Usuario inactivo, contacte al administrador" });
            return;
        }
        // Validar si la contraseña es correcta
        const isPasswordValid = yield bcrypt_1.default.compare(contrasena, user.contrasena);
        if (!isPasswordValid) {
            res.status(401).json({ message: "Contraseña Equivocada" });
            return;
        }
        // const currentTime = moment().format("HH:mm:ss"); // Hora actual
        // const horaInicio = moment(user.hora_inicial.trim(), "HH:mm:ss").format("HH:mm:ss");
        // const horaFin = moment(user.hora_final.trim(), "HH:mm:ss").format("HH:mm:ss");
        // console.log("🔍 Backend - Hora actual:", currentTime);
        // console.log("🟢 Backend - Hora Inicial (formateada):", horaInicio);
        // console.log("🔴 Backend - Hora Final (formateada):", horaFin);
        // if (currentTime < horaInicio || currentTime > horaFin) {
        //   res.status(403).json({ message: "Favor ingresar en las horas admitidas" });
        //   return;
        // }
        // Generar token de autenticación
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            nombre_usuario: user.nombre_usuario,
            perfil_asignado: user.perfil_asignado,
            correo_electronico: user.correo_electronico,
            estado: user.estado,
            hora_inicial: user.hora_inicial,
            hora_final: user.hora_final,
        }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.status(200).json({ message: "Login successful", token });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.login = login;
const getAllUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield SqlServer_1.default.query("EXEC sp_gestion_usuarios @Action = 'Q'", {
            type: sequelize_1.QueryTypes.SELECT,
        });
        res.status(200).json({ message: "List of Users successful", data: users });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getAllUser = getAllUser;
const getCurrentUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        if (!token) {
            res.status(401).json({ message: "Token de autorización no encontrado" });
            return;
        }
        const decodedToken = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const [user] = yield SqlServer_1.default.query("EXEC sp_gestion_usuarios @Action = 'S', @nombre_usuario = :nombre_usuario", {
            replacements: { nombre_usuario: decodedToken.nombre_usuario },
            type: sequelize_1.QueryTypes.SELECT,
        });
        if (!user) {
            res.status(404).json({ message: "Usuario no encontrado" });
            return;
        }
        const userToken = jsonwebtoken_1.default.sign({
            id: user.id,
            nombre_usuario: user.nombre_usuario,
            perfil_asignado: user.perfil_asignado,
            correo_electronico: user.correo_electronico,
            estado: user.estado,
        }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.status(200).json({ token: userToken });
    }
    catch (error) {
        res.status(500).json({ message: "Error al obtener el usuario actual" });
    }
});
exports.getCurrentUser = getCurrentUser;
// Eliminar un usuario
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    try {
        const result = yield SqlServer_1.default.query("EXEC EliminarUsuario @id = :id", {
            replacements: { id: userId },
            type: sequelize_1.QueryTypes.DELETE,
        });
        if (result.affectedRows === 0) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json({ message: "Delete User successful" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.deleteUser = deleteUser;
// Actualizar un usuario
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    const { nombre, primer_apellido, segundo_apellido, nombre_usuario, correo_electronico, contrasena, perfil_asignado, estado, hora_inicial, hora_final, } = req.body;
    try {
        const hashedPassword = contrasena && contrasena.trim() !== ''
            ? yield bcrypt_1.default.hash(contrasena, 10)
            : null;
        const formattedHoraInicial = hora_inicial ? (0, moment_timezone_1.default)(hora_inicial, "HH:mm:ss").format("HH:mm:ss") : null;
        const formattedHoraFinal = hora_final ? (0, moment_timezone_1.default)(hora_final, "HH:mm:ss").format("HH:mm:ss") : null;
        yield SqlServer_1.default.query(`EXEC sp_gestion_usuarios 
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
          @hora_final = :hora_final`, {
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
                hora_inicial: formattedHoraInicial,
                hora_final: formattedHoraFinal,
            },
            type: sequelize_1.QueryTypes.UPDATE,
        });
        res.status(200).json({ message: "Update User successful" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.updateUser = updateUser;
const updateUserPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    const { contrasena, } = req.body;
    try {
        const hashedPassword = contrasena && contrasena.trim() !== ''
            ? yield bcrypt_1.default.hash(contrasena, 10)
            : null;
        yield SqlServer_1.default.query(`EXEC sp_gestion_usuarios 
          @Action = 'C',
          @id = :id, 
          @contrasena = :contrasena`, {
            replacements: {
                id: userId,
                contrasena: hashedPassword,
            },
            type: sequelize_1.QueryTypes.UPDATE,
        });
        res.status(200).json({ message: "Update User successful" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.updateUserPassword = updateUserPassword;
