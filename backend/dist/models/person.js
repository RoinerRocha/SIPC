"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const SqlServer_1 = __importDefault(require("../database/SqlServer"));
class PersonaModel extends sequelize_1.Model {
}
try {
    PersonaModel.init({
        id_persona: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
        },
        tipo_identificacion: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        numero_identifiacion: {
            type: sequelize_1.DataTypes.STRING(20),
            allowNull: false,
        },
        nombre: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
        },
        primer_apellido: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
        },
        segundo_apellido: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
        },
        fecha_nacimiento: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
        },
        genero: {
            type: sequelize_1.DataTypes.STRING(15),
            allowNull: false,
        },
        estado_civil: {
            type: sequelize_1.DataTypes.STRING(15),
            allowNull: false,
        },
        nacionalidad: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
        },
        fecha_registro: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
        },
        usuario_registro: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
        },
        nivel_estudios: {
            type: sequelize_1.DataTypes.STRING(150),
            allowNull: false,
        },
        asesor: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
        },
        estado: {
            type: sequelize_1.DataTypes.STRING(10),
            allowNull: true,
            defaultValue: "ACTIVO",
        },
    }, {
        sequelize: SqlServer_1.default,
        tableName: "Persona",
        schema: "dbo",
    });
}
catch (error) {
    console.log("Error en modelo Persona: " + error.message);
}
SqlServer_1.default
    .sync()
    .then(() => console.log("Database & tables created!"))
    .catch((error) => console.error("Unable to connect to the database:", error));
exports.default = PersonaModel;
