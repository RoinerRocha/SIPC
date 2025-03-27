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
exports.getFileFromAzure = exports.uploadFileToAzure = void 0;
const storage_file_share_1 = require("@azure/storage-file-share");
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const shareName = process.env.AZURE_SHARE_NAME;
const directoryName = process.env.AZURE_DIRECTORY;
const serviceClient = storage_file_share_1.ShareServiceClient.fromConnectionString(connectionString);
const uploadFileToAzure = (filename, buffer) => __awaiter(void 0, void 0, void 0, function* () {
    const shareClient = serviceClient.getShareClient(shareName);
    const directoryClient = shareClient.getDirectoryClient(directoryName);
    // Asegurarse de que el directorio exista
    const exists = yield directoryClient.exists();
    if (!exists)
        yield directoryClient.create();
    const fileClient = directoryClient.getFileClient(filename);
    yield fileClient.create(buffer.length);
    yield fileClient.uploadRange(buffer, 0, buffer.length);
    return `${directoryClient.url}/${filename}`;
});
exports.uploadFileToAzure = uploadFileToAzure;
const getFileFromAzure = (filename) => __awaiter(void 0, void 0, void 0, function* () {
    const shareClient = serviceClient.getShareClient(shareName);
    const directoryClient = shareClient.getDirectoryClient(directoryName);
    const fileClient = directoryClient.getFileClient(filename);
    const downloadResponse = yield fileClient.download();
    return downloadResponse.readableStreamBody;
});
exports.getFileFromAzure = getFileFromAzure;
