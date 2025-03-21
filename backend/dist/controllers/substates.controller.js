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
exports.getAllStateEntity = exports.getAllEntity = exports.getAllBanhviPurpose = exports.getAllBanhviState = exports.getAllCompanyProgram = exports.getAllCompanySituation = void 0;
const sequelize_1 = require("sequelize");
const SqlServer_1 = __importDefault(require("../database/SqlServer"));
const getAllCompanySituation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const files = yield SqlServer_1.default.query("EXEC sp_gestion_subestados_expediente @accion = 'A'", {
            type: sequelize_1.QueryTypes.SELECT, // Tipo de operación SELECT
        });
        res.status(200).json({ message: "Situacion Empresa exitoso", data: files });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getAllCompanySituation = getAllCompanySituation;
const getAllCompanyProgram = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const files = yield SqlServer_1.default.query("EXEC sp_gestion_subestados_expediente @accion = 'B'", {
            type: sequelize_1.QueryTypes.SELECT, // Tipo de operación SELECT
        });
        res.status(200).json({ message: "Programa Empresa exitoso", data: files });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getAllCompanyProgram = getAllCompanyProgram;
const getAllBanhviState = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const files = yield SqlServer_1.default.query("EXEC sp_gestion_subestados_expediente @accion = 'C'", {
            type: sequelize_1.QueryTypes.SELECT, // Tipo de operación SELECT
        });
        res.status(200).json({ message: "Estado Banhvi exitoso", data: files });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getAllBanhviState = getAllBanhviState;
const getAllBanhviPurpose = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const files = yield SqlServer_1.default.query("EXEC sp_gestion_subestados_expediente @accion = 'D'", {
            type: sequelize_1.QueryTypes.SELECT, // Tipo de operación SELECT
        });
        res.status(200).json({ message: "Proposito Banhvi exitoso", data: files });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getAllBanhviPurpose = getAllBanhviPurpose;
const getAllEntity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const files = yield SqlServer_1.default.query("EXEC sp_gestion_subestados_expediente @accion = 'E'", {
            type: sequelize_1.QueryTypes.SELECT, // Tipo de operación SELECT
        });
        res.status(200).json({ message: "Entidades exitoso", data: files });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getAllEntity = getAllEntity;
const getAllStateEntity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const files = yield SqlServer_1.default.query("EXEC sp_gestion_subestados_expediente @accion = 'F'", {
            type: sequelize_1.QueryTypes.SELECT, // Tipo de operación SELECT
        });
        res.status(200).json({ message: "Estado Entidades exitoso", data: files });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getAllStateEntity = getAllStateEntity;
