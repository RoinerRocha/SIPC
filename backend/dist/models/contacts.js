"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const SqlServer_1 = __importDefault(require("../database/SqlServer"));
class ContactsModel extends sequelize_1.Model {
}
try {
    ContactsModel.init({
        id_contacto: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        id_persona: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
        },
        tipo_contacto: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
        },
        identificador: {
            type: sequelize_1.DataTypes.STRING(200),
            allowNull: false,
        },
        estado: {
            type: sequelize_1.DataTypes.STRING(20),
            allowNull: false,
        },
        fecha_registro: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
        },
        comentarios: {
            type: sequelize_1.DataTypes.STRING(500),
            allowNull: false,
        },
    }, {
        sequelize: SqlServer_1.default,
        tableName: "Contactos",
        schema: "dbo",
    });
}
catch (error) {
    console.log("Error en modelo Contactos: " + error.message);
}
SqlServer_1.default
    .sync()
    .then(() => console.log("Database & tables created!"))
    .catch((error) => console.error("Unable to connect to the database:", error));
exports.default = ContactsModel;
