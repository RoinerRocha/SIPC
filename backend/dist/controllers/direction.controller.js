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
exports.getAllDirections = exports.getDireccionesByID = exports.getDireccionesByPersona = exports.deleteDireccion = exports.updateDireccion = exports.createDireccion = void 0;
const sequelize_1 = require("sequelize");
const SqlServer_1 = __importDefault(require("../database/SqlServer"));
// Crear una nueva dirección
const createDireccion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id_persona, provincia, canton, distrito, barrio, otras_senas, tipo_direccion, estado } = req.body;
    try {
        yield SqlServer_1.default.query(`EXEC sp_gestion_direccion @accion = 'I',
                                 @id_persona = :id_persona,
                                 @provincia = :provincia,
                                 @canton = :canton,
                                 @distrito = :distrito,
                                 @barrio = :barrio,
                                 @otras_senas = :otras_senas,
                                 @tipo_direccion = :tipo_direccion,
                                 @estado = :estado`, {
            replacements: { id_persona, provincia, canton, distrito, barrio, otras_senas, tipo_direccion, estado },
            type: sequelize_1.QueryTypes.INSERT,
        });
        res.status(201).json({ message: "Dirección creada exitosamente" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.createDireccion = createDireccion;
// Actualizar una dirección
const updateDireccion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id_direccion } = req.params;
    const { provincia, canton, distrito, barrio, otras_senas, tipo_direccion, estado } = req.body;
    try {
        yield SqlServer_1.default.query(`EXEC sp_gestion_direccion @accion = 'U',
                                 @id_direccion = :id_direccion,
                                 @provincia = :provincia,
                                 @canton = :canton,
                                 @distrito = :distrito,
                                 @barrio = :barrio,
                                 @otras_senas = :otras_senas,
                                 @tipo_direccion = :tipo_direccion,
                                 @estado = :estado`, {
            replacements: { id_direccion, provincia, canton, distrito, barrio, otras_senas, tipo_direccion, estado },
            type: sequelize_1.QueryTypes.UPDATE,
        });
        res.status(200).json({ message: "Dirección actualizada exitosamente" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.updateDireccion = updateDireccion;
// Desactivar una dirección
const deleteDireccion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id_direccion } = req.params;
    try {
        // Ejecuta el procedimiento almacenado con el tipo de acción 'D'
        yield SqlServer_1.default.query(`EXEC sp_gestion_direccion 
        @accion = 'D', 
        @id_direccion = :id_direccion`, {
            replacements: {
                tipo_accion: 'D', // Define la acción para desactivar la persona
                id_direccion: parseInt(id_direccion, 10) // Convierte id_persona a número si es necesario
            },
            type: sequelize_1.QueryTypes.UPDATE
        });
        res.status(200).json({ message: "Persona desactivada exitosamente" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.deleteDireccion = deleteDireccion;
// Obtener direcciones por ID de persona
const getDireccionesByPersona = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id_persona } = req.params;
    try {
        const direcciones = yield SqlServer_1.default.query(`EXEC sp_gestion_direccion @accion = 'Q', @id_persona = :id_persona`, {
            replacements: { id_persona },
            type: sequelize_1.QueryTypes.SELECT,
        });
        if (!direcciones.length) {
            res.status(404).json({ message: "No se encontraron direcciones para esta persona" });
            return;
        }
        res.status(200).json({ data: direcciones });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getDireccionesByPersona = getDireccionesByPersona;
const getDireccionesByID = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id_direccion } = req.params;
    try {
        const direccion = yield SqlServer_1.default.query(`EXEC sp_gestion_direccion @accion = 'G', @id_direccion = :id_direccion`, {
            replacements: { id_direccion },
            type: sequelize_1.QueryTypes.SELECT
        });
        if (!direccion.length) {
            res.status(404).json({ message: "Direccion no encontrada" });
            return;
        }
        res.status(200).json({ data: direccion[0] });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getDireccionesByID = getDireccionesByID;
const getAllDirections = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const persons = yield SqlServer_1.default.query("EXEC sp_gestion_direccion @accion = 'S', @id_persona = NULL", // Agregamos @id_persona
        {
            type: sequelize_1.QueryTypes.SELECT, // Tipo de operación SELECT
        });
        res.status(200).json({ message: "Listado de roles exitoso", data: persons });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getAllDirections = getAllDirections;
