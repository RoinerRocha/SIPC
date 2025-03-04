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
exports.getStateFilesByGroup = exports.getAllStateFiles = void 0;
const sequelize_1 = require("sequelize");
const SqlServer_1 = __importDefault(require("../database/SqlServer"));
const getAllStateFiles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stateFiles = yield SqlServer_1.default.query("EXEC sp_gestion_estado_expediente @accion = 'A'", // Agregamos @id_persona
        {
            type: sequelize_1.QueryTypes.SELECT, // Tipo de operación SELECT
        });
        res.status(200).json({ message: "Listado de Estadios de expedientes", data: stateFiles });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getAllStateFiles = getAllStateFiles;
const getStateFilesByGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { grupo } = req.params;
    try {
        const group = yield SqlServer_1.default.query(`EXEC sp_gestion_estado_expediente @accion = 'Q', @grupo = :grupo`, {
            replacements: { grupo },
            type: sequelize_1.QueryTypes.SELECT,
        });
        if (!group.length) {
            res.status(404).json({ message: "No se encontraron estados para este grupo" });
            return;
        }
        res.status(200).json({ data: group });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getStateFilesByGroup = getStateFilesByGroup;
