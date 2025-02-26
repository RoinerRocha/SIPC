"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const SqlServer_1 = __importDefault(require("../database/SqlServer"));
class rolesModel extends sequelize_1.Model {
}
try {
    rolesModel.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        rol: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
        },
    }, {
        sequelize: SqlServer_1.default,
        tableName: "Roles",
        schema: "dbo",
    });
}
catch (error) {
    console.log("error en modelo roles: " + error.message);
}
SqlServer_1.default
    .sync()
    .then(() => console.log("Database & tables created!"))
    .catch((error) => console.error("Unable to connect to the database:", error));
exports.default = rolesModel;
