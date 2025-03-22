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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAzureFolder = void 0;
const storage_file_share_1 = require("@azure/storage-file-share");
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING || "";
if (!connectionString) {
    throw new Error("AZURE_STORAGE_CONNECTION_STRING no está definido en el entorno.");
}
const serviceClient = storage_file_share_1.ShareServiceClient.fromConnectionString(connectionString);
// Crear carpeta por id_persona
const createAzureFolder = (folderName) => __awaiter(void 0, void 0, void 0, function* () {
    const shareName = "files-primetechcr-01";
    const directoryName = `primetechcr01/${folderName}`;
    const shareClient = serviceClient.getShareClient(shareName);
    const directoryClient = shareClient.getDirectoryClient(directoryName);
    const exists = yield directoryClient.exists();
    if (!exists) {
        yield directoryClient.create();
        console.log(`📁 Carpeta '${directoryName}' creada en Azure Files.`);
    }
    else {
        console.log(`📁 Carpeta '${directoryName}' ya existe.`);
    }
});
exports.createAzureFolder = createAzureFolder;
