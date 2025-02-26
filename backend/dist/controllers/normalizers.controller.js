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
exports.getUniqueCompanies = exports.getNormalizeByCompany = exports.getAllNormalizers = exports.getNormalizersById = exports.updateNormalizers = exports.createNormalizers = void 0;
const sequelize_1 = require("sequelize");
const SqlServer_1 = __importDefault(require("../database/SqlServer"));
const createNormalizers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { nombre, tipo, empresa, estado, fecha_registro } = req.body;
    try {
        yield SqlServer_1.default.query(`EXEC sp_gestion_normalizadores @accion = 'I',
                                     @nombre = :nombre,
                                     @tipo = :tipo,
                                     @empresa = :empresa,
                                     @estado = :estado,
                                     @fecha_registro = :fecha_registro`, {
            replacements: { nombre, tipo, empresa, estado, fecha_registro },
            type: sequelize_1.QueryTypes.INSERT,
        });
        res.status(201).json({ message: "Normalizacion creada exitosamente" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.createNormalizers = createNormalizers;
const updateNormalizers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { nombre, tipo, empresa, estado, fecha_registro, } = req.body;
    try {
        yield SqlServer_1.default.query(`EXEC sp_gestion_normalizadores @accion = 'U',
                                @id = :id,
                                @nombre = :nombre,
                                @tipo = :tipo,
                                @empresa = :empresa,
                                @estado = :estado,
                                @fecha_registro = :fecha_registro`, {
            replacements: {
                id,
                nombre,
                tipo,
                empresa,
                estado,
                fecha_registro
            },
            type: sequelize_1.QueryTypes.UPDATE
        });
        res.status(200).json({ message: "Normalizador actualizado exitosamente" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.updateNormalizers = updateNormalizers;
const getNormalizersById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const normalizer = yield SqlServer_1.default.query(`EXEC sp_gestion_normalizadores @accion = 'Q', @id = :id`, {
            replacements: { id },
            type: sequelize_1.QueryTypes.SELECT
        });
        if (!normalizer.length) {
            res.status(404).json({ message: "Normalizacion no encontrada" });
            return;
        }
        res.status(200).json({ data: normalizer[0] });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getNormalizersById = getNormalizersById;
const getAllNormalizers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const normalizer = yield SqlServer_1.default.query("EXEC sp_gestion_normalizadores @accion = 'A' ", // Agregamos @id_persona
        {
            type: sequelize_1.QueryTypes.SELECT, // Tipo de operación SELECT
        });
        res.status(200).json({ message: "Listado de normalizaciones", data: normalizer });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getAllNormalizers = getAllNormalizers;
const getNormalizeByCompany = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { empresa } = req.params;
    try {
        const company = yield SqlServer_1.default.query(`EXEC sp_gestion_normalizadores @accion = 'S', @empresa = :empresa`, {
            replacements: { empresa },
            type: sequelize_1.QueryTypes.SELECT,
        });
        if (!company.length) {
            res.status(404).json({ message: "No se encontraron Normalizaciones para esta compania" });
            return;
        }
        res.status(200).json({ data: company });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getNormalizeByCompany = getNormalizeByCompany;
const getUniqueCompanies = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const companies = yield SqlServer_1.default.query(`EXEC sp_gestion_normalizadores @accion = 'E'`, {
            type: sequelize_1.QueryTypes.SELECT,
        });
        res.status(200).json({ message: "Lista de empresas únicas", data: companies });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getUniqueCompanies = getUniqueCompanies;
