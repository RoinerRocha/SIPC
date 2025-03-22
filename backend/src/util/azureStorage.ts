import { ShareServiceClient } from "@azure/storage-file-share";

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING || "";

if (!connectionString) {
    throw new Error("AZURE_STORAGE_CONNECTION_STRING no está definido en el entorno.");
}

const serviceClient = ShareServiceClient.fromConnectionString(connectionString);

// Crear carpeta por id_persona
export const createAzureFolder = async (folderName: string) => {
    const shareName = "files-primetechcr-01";
    const directoryName = `primetechcr01/${folderName}`;

    const shareClient = serviceClient.getShareClient(shareName);
    const directoryClient = shareClient.getDirectoryClient(directoryName);

    const exists = await directoryClient.exists();
    if (!exists) {
        await directoryClient.create();
        console.log(`📁 Carpeta '${directoryName}' creada en Azure Files.`);
    } else {
        console.log(`📁 Carpeta '${directoryName}' ya existe.`);
    }
};
