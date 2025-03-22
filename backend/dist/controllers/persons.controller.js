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
exports.getAllDisabilities = exports.getPersonHistoryChanges = exports.getPersonByIdentifcation = exports.getPersonById = exports.getAllPersons = exports.deletePerson = exports.updatePerson = exports.createPerson = void 0;
const sequelize_1 = require("sequelize");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const SqlServer_1 = __importDefault(require("../database/SqlServer"));
// Crear una nueva persona
const createPerson = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id_persona, tipo_identificacion, numero_identifiacion, nombre, primer_apellido, segundo_apellido, fecha_nacimiento, genero, estado_civil, nacionalidad, fecha_registro, usuario_registro, nivel_estudios, asesor, discapacidad } = req.body;
    try {
        yield SqlServer_1.default.query(`EXEC sp_gestion_persona @tipo_accion = 'I',
                              @id_persona = :id_persona,
                              @tipo_identificacion = :tipo_identificacion,
                              @numero_identifiacion = :numero_identifiacion,
                              @nombre = :nombre,
                              @primer_apellido = :primer_apellido,
                              @segundo_apellido = :segundo_apellido,
                              @fecha_nacimiento = :fecha_nacimiento,
                              @genero = :genero,
                              @estado_civil = :estado_civil,
                              @nacionalidad = :nacionalidad,
                              @fecha_registro = :fecha_registro,
                              @usuario_registro = :usuario_registro,
                              @nivel_estudios = :nivel_estudios,
                              @asesor = :asesor,
                              @discapacidad = :discapacidad`, {
            replacements: {
                id_persona,
                tipo_identificacion,
                numero_identifiacion,
                nombre,
                primer_apellido,
                segundo_apellido,
                fecha_nacimiento,
                genero,
                estado_civil,
                nacionalidad,
                fecha_registro,
                usuario_registro,
                nivel_estudios,
                asesor,
                discapacidad
            },
            type: sequelize_1.QueryTypes.INSERT
        });
        const documentosPath = path_1.default.join(__dirname, "../../Documentos", id_persona.toString());
        if (!fs_1.default.existsSync(documentosPath)) {
            fs_1.default.mkdirSync(documentosPath, { recursive: true });
        }
        res.status(201).json({ message: "Persona creada exitosamente" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.createPerson = createPerson;
// Actualizar una persona
const updatePerson = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id_persona, usuario_sistema } = req.params;
    const { tipo_identificacion, numero_identifiacion, nombre, primer_apellido, segundo_apellido, fecha_nacimiento, genero, estado_civil, nacionalidad, fecha_registro, usuario_registro, nivel_estudios, asesor, discapacidad } = req.body;
    try {
        yield SqlServer_1.default.query(`EXEC sp_gestion_persona @tipo_accion = 'U',
                              @id_persona = :id_persona,
                              @tipo_identificacion = :tipo_identificacion,
                              @numero_identifiacion = :numero_identifiacion,
                              @nombre = :nombre,
                              @primer_apellido = :primer_apellido,
                              @segundo_apellido = :segundo_apellido,
                              @fecha_nacimiento = :fecha_nacimiento,
                              @genero = :genero,
                              @estado_civil = :estado_civil,
                              @nacionalidad = :nacionalidad,
                              @fecha_registro = :fecha_registro,
                              @usuario_registro = :usuario_registro,
                              @nivel_estudios = :nivel_estudios,
                              @asesor = :asesor,
                              @discapacidad = :discapacidad,
                              @usuario_sistema = :usuario_sistema`, {
            replacements: {
                id_persona,
                tipo_identificacion,
                numero_identifiacion,
                nombre,
                primer_apellido,
                segundo_apellido,
                fecha_nacimiento,
                genero,
                estado_civil,
                nacionalidad,
                fecha_registro,
                usuario_registro,
                nivel_estudios,
                asesor,
                discapacidad,
                usuario_sistema
            },
            type: sequelize_1.QueryTypes.UPDATE
        });
        res.status(200).json({ message: "Persona actualizada exitosamente" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.updatePerson = updatePerson;
// Eliminar (desactivar) una persona
const deletePerson = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id_persona } = req.params;
    try {
        // Ejecuta el procedimiento almacenado con el tipo de acción 'D'
        yield SqlServer_1.default.query(`EXEC sp_gestion_persona 
        @tipo_accion = 'D', 
        @id_persona = :id_persona`, {
            replacements: {
                tipo_accion: 'D', // Define la acción para desactivar la persona
                id_persona: parseInt(id_persona, 10) // Convierte id_persona a número si es necesario
            },
            type: sequelize_1.QueryTypes.UPDATE
        });
        res.status(200).json({ message: "Persona desactivada exitosamente" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.deletePerson = deletePerson;
const getAllPersons = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const persons = yield SqlServer_1.default.query("EXEC sp_gestion_persona @tipo_accion = 'S', @id_persona = NULL", // Agregamos @id_persona
        {
            type: sequelize_1.QueryTypes.SELECT, // Tipo de operación SELECT
        });
        res.status(200).json({ message: "Listado de roles exitoso", data: persons });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getAllPersons = getAllPersons;
// Obtener una persona por ID
const getPersonById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id_persona } = req.params;
    try {
        const person = yield SqlServer_1.default.query(`EXEC sp_gestion_persona @tipo_accion = 'Q', @id_persona = :id_persona`, {
            replacements: { id_persona },
            type: sequelize_1.QueryTypes.SELECT
        });
        if (!person.length) {
            res.status(404).json({ message: "Persona no encontrada" });
            return;
        }
        res.status(200).json({ data: person[0] });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getPersonById = getPersonById;
const getPersonByIdentifcation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { numero_identifiacion } = req.params;
    try {
        const person = yield SqlServer_1.default.query(`EXEC sp_gestion_persona @tipo_accion = 'N', @numero_identifiacion = :numero_identifiacion,  @id_persona = NULL`, {
            replacements: { numero_identifiacion },
            type: sequelize_1.QueryTypes.SELECT
        });
        if (!person.length) {
            res.status(404).json({ message: "Persona no encontrada" });
            return;
        }
        res.status(200).json({ data: person[0] });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getPersonByIdentifcation = getPersonByIdentifcation;
const getPersonHistoryChanges = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id_persona } = req.params;
    try {
        const miembro = yield SqlServer_1.default.query(`EXEC sp_gestion_persona @tipo_accion = 'B', @id_persona = :id_persona`, {
            replacements: { id_persona },
            type: sequelize_1.QueryTypes.SELECT
        });
        if (!miembro.length) {
            res.status(404).json({ message: "Persona no encontrada" });
            return;
        }
        // Devuelve todos los resultados en lugar del primero
        res.status(200).json({ data: miembro });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getPersonHistoryChanges = getPersonHistoryChanges;
const getAllDisabilities = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const disability = yield SqlServer_1.default.query("EXEC sp_get_discapacidades", // Agregamos @id_persona
        {
            type: sequelize_1.QueryTypes.SELECT, // Tipo de operación SELECT
        });
        res.status(200).json({ message: "Listado de roles exitoso", data: disability });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getAllDisabilities = getAllDisabilities;
