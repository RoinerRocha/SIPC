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
exports.getAllPayments = exports.getPaymentsByIDPago = exports.getPaymentsByIDPerson = exports.getPaymentsByPerson = exports.updatePayment = exports.createPayment = exports.upload = void 0;
const sequelize_1 = require("sequelize");
const SqlServer_1 = __importDefault(require("../database/SqlServer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const id_persona = req.body.id_persona;
        const documentosPath = path_1.default.join(__dirname, "../../Documentos", id_persona.toString());
        if (!fs_1.default.existsSync(documentosPath)) {
            fs_1.default.mkdirSync(documentosPath, { recursive: true });
        }
        cb(null, documentosPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
    },
});
exports.upload = (0, multer_1.default)({ storage }).single("archivo");
const createPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id_persona, identificacion, comprobante, tipo_pago, fecha_pago, fecha_presentacion, estado, monto, moneda, usuario, observaciones, archivo, tipo_movimiento } = req.body;
    let archivoPath = null;
    if (req.file) {
        archivoPath = path_1.default.join("Documentos", id_persona.toString(), req.file.filename);
    }
    try {
        yield SqlServer_1.default.query(`EXEC sp_gestion_pagos @accion = 'I',
                                   @id_persona = :id_persona,
                                   @identificacion = :identificacion,
                                   @comprobante = :comprobante,
                                   @tipo_pago = :tipo_pago,
                                   @fecha_pago = :fecha_pago,
                                   @fecha_presentacion = :fecha_presentacion,
                                   @estado = :estado,
                                   @monto = :monto,
                                   @moneda = :moneda,
                                   @usuario = :usuario,
                                   @observaciones = :observaciones,
                                   @archivo = :archivo,
                                   @tipo_movimiento = :tipo_movimiento`, {
            replacements: { id_persona, identificacion, comprobante, tipo_pago, fecha_pago, fecha_presentacion, estado, monto, moneda, usuario, observaciones, archivo: archivoPath, tipo_movimiento },
            type: sequelize_1.QueryTypes.INSERT,
        });
        res.status(201).json({ message: "Pago creado exitosamente" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.createPayment = createPayment;
const updatePayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id_pago } = req.params;
    const { estado, observaciones, } = req.body;
    try {
        yield SqlServer_1.default.query(`EXEC sp_gestion_pagos @accion = 'U',
                              @id_pago = :id_pago,
                              @estado = :estado,
                              @observaciones = :observaciones`, {
            replacements: {
                id_pago,
                estado,
                observaciones
            },
            type: sequelize_1.QueryTypes.UPDATE
        });
        res.status(200).json({ message: "Pago actualizado exitosamente" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.updatePayment = updatePayment;
const getPaymentsByPerson = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { identificacion } = req.params;
    try {
        const persons = yield SqlServer_1.default.query(`EXEC sp_gestion_pagos @accion = 'Q', @identificacion = :identificacion`, {
            replacements: { identificacion },
            type: sequelize_1.QueryTypes.SELECT,
        });
        if (!persons.length) {
            res.status(404).json({ message: "No se encontraron pagos para esta persona" });
            return;
        }
        res.status(200).json({ data: persons });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getPaymentsByPerson = getPaymentsByPerson;
const getPaymentsByIDPerson = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id_persona } = req.params;
    try {
        const persons = yield SqlServer_1.default.query(`EXEC sp_gestion_pagos @accion = 'S', @id_persona = :id_persona`, {
            replacements: { id_persona },
            type: sequelize_1.QueryTypes.SELECT,
        });
        if (!persons.length) {
            res.status(404).json({ message: "No se encontraron pagos para esta persona" });
            return;
        }
        res.status(200).json({ data: persons });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getPaymentsByIDPerson = getPaymentsByIDPerson;
const getPaymentsByIDPago = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id_pago } = req.params;
    try {
        const payments = yield SqlServer_1.default.query(`EXEC sp_gestion_pagos @accion = 'G', @id_pago = :id_pago`, {
            replacements: { id_pago },
            type: sequelize_1.QueryTypes.SELECT
        });
        if (!payments.length) {
            res.status(404).json({ message: "Ingreso no encontrada" });
            return;
        }
        res.status(200).json({ data: payments[0] });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getPaymentsByIDPago = getPaymentsByIDPago;
const getAllPayments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payments = yield SqlServer_1.default.query("EXEC sp_gestion_pagos @accion = 'A', @id_pago = NULL", // Agregamos @id_persona
        {
            type: sequelize_1.QueryTypes.SELECT, // Tipo de operación SELECT
        });
        res.status(200).json({ message: "Listado de observacioens creadas", data: payments });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getAllPayments = getAllPayments;
