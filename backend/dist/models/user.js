"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const SqlServer_1 = __importDefault(require("../database/SqlServer"));
class User extends sequelize_1.Model {
}
try {
    User.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nombre: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
        },
        primer_apellido: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
        },
        segundo_apellido: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
        },
        nombre_usuario: {
            type: sequelize_1.DataTypes.STRING(50),
            unique: true,
            allowNull: false,
        },
        correo_electronico: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
        },
        contrasena: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
        },
        perfil_asignado: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
        },
        estado: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
        },
    }, {
        sequelize: SqlServer_1.default,
        tableName: "Usuarios",
        schema: "dbo",
    });
}
catch (error) {
    console.log("error en model user: " + error.message);
}
SqlServer_1.default
    .sync({ alter: true })
    .then(() => console.log("Database & tables created!"))
    .catch((error) => console.error("Unable to connect to the database:", error));
exports.default = User;
