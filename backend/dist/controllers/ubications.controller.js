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
exports.getNeighborhoodByProvinciaCantonDistrict = exports.getDistrictByProvinciaCanton = exports.getCantonByProvince = exports.getAllProvince = void 0;
const sequelize_1 = require("sequelize");
const SqlServer_1 = __importDefault(require("../database/SqlServer"));
const getAllProvince = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const requirement = yield SqlServer_1.default.query("EXEC sp_obtener_ubicacion", // Agregamos @id_persona
        {
            type: sequelize_1.QueryTypes.SELECT, // Tipo de operación SELECT
        });
        res.status(200).json({ message: "Listado de Provincias", data: requirement });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getAllProvince = getAllProvince;
const getCantonByProvince = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { provincia } = req.params;
    try {
        const ubication = yield SqlServer_1.default.query(`EXEC sp_obtener_ubicacion @provincia = :provincia`, {
            replacements: { provincia },
            type: sequelize_1.QueryTypes.SELECT
        });
        if (!ubication.length) {
            res.status(404).json({ message: "Cantones no encontrados" });
            return;
        }
        res.status(200).json({ data: ubication });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getCantonByProvince = getCantonByProvince;
const getDistrictByProvinciaCanton = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { provincia, canton } = req.params;
    try {
        const ubication = yield SqlServer_1.default.query(`EXEC sp_obtener_ubicacion  @provincia = :provincia, @canton = :canton`, {
            replacements: { provincia, canton },
            type: sequelize_1.QueryTypes.SELECT
        });
        if (!ubication.length) {
            res.status(404).json({ message: "Distritos no encontrados" });
            return;
        }
        res.status(200).json({ data: ubication });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getDistrictByProvinciaCanton = getDistrictByProvinciaCanton;
const getNeighborhoodByProvinciaCantonDistrict = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { provincia, canton, distrito } = req.params;
    try {
        const ubication = yield SqlServer_1.default.query(`EXEC sp_obtener_ubicacion  @provincia = :provincia, @canton = :canton, @distrito = :distrito`, {
            replacements: { provincia, canton, distrito },
            type: sequelize_1.QueryTypes.SELECT
        });
        if (!ubication.length) {
            res.status(404).json({ message: "Barrios no encontrados" });
            return;
        }
        res.status(200).json({ data: ubication });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getNeighborhoodByProvinciaCantonDistrict = getNeighborhoodByProvinciaCantonDistrict;
