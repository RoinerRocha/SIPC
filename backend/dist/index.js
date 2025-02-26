"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const SqlServer_1 = __importDefault(require("./database/SqlServer"));
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
const exceptionMiddleware_1 = require("./Middleware/exceptionMiddleware");
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
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
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'public', 'index.html'));
});
// Registrar middleware de manejo de errores
app.use(exceptionMiddleware_1.exceptionMiddleware);
const PORT = process.env.PORT || 3000;
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
