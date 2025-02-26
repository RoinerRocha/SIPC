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
exports.getStates = exports.saveStates = void 0;
const sequelize_1 = require("sequelize");
const SqlServer_1 = __importDefault(require("../database/SqlServer"));
const saveStates = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { estado } = req.body;
    try {
        yield SqlServer_1.default.query("EXEC sp_gestion_estados @Action = 'I',  @estado = :estado", {
            replacements: {
                estado,
            },
            type: sequelize_1.QueryTypes.INSERT, // Tipo de operación, ya que estamos insertando un nuevo rol
        });
        res.status(201).json({ message: "Estado creado exitosamente" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.saveStates = saveStates;
const getStates = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const estados = yield SqlServer_1.default.query("EXEC sp_gestion_estados @Action = 'Q'", {
            type: sequelize_1.QueryTypes.SELECT, // Tipo de operación SELECT
        });
        res.status(200).json({ message: "Listado de estados exitoso", data: estados });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getStates = getStates;
