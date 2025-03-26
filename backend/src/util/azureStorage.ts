import { ShareServiceClient } from "@azure/storage-file-share";
import { Readable } from "stream";
import axios from "axios";

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING!;
const shareName = process.env.AZURE_SHARE_NAME!;
const directoryName = process.env.AZURE_DIRECTORY!;

const serviceClient = ShareServiceClient.fromConnectionString(connectionString);

export const uploadFileToAzure = async (filename: string, buffer: Buffer): Promise<string> => {
    const shareClient = serviceClient.getShareClient(shareName);
    const directoryClient = shareClient.getDirectoryClient(directoryName);

    // Asegurarse de que el directorio exista
    const exists = await directoryClient.exists();
    if (!exists) await directoryClient.create();

    const fileClient = directoryClient.getFileClient(filename);
    await fileClient.create(buffer.length);
    await fileClient.uploadRange(buffer, 0, buffer.length);
    const logPublicIP = async () => {
        try {
            const ip = await axios.get("https://api.ipify.org?format=json");
            console.log("🌐 IP pública del servidor (Render):", ip.data.ip);
        } catch (error) {
            console.error("❌ No se pudo obtener la IP pública:", error);
        }
    };

    logPublicIP();

    return `${directoryClient.url}/${filename}`;
};
