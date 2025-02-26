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
exports.updateRole = exports.deleteRole = exports.getRoles = exports.saveRoles = void 0;
const roles_1 = __importDefault(require("../models/roles"));
const sequelize_1 = require("sequelize");
const SqlServer_1 = __importDefault(require("../database/SqlServer"));
const saveRoles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { rol } = req.body;
    try {
        yield SqlServer_1.default.query("EXEC sp_gestion_roles @Action = 'I',  @rol = :rol", {
            replacements: {
                rol,
            },
            type: sequelize_1.QueryTypes.INSERT, // Tipo de operación, ya que estamos insertando un nuevo rol
        });
        res.status(201).json({ message: "Rol creado exitosamente" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.saveRoles = saveRoles;
// Método para obtener todos los perfiles
const getRoles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roles = yield SqlServer_1.default.query("EXEC sp_gestion_roles @Action = 'Q'", {
            type: sequelize_1.QueryTypes.SELECT, // Tipo de operación SELECT
        });
        res.status(200).json({ message: "Listado de roles exitoso", data: roles });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getRoles = getRoles;
// Método para eliminar un perfil por ID
const deleteRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const roleId = req.params.id;
    try {
        const deleted = yield roles_1.default.destroy({
            where: { id: roleId },
        });
        if (deleted === 0) {
            res.status(404).json({ message: "Role not found" });
            return;
        }
        res.status(200).json({ message: "Delete role successful" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.deleteRole = deleteRole;
// Método para actualizar un perfil
const updateRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const roleId = req.params.id;
    const { rol } = req.body;
    try {
        yield SqlServer_1.default.query("EXEC sp_gestion_roles @Action = 'U', @id = :id, @rol = :rol", {
            replacements: {
                id: roleId,
                rol,
            },
            type: sequelize_1.QueryTypes.UPDATE, // Tipo de operación UPDATE
        });
        res.status(200).json({ message: "Rol actualizado exitosamente" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.updateRole = updateRole;
