// src/authConfig.ts
export const msalConfig = {
    auth: {
        clientId: "79e3c318-a9dc-4e73-820a-54f0d431f242", // tu CLIENT_ID
        authority: "https://login.microsoftonline.com/a38a28a9-682f-4da9-9a5a-61c64f3bb23a", // tu TENANT_ID
        redirectUri: "http://localhost:4001", // o tu dominio en producción
    },
    cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false,
    },
};

export const loginRequest = {
    scopes: ["https://analysis.windows.net/powerbi/api/.default"],
};