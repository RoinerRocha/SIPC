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
exports.downloadRequirementFile = exports.getAllBaseRequirements = exports.getAllRequirements = exports.getRequirementsByIdentification = exports.getRequirementsById = exports.getRequirementsByPerson = exports.updateRequirements = exports.createRequirements = exports.upload = void 0;
const sequelize_1 = require("sequelize");
const SqlServer_1 = __importDefault(require("../database/SqlServer"));
const multer_1 = __importDefault(require("multer"));
const azureStorage_1 = require("../util/azureStorage"); // ajusta el path según tu estructura
const azureStorage_2 = require("../util/azureStorage");
const azureFirewall_1 = require("../util/azureFirewall");
const storage = multer_1.default.memoryStorage();
exports.upload = (0, multer_1.default)({ storage }).single("archivo");
const createRequirements = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id_persona, tipo_requisito, estado, fecha_vigencia, fecha_vencimiento, observaciones } = req.body;
    let archivoPath = null;
    const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const clientIp = Array.isArray(rawIp) ? rawIp[0] : rawIp;
    try {
        yield (0, azureFirewall_1.allowIpInAzureStorage)(clientIp);
        if (req.file) {
            const filename = `${Date.now()}_${req.file.originalname}`;
            archivoPath = yield (0, azureStorage_1.uploadFileToAzure)(filename, req.file.buffer); // ⬅️ Subida directa a Azure
        }
        yield SqlServer_1.default.query(`EXEC sp_gestion_requisitos @accion = 'I',
                                    @id_persona = :id_persona,
                                    @tipo_requisito = :tipo_requisito,
                                    @estado = :estado,
                                    @fecha_vigencia = :fecha_vigencia,
                                    @fecha_vencimiento = :fecha_vencimiento,
                                    @observaciones = :observaciones,
                                    @archivo = :archivo`, {
            replacements: { id_persona, tipo_requisito, estado, fecha_vigencia, fecha_vencimiento, observaciones, archivo: archivoPath },
            type: sequelize_1.QueryTypes.INSERT,
        });
        res.status(201).json({ message: "Requisito creado exitosamente" });
    }
    catch (error) {
        res.status(500).json({ error: error.message, ip: clientIp });
    }
});
exports.createRequirements = createRequirements;
const updateRequirements = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id_requisito } = req.params;
    const { estado, fecha_vigencia, fecha_vencimiento, observaciones, } = req.body;
    try {
        yield SqlServer_1.default.query(`EXEC sp_gestion_requisitos @accion = 'U',
                                @id_requisito = :id_requisito,
                                @identificacion = NULL,
                                @estado = :estado,
                                @fecha_vigencia = :fecha_vigencia,
                                @fecha_vencimiento = :fecha_vencimiento,
                                @observaciones = :observaciones`, {
            replacements: {
                id_requisito,
                estado,
                fecha_vigencia,
                fecha_vencimiento,
                observaciones
            },
            type: sequelize_1.QueryTypes.UPDATE
        });
        res.status(200).json({ message: "Requisito actualizado exitosamente" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.updateRequirements = updateRequirements;
const getRequirementsByPerson = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id_persona } = req.params;
    try {
        const miembro = yield SqlServer_1.default.query(`EXEC sp_gestion_requisitos @accion = 'Q', @id_persona = :id_persona, @identificacion = NULL`, {
            replacements: { id_persona },
            type: sequelize_1.QueryTypes.SELECT
        });
        if (!miembro.length) {
            res.status(404).json({ message: "Requisito no encontrado" });
            return;
        }
        // Devuelve todos los resultados en lugar del primero
        res.status(200).json({ data: miembro });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getRequirementsByPerson = getRequirementsByPerson;
const getRequirementsById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id_requisito } = req.params;
    try {
        const contact = yield SqlServer_1.default.query(`EXEC sp_gestion_requisitos @accion = 'S', @id_requisito = :id_requisito`, {
            replacements: { id_requisito },
            type: sequelize_1.QueryTypes.SELECT
        });
        if (!contact.length) {
            res.status(404).json({ message: "Requisito no encontrada" });
            return;
        }
        res.status(200).json({ data: contact[0] });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getRequirementsById = getRequirementsById;
const getRequirementsByIdentification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { identificacion } = req.params;
    try {
        const miembro = yield SqlServer_1.default.query(`EXEC sp_gestion_requisitos @accion = 'G', @identificacion = :identificacion`, {
            replacements: { identificacion },
            type: sequelize_1.QueryTypes.SELECT
        });
        if (!miembro.length) {
            res.status(404).json({ message: "Requisito no encontrado para esta persona" });
            return;
        }
        // Devuelve todos los resultados en lugar del primero
        res.status(200).json({ data: miembro });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getRequirementsByIdentification = getRequirementsByIdentification;
const getAllRequirements = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const requirement = yield SqlServer_1.default.query("EXEC sp_gestion_requisitos @accion = 'A', @id_requisito = NULL, @id_persona = NULL, @identificacion = NULL", // Agregamos @id_persona
        {
            type: sequelize_1.QueryTypes.SELECT, // Tipo de operación SELECT
        });
        res.status(200).json({ message: "Listado de requisitos exitoso", data: requirement });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getAllRequirements = getAllRequirements;
const getAllBaseRequirements = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const requirement = yield SqlServer_1.default.query("EXEC sp_gestion_requisitos @accion = 'X'", // Agregamos @id_persona
        {
            type: sequelize_1.QueryTypes.SELECT, // Tipo de operación SELECT
        });
        res.status(200).json({ message: "Listado de requisitos base exitoso", data: requirement });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getAllBaseRequirements = getAllBaseRequirements;
const downloadRequirementFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { filename } = req.params;
    try {
        const fileStream = yield (0, azureStorage_2.getFileFromAzure)(filename);
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res.setHeader("Content-Type", "application/octet-stream");
        fileStream.pipe(res); // ⬅️ Envía el archivo directamente al cliente
    }
    catch (error) {
        res.status(500).json({ error: "Error al descargar el archivo: " + error.message });
    }
});
exports.downloadRequirementFile = downloadRequirementFile;
