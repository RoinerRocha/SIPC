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
exports.getSegmentos = exports.getAllIncomes = exports.getIncomesByID = exports.getIncomesByPerson = exports.deleteIncome = exports.updateIncome = exports.createIncome = void 0;
const sequelize_1 = require("sequelize");
const SqlServer_1 = __importDefault(require("../database/SqlServer"));
// Crear una nueva dirección
const createIncome = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id_persona, segmento, subsegmento, patrono, ocupacion, salario_bruto, salario_neto, fecha_ingreso, estado, principal } = req.body;
    try {
        yield SqlServer_1.default.query(`EXEC sp_gestion_ingresos @accion = 'I',
                                   @id_persona = :id_persona,
                                   @segmento = :segmento,
                                   @subsegmento = :subsegmento,
                                   @patrono = :patrono,
                                   @ocupacion = :ocupacion,
                                   @salario_bruto = :salario_bruto,
                                   @salario_neto = :salario_neto,
                                   @fecha_ingreso = :fecha_ingreso,
                                   @estado = :estado,
                                   @principal = :principal`, {
            replacements: { id_persona, segmento, subsegmento, patrono, ocupacion, salario_bruto, salario_neto, fecha_ingreso, estado, principal },
            type: sequelize_1.QueryTypes.INSERT,
        });
        res.status(201).json({ message: "Ingreso creado exitosamente" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.createIncome = createIncome;
// Actualizar una dirección
const updateIncome = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id_ingreso } = req.params;
    const { segmento, subsegmento, patrono, ocupacion, salario_bruto, salario_neto, fecha_ingreso, estado, principal, } = req.body;
    try {
        yield SqlServer_1.default.query(`EXEC sp_gestion_ingresos @accion = 'U',
                                @id_ingreso = :id_ingreso,
                                @segmento = :segmento,
                                @subsegmento = :subsegmento,
                                @patrono = :patrono,
                                @ocupacion = :ocupacion,
                                @salario_bruto = :salario_bruto,
                                @salario_neto = :salario_neto,
                                @fecha_ingreso = :fecha_ingreso,
                                @estado = :estado,
                                @principal = :principal`, {
            replacements: {
                id_ingreso,
                segmento,
                subsegmento,
                patrono,
                ocupacion,
                salario_bruto,
                salario_neto,
                fecha_ingreso,
                estado,
                principal
            },
            type: sequelize_1.QueryTypes.UPDATE
        });
        res.status(200).json({ message: "Persona actualizada exitosamente" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.updateIncome = updateIncome;
// Desactivar una dirección
const deleteIncome = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id_ingreso } = req.params;
    try {
        // Ejecuta el procedimiento almacenado con el tipo de acción 'D'
        yield SqlServer_1.default.query(`EXEC sp_gestion_ingresos 
          @accion = 'D', 
          @id_ingreso = :id_ingreso`, {
            replacements: {
                tipo_accion: 'D', // Define la acción para desactivar la persona
                id_ingreso: parseInt(id_ingreso, 10) // Convierte id_persona a número si es necesario
            },
            type: sequelize_1.QueryTypes.UPDATE
        });
        res.status(200).json({ message: "Ingreso desactivado exitosamente" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.deleteIncome = deleteIncome;
// Obtener direcciones por ID de persona
const getIncomesByPerson = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id_persona } = req.params;
    try {
        const contactos = yield SqlServer_1.default.query(`EXEC sp_gestion_ingresos @accion = 'Q', @id_persona = :id_persona`, {
            replacements: { id_persona },
            type: sequelize_1.QueryTypes.SELECT,
        });
        if (!contactos.length) {
            res.status(404).json({ message: "No se encontraron ingresos para esta persona" });
            return;
        }
        res.status(200).json({ data: contactos });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getIncomesByPerson = getIncomesByPerson;
const getIncomesByID = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id_ingreso } = req.params;
    try {
        const contact = yield SqlServer_1.default.query(`EXEC sp_gestion_ingresos @accion = 'G', @id_ingreso = :id_ingreso`, {
            replacements: { id_ingreso },
            type: sequelize_1.QueryTypes.SELECT
        });
        if (!contact.length) {
            res.status(404).json({ message: "Ingreso no encontrada" });
            return;
        }
        res.status(200).json({ data: contact[0] });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getIncomesByID = getIncomesByID;
const getAllIncomes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const persons = yield SqlServer_1.default.query("EXEC sp_gestion_ingresos @accion = 'S', @id_persona = NULL", // Agregamos @id_persona
        {
            type: sequelize_1.QueryTypes.SELECT, // Tipo de operación SELECT
        });
        res.status(200).json({ message: "Listado de roles exitoso", data: persons });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getAllIncomes = getAllIncomes;
const getSegmentos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { segmento } = req.params;
    try {
        const contactos = yield SqlServer_1.default.query(`EXEC sp_obtener_segmentos @p_segmento = :segmento `, {
            replacements: { segmento },
            type: sequelize_1.QueryTypes.SELECT,
        });
        if (!contactos.length) {
            res.status(404).json({ message: "No se encontraron segmentos" });
            return;
        }
        res.status(200).json({ data: contactos });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getSegmentos = getSegmentos;
