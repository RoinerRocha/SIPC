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
exports.getMemberByID = exports.getMemberByPerson = exports.deleteMember = exports.updateMember = exports.createFamilyMember = void 0;
const sequelize_1 = require("sequelize");
const SqlServer_1 = __importDefault(require("../database/SqlServer"));
const createFamilyMember = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idpersona, cedula, nombre_completo, fecha_nacimiento, relacion, ingresos, observaciones } = req.body;
    try {
        yield SqlServer_1.default.query(`EXEC sp_gestion_nucleo_familiar @opcion = 'I',
                                   @idpersona = :idpersona,
                                   @cedula = :cedula,
                                   @nombre_completo = :nombre_completo,
                                   @fecha_nacimiento = :fecha_nacimiento,
                                   @relacion = :relacion,
                                   @ingresos = :ingresos,
                                   @observaciones = :observaciones`, {
            replacements: { idpersona, cedula, nombre_completo, fecha_nacimiento, relacion, ingresos, observaciones },
            type: sequelize_1.QueryTypes.INSERT,
        });
        res.status(201).json({ message: "Integrante familiar creado exitosamente" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.createFamilyMember = createFamilyMember;
const updateMember = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idnucleo } = req.params;
    const { cedula, nombre_completo, fecha_nacimiento, relacion, ingresos, observaciones, } = req.body;
    try {
        yield SqlServer_1.default.query(`EXEC sp_gestion_nucleo_familiar @opcion = 'U',
                                @idnucleo = :idnucleo,
                                @cedula = :cedula,
                                @nombre_completo = :nombre_completo,
                                @fecha_nacimiento = :fecha_nacimiento,
                                @relacion = :relacion,
                                @ingresos = :ingresos,
                                @observaciones = :observaciones`, {
            replacements: {
                idnucleo,
                cedula,
                nombre_completo,
                fecha_nacimiento,
                relacion,
                ingresos,
                observaciones
            },
            type: sequelize_1.QueryTypes.UPDATE
        });
        res.status(200).json({ message: "Miembro familiar actualizado exitosamente" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.updateMember = updateMember;
const deleteMember = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idnucleo } = req.params;
    try {
        // Ejecuta el procedimiento almacenado con el tipo de acción 'D'
        yield SqlServer_1.default.query(`EXEC sp_gestion_nucleo_familiar 
        @opcion = 'D', 
        @idnucleo = :idnucleo`, {
            replacements: {
                tipo_accion: 'D', // Define la acción para desactivar la persona
                idnucleo: parseInt(idnucleo, 10) // Convierte id_persona a número si es necesario
            },
            type: sequelize_1.QueryTypes.DELETE
        });
        res.status(200).json({ message: "Miembro familiar eliminado exitosamente" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.deleteMember = deleteMember;
const getMemberByPerson = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idpersona } = req.params;
    try {
        const contactos = yield SqlServer_1.default.query(`EXEC sp_gestion_nucleo_familiar @opcion = 'Q', @idpersona = :idpersona`, {
            replacements: { idpersona },
            type: sequelize_1.QueryTypes.SELECT,
        });
        if (!contactos.length) {
            res.status(404).json({ message: "No se encontraron familiares para esta persona" });
            return;
        }
        res.status(200).json({ data: contactos });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getMemberByPerson = getMemberByPerson;
const getMemberByID = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idnucleo } = req.params;
    try {
        const miembro = yield SqlServer_1.default.query(`EXEC sp_gestion_nucleo_familiar @opcion = 'S', @idnucleo = :idnucleo`, {
            replacements: { idnucleo },
            type: sequelize_1.QueryTypes.SELECT
        });
        if (!miembro.length) {
            res.status(404).json({ message: "Miembro no encontrado" });
            return;
        }
        res.status(200).json({ data: miembro[0] });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getMemberByID = getMemberByID;
