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
exports.allowIpInAzureStorage = void 0;
const axios_1 = __importDefault(require("axios"));
const qs_1 = __importDefault(require("qs"));
const { AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_SUBSCRIPTION_ID, AZURE_RESOURCE_GROUP, AZURE_STORAGE_ACCOUNT } = process.env;
const allowIpInAzureStorage = (ip) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        // 👉 Convertir IP individual a formato CIDR
        const ipCidr = `${ip}/32`;
        // Obtener token de acceso
        const tokenResponse = yield axios_1.default.post(`https://login.microsoftonline.com/${AZURE_TENANT_ID}/oauth2/v2.0/token`, qs_1.default.stringify({
            grant_type: "client_credentials",
            client_id: AZURE_CLIENT_ID,
            client_secret: AZURE_CLIENT_SECRET,
            scope: "https://management.azure.com/.default"
        }), { headers: { "Content-Type": "application/x-www-form-urlencoded" } });
        const accessToken = tokenResponse.data.access_token;
        const baseUrl = `https://management.azure.com/subscriptions/${AZURE_SUBSCRIPTION_ID}/resourceGroups/${AZURE_RESOURCE_GROUP}/providers/Microsoft.Storage/storageAccounts/${AZURE_STORAGE_ACCOUNT}?api-version=2023-01-01`;
        // Obtener la configuración actual
        const storageConfig = yield axios_1.default.get(baseUrl, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        const currentRules = ((_a = storageConfig.data.properties.networkAcls) === null || _a === void 0 ? void 0 : _a.ipRules) || [];
        // Verificar si la IP ya está agregada
        if (currentRules.some((rule) => rule.value === ipCidr)) {
            console.log(`✅ IP ${ipCidr} ya está permitida en el firewall`);
            return;
        }
        // Agregar la nueva IP
        const updatedRules = [...currentRules, { value: ipCidr, action: "Allow" }];
        // Enviar configuración actualizada
        yield axios_1.default.put(baseUrl, {
            location: storageConfig.data.location,
            sku: storageConfig.data.sku,
            kind: storageConfig.data.kind,
            properties: Object.assign(Object.assign({}, storageConfig.data.properties), { networkAcls: Object.assign(Object.assign({}, storageConfig.data.properties.networkAcls), { ipRules: updatedRules, defaultAction: "Deny" // asegurarse de que sea lo que se quiere
                 }) })
        }, { headers: { Authorization: `Bearer ${accessToken}` } });
        console.log(`🎉 IP ${ipCidr} agregada correctamente al firewall de Azure`);
    }
    catch (error) {
        console.error("❌ Error al agregar IP al firewall de Azure:", ((_b = error.response) === null || _b === void 0 ? void 0 : _b.data) || error.message);
        throw error;
    }
});
exports.allowIpInAzureStorage = allowIpInAzureStorage;
