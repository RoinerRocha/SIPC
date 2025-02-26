"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const SqlServer_1 = __importDefault(require("../database/SqlServer"));
class DirectionModel extends sequelize_1.Model {
}
try {
    DirectionModel.init({
        id_direccion: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        id_persona: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
        },
        provincia: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
        },
        canton: {
            type: sequelize_1.DataTypes.STRING(150),
            allowNull: false,
        },
        distrito: {
            type: sequelize_1.DataTypes.STRING(150),
            allowNull: false,
        },
        barrio: {
            type: sequelize_1.DataTypes.STRING(150),
            allowNull: false,
        },
        otras_senas: {
            type: sequelize_1.DataTypes.STRING(200),
            allowNull: false,
        },
        tipo_direccion: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
        },
        estado: {
            type: sequelize_1.DataTypes.STRING(20),
            allowNull: false,
        },
    }, {
        sequelize: SqlServer_1.default,
        tableName: "Direccion",
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
exports.default = DirectionModel;
