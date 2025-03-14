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
exports.getConnection = void 0;
const mssql_1 = __importDefault(require("mssql"));
const dbSettings = {
    user: "primetech",
    password: "3YYWJPb6ha*1",
    server: "srv-sicp-01.database.windows.net",
    database: "SIPC",
    options: {
        encrypt: false,
        trustServerCertificate: true,
    },
};
const getConnection = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pool = yield mssql_1.default.connect(dbSettings);
        const result = yield pool.request().query("SELECT GETDATE()");
        console.log(result);
        return pool;
    }
    catch (error) {
        console.log(error);
    }
});
exports.getConnection = getConnection;
