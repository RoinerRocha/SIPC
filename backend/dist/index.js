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
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const SqlServer_1 = __importDefault(require("./database/SqlServer"));
const qs_1 = __importDefault(require("qs"));
const axios_1 = __importDefault(require("axios"));
const user_route_1 = __importDefault(require("./routes/user.route"));
const roles_route_1 = __importDefault(require("./routes/roles.route"));
const states_route_1 = __importDefault(require("./routes/states.route"));
const persons_route_1 = __importDefault(require("./routes/persons.route"));
const directions_route_1 = __importDefault(require("./routes/directions.route"));
const contacts_route_1 = __importDefault(require("./routes/contacts.route"));
const incomes_router_1 = __importDefault(require("./routes/incomes.router"));
const payments_route_1 = __importDefault(require("./routes/payments.route"));
const observations_router_1 = __importDefault(require("./routes/observations.router"));
const family_route_1 = __importDefault(require("./routes/family.route"));
const Files_route_1 = __importDefault(require("./routes/Files.route"));
const requirements_router_1 = __importDefault(require("./routes/requirements.router"));
const referrals_route_1 = __importDefault(require("./routes/referrals.route"));
const referralsDetails_router_1 = __importDefault(require("./routes/referralsDetails.router"));
const ubications_route_1 = __importDefault(require("./routes/ubications.route"));
const normalizers_route_1 = __importDefault(require("./routes/normalizers.route"));
const FilesState_route_1 = __importDefault(require("./routes/FilesState.route"));
const substate_route_1 = __importDefault(require("./routes/substate.route"));
const exceptionMiddleware_1 = require("./Middleware/exceptionMiddleware");
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)({ origin: "*" }));
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
//rutas archivos
app.use('/Documentos', express_1.default.static(path_1.default.join(__dirname, '../Documentos')));
// Rutas
app.use("/api", user_route_1.default);
app.use("/api", roles_route_1.default);
app.use("/api", states_route_1.default);
app.use("/api", persons_route_1.default);
app.use("/api", directions_route_1.default);
app.use("/api", contacts_route_1.default);
app.use("/api", incomes_router_1.default);
app.use("/api", payments_route_1.default);
app.use("/api", observations_router_1.default);
app.use("/api", family_route_1.default);
app.use("/api", Files_route_1.default);
app.use("/api", requirements_router_1.default);
app.use("/api", referrals_route_1.default);
app.use("/api", referralsDetails_router_1.default);
app.use("/api", ubications_route_1.default);
app.use("/api", normalizers_route_1.default);
app.use("/api", FilesState_route_1.default);
app.use("/api", substate_route_1.default);
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'public', 'index.html'));
});
app.post("/api/getPowerBIEmbedUrl", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { CLIENT_ID, CLIENT_SECRET, TENANT_ID } = process.env;
        const WORKSPACE_ID = "7a10c078-bee7-4a28-bdad-b388a50fbb37";
        const REPORT_ID = "03b77af4-b4dc-4219-99b8-f5663bcfec6d";
        if (!CLIENT_ID || !CLIENT_SECRET || !TENANT_ID) {
            console.error("❌ Error: Faltan credenciales de Azure en .env");
            res.status(500).json({ error: "Faltan credenciales de Azure en .env" });
            return;
        }
        // 🔹 Obtener el Access Token
        console.log("🔹 Solicitando Access Token...");
        const tokenUrl = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`;
        const data = qs_1.default.stringify({
            grant_type: "client_credentials",
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            scope: "https://analysis.windows.net/powerbi/api/.default",
        });
        const tokenResponse = yield axios_1.default.post(tokenUrl, data, {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
        const accessToken = tokenResponse.data.access_token;
        console.log("✅ Access Token obtenido correctamente");
        console.log("🔹 Access Token recibido:", accessToken);
        // 🔹 Obtener la URL de Embed desde Power BI API
        console.log(`🔹 Consultando API de Power BI para obtener embedUrl del reporte ${REPORT_ID}`);
        const powerBiApiUrl = "https://app.powerbi.com/reportEmbed?reportId=03b77af4-b4dc-4219-99b8-f5663bcfec6d&groupId=7a10c078-bee7-4a28-bdad-b388a50fbb37&w=2&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly9XQUJJLVdFU1QtVVMtRS1QUklNQVJZLXJlZGlyZWN0LmFuYWx5c2lzLndpbmRvd3MubmV0IiwiZW1iZWRGZWF0dXJlcyI6eyJ1c2FnZU1ldHJpY3NWTmV4dCI6dHJ1ZX19";
        const powerBiResponse = yield axios_1.default.get(powerBiApiUrl, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!powerBiResponse.data.embedUrl) {
            console.error("❌ Error: No se recibió embedUrl desde la API de Power BI");
            res.status(500).json({ error: "No se recibió embedUrl desde la API de Power BI" });
            return;
        }
        const embedUrl = powerBiResponse.data.embedUrl;
        console.log(`✅ Embed URL obtenida: ${embedUrl}`);
        // 🔹 Enviar respuesta JSON correctamente
        res.status(200).json({ accessToken, embedUrl });
    }
    catch (error) {
        console.error("❌ Error obteniendo la URL de Power BI:", ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        res.status(500).json({
            error: "Error obteniendo la URL de Power BI",
            details: ((_b = error.response) === null || _b === void 0 ? void 0 : _b.data) || error.message,
        });
    }
}));
// Registrar middleware de manejo de errores
app.use(exceptionMiddleware_1.exceptionMiddleware);
const PORT = process.env.PORT || 3001;
SqlServer_1.default
    .sync({ force: false })
    .then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
    SqlServer_1.default.authenticate();
    console.log("Connection DataBase has been established successfully. ;)");
})
    .catch((err) => {
    console.error("Unable to connect to the database:", err);
});
