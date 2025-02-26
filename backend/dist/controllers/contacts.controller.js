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
exports.getAllContacts = exports.getContactsByID = exports.getContactsByPerson = exports.deleteContacts = exports.updateContacts = exports.createContact = void 0;
const sequelize_1 = require("sequelize");
const SqlServer_1 = __importDefault(require("../database/SqlServer"));
// Crear una nueva dirección
const createContact = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id_persona, tipo_contacto, identificador, estado, fecha_registro, comentarios } = req.body;
    try {
        yield SqlServer_1.default.query(`EXEC sp_gestion_contactos @accion = 'I',
                                   @id_persona = :id_persona,
                                   @tipo_contacto = :tipo_contacto,
                                   @identificador = :identificador,
                                   @estado = :estado,
                                   @fecha_registro = :fecha_registro,
                                   @comentarios = :comentarios`, {
            replacements: { id_persona, tipo_contacto, identificador, estado, fecha_registro, comentarios },
            type: sequelize_1.QueryTypes.INSERT,
        });
        res.status(201).json({ message: "Contacto creado exitosamente" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.createContact = createContact;
// Actualizar una dirección
const updateContacts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id_contacto } = req.params;
    const { tipo_contacto, identificador, estado, comentarios } = req.body;
    try {
        yield SqlServer_1.default.query(`EXEC sp_gestion_contactos @accion = 'U',
                                   @id_contacto = :id_contacto,
                                   @tipo_contacto = :tipo_contacto,
                                   @identificador = :identificador,
                                   @estado = :estado,
                                   @comentarios = :comentarios`, {
            replacements: { id_contacto, tipo_contacto, identificador, estado, comentarios },
            type: sequelize_1.QueryTypes.UPDATE,
        });
        res.status(200).json({ message: "Contacto actualizado exitosamente" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.updateContacts = updateContacts;
// Desactivar una dirección
const deleteContacts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id_contacto } = req.params;
    try {
        // Ejecuta el procedimiento almacenado con el tipo de acción 'D'
        yield SqlServer_1.default.query(`EXEC sp_gestion_contactos 
          @accion = 'D', 
          @id_contacto = :id_contacto`, {
            replacements: {
                tipo_accion: 'D', // Define la acción para desactivar la persona
                id_contacto: parseInt(id_contacto, 10) // Convierte id_persona a número si es necesario
            },
            type: sequelize_1.QueryTypes.UPDATE
        });
        res.status(200).json({ message: "Contacto desactivado exitosamente" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.deleteContacts = deleteContacts;
// Obtener direcciones por ID de persona
const getContactsByPerson = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id_persona } = req.params;
    try {
        const contactos = yield SqlServer_1.default.query(`EXEC sp_gestion_contactos @accion = 'Q', @id_persona = :id_persona`, {
            replacements: { id_persona },
            type: sequelize_1.QueryTypes.SELECT,
        });
        if (!contactos.length) {
            res.status(404).json({ message: "No se encontraron contactos para esta persona" });
            return;
        }
        res.status(200).json({ data: contactos });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getContactsByPerson = getContactsByPerson;
const getContactsByID = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id_contacto } = req.params;
    try {
        const contact = yield SqlServer_1.default.query(`EXEC sp_gestion_contactos @accion = 'G', @id_contacto = :id_contacto`, {
            replacements: { id_contacto },
            type: sequelize_1.QueryTypes.SELECT
        });
        if (!contact.length) {
            res.status(404).json({ message: "Contacto no encontrada" });
            return;
        }
        res.status(200).json({ data: contact[0] });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getContactsByID = getContactsByID;
const getAllContacts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const persons = yield SqlServer_1.default.query("EXEC sp_gestion_contactos @accion = 'S', @id_persona = NULL", // Agregamos @id_persona
        {
            type: sequelize_1.QueryTypes.SELECT, // Tipo de operación SELECT
        });
        res.status(200).json({ message: "Listado de roles exitoso", data: persons });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getAllContacts = getAllContacts;
