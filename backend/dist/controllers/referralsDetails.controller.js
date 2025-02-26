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
exports.getReferralsDetailsByIdRemision = exports.getReferralsDetailsById = exports.updateReferralsDetails = exports.createReferralDetails = void 0;
const sequelize_1 = require("sequelize");
const SqlServer_1 = __importDefault(require("../database/SqlServer"));
const createReferralDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id_remision, identificacion, tipo_documento, estado, observaciones } = req.body;
    try {
        yield SqlServer_1.default.query(`EXEC sp_gestion_detalle_remision @accion = 'I',
                                   @id_remision = :id_remision,
                                   @identificacion = :identificacion,
                                   @tipo_documento = :tipo_documento,
                                   @estado = :estado,
                                   @observaciones = :observaciones`, {
            replacements: { id_remision, identificacion, tipo_documento, estado, observaciones },
            type: sequelize_1.QueryTypes.INSERT,
        });
        res.status(201).json({ message: "Detalle de remision creado exitosamente" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.createReferralDetails = createReferralDetails;
const updateReferralsDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id_dremision } = req.params;
    const { estado, observaciones, } = req.body;
    try {
        yield SqlServer_1.default.query(`EXEC sp_gestion_detalle_remision @accion = 'U',
                                @id_dremision = :id_dremision,
                                @estado = :estado,
                                @observaciones = :observaciones`, {
            replacements: {
                id_dremision,
                estado,
                observaciones
            },
            type: sequelize_1.QueryTypes.UPDATE
        });
        res.status(200).json({ message: "Detalle actualizado exitosamente" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.updateReferralsDetails = updateReferralsDetails;
const getReferralsDetailsById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id_dremision } = req.params;
    try {
        const contact = yield SqlServer_1.default.query(`EXEC sp_gestion_detalle_remision @accion = 'Q', @id_dremision = :id_dremision`, {
            replacements: { id_dremision },
            type: sequelize_1.QueryTypes.SELECT
        });
        if (!contact.length) {
            res.status(404).json({ message: "Detalle no encontrado" });
            return;
        }
        res.status(200).json({ data: contact[0] });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getReferralsDetailsById = getReferralsDetailsById;
const getReferralsDetailsByIdRemision = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id_remision } = req.params;
    try {
        const contactos = yield SqlServer_1.default.query(`EXEC sp_gestion_detalle_remision @accion = 'S', @id_remision = :id_remision`, {
            replacements: { id_remision },
            type: sequelize_1.QueryTypes.SELECT,
        });
        if (!contactos.length) {
            res.status(404).json({ message: "No se encontraron detalles para esta remision" });
            return;
        }
        res.status(200).json({ data: contactos });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getReferralsDetailsByIdRemision = getReferralsDetailsByIdRemision;
