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
exports.getAllReferrals = exports.getReferralsById = exports.updateReferrals = exports.createReferral = void 0;
const sequelize_1 = require("sequelize");
const SqlServer_1 = __importDefault(require("../database/SqlServer"));
const createReferral = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { fecha_preparacion, fecha_envio, usuario_prepara, entidad_destino, estado } = req.body;
    try {
        yield SqlServer_1.default.query(`EXEC sp_gestion_maestro_remision @accion = 'I',
                                   @fecha_preparacion = :fecha_preparacion,
                                   @fecha_envio = :fecha_envio,
                                   @usuario_prepara = :usuario_prepara,
                                   @entidad_destino = :entidad_destino,
                                   @estado = :estado`, {
            replacements: { fecha_preparacion, fecha_envio, usuario_prepara, entidad_destino, estado },
            type: sequelize_1.QueryTypes.INSERT,
        });
        res.status(201).json({ message: "Remision creado exitosamente" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.createReferral = createReferral;
const updateReferrals = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id_remision } = req.params;
    const { estado, entidad_destino, } = req.body;
    try {
        yield SqlServer_1.default.query(`EXEC sp_gestion_maestro_remision @accion = 'U',
                                @id_remision = :id_remision,
                                @estado = :estado,
                                @entidad_destino = :entidad_destino`, {
            replacements: {
                id_remision,
                estado,
                entidad_destino
            },
            type: sequelize_1.QueryTypes.UPDATE
        });
        res.status(200).json({ message: "Remision actualizada exitosamente" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.updateReferrals = updateReferrals;
const getReferralsById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id_remision } = req.params;
    try {
        const contact = yield SqlServer_1.default.query(`EXEC sp_gestion_maestro_remision @accion = 'Q', @id_remision = :id_remision`, {
            replacements: { id_remision },
            type: sequelize_1.QueryTypes.SELECT
        });
        if (!contact.length) {
            res.status(404).json({ message: "Remision no encontrada" });
            return;
        }
        res.status(200).json({ data: contact[0] });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getReferralsById = getReferralsById;
const getAllReferrals = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const requirement = yield SqlServer_1.default.query("EXEC sp_gestion_maestro_remision @accion = 'A' ", // Agregamos @id_persona
        {
            type: sequelize_1.QueryTypes.SELECT, // Tipo de operación SELECT
        });
        res.status(200).json({ message: "Listado de remisiones exitoso", data: requirement });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getAllReferrals = getAllReferrals;
