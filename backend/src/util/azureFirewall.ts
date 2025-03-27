import axios from "axios";
import qs from "qs";

const {
    AZURE_TENANT_ID,
    AZURE_CLIENT_ID,
    AZURE_CLIENT_SECRET,
    AZURE_SUBSCRIPTION_ID,
    AZURE_RESOURCE_GROUP,
    AZURE_STORAGE_ACCOUNT
} = process.env;

export const allowIpInAzureStorage = async (ip: string): Promise<void> => {
    try {
        // 👉 Convertir IP individual a formato CIDR
        const ipCidr = `${ip}/32`;

        // Obtener token de acceso
        const tokenResponse = await axios.post(
            `https://login.microsoftonline.com/${AZURE_TENANT_ID}/oauth2/v2.0/token`,
            qs.stringify({
                grant_type: "client_credentials",
                client_id: AZURE_CLIENT_ID,
                client_secret: AZURE_CLIENT_SECRET,
                scope: "https://management.azure.com/.default"
            }),
            { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );

        const accessToken = tokenResponse.data.access_token;

        const baseUrl = `https://management.azure.com/subscriptions/${AZURE_SUBSCRIPTION_ID}/resourceGroups/${AZURE_RESOURCE_GROUP}/providers/Microsoft.Storage/storageAccounts/${AZURE_STORAGE_ACCOUNT}?api-version=2023-01-01`;

        // Obtener la configuración actual
        const storageConfig = await axios.get(baseUrl, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const currentRules = storageConfig.data.properties.networkAcls?.ipRules || [];

        // Verificar si la IP ya está agregada
        if (currentRules.some((rule: any) => rule.value === ipCidr)) {
            console.log(`✅ IP ${ipCidr} ya está permitida en el firewall`);
            return;
        }

        // Agregar la nueva IP
        const updatedRules = [...currentRules, { value: ipCidr, action: "Allow" }];

        // Enviar configuración actualizada
        await axios.put(
            baseUrl,
            {
                location: storageConfig.data.location,
                sku: storageConfig.data.sku,
                kind: storageConfig.data.kind,
                properties: {
                    ...storageConfig.data.properties,
                    networkAcls: {
                        ...storageConfig.data.properties.networkAcls,
                        ipRules: updatedRules,
                        defaultAction: "Deny" // asegurarse de que sea lo que se quiere
                    }
                }
            },
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        console.log(`🎉 IP ${ipCidr} agregada correctamente al firewall de Azure`);
    } catch (error: any) {
        console.error("❌ Error al agregar IP al firewall de Azure:", error.response?.data || error.message);
        throw error;
    }
};
