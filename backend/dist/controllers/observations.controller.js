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
exports.getAllObservations = exports.getObservationByPerson = exports.getObservationsByIDPerson = exports.createObservations = void 0;
const sequelize_1 = require("sequelize");
const SqlServer_1 = __importDefault(require("../database/SqlServer"));
const createObservations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id_persona, identificacion, fecha, observacion } = req.body;
    try {
        yield SqlServer_1.default.query(`EXEC sp_gestionar_observaciones @accion = 'I',
                                     @id_persona = :id_persona,
                                     @identificacion = :identificacion,
                                     @fecha = :fecha,
                                     @observacion = :observacion`, {
            replacements: { id_persona, identificacion, fecha, observacion },
            type: sequelize_1.QueryTypes.INSERT,
        });
        res.status(201).json({ message: "Obversacion creada exitosamente" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.createObservations = createObservations;
const getObservationsByIDPerson = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id_persona } = req.params;
    try {
        const persons = yield SqlServer_1.default.query(`EXEC sp_gestionar_observaciones @accion = 'Q', @id_persona = :id_persona, @identificacion = NULL`, {
            replacements: { id_persona },
            type: sequelize_1.QueryTypes.SELECT,
        });
        if (!persons.length) {
            res.status(404).json({ message: "No se encontraron observaciones para esta persona" });
            return;
        }
        res.status(200).json({ data: persons });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getObservationsByIDPerson = getObservationsByIDPerson;
const getObservationByPerson = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { identificacion } = req.params;
    try {
        const persons = yield SqlServer_1.default.query(`EXEC sp_gestionar_observaciones @accion = 'S', @identificacion = :identificacion`, {
            replacements: { identificacion },
            type: sequelize_1.QueryTypes.SELECT,
        });
        if (!persons.length) {
            res.status(404).json({ message: "No se encontraron observaciones para esta identificacion" });
            return;
        }
        res.status(200).json({ data: persons });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getObservationByPerson = getObservationByPerson;
const getAllObservations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const persons = yield SqlServer_1.default.query("EXEC sp_gestionar_observaciones @accion = 'G', @id_persona = NULL, @identificacion = NULL", // Agregamos @id_persona
        {
            type: sequelize_1.QueryTypes.SELECT, // Tipo de operación SELECT
        });
        res.status(200).json({ message: "Listado de observacioens creadas", data: persons });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getAllObservations = getAllObservations;
