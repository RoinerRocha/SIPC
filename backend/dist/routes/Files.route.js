"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const files_controller_1 = require("../controllers/files.controller");
const router = (0, express_1.Router)();
// Más rutas aquí..
router.get("/", (req, res) => {
    res.send("Hello, Login!");
});
router.get("/getAllFiles", files_controller_1.getAllFiles);
router.get("/getFilesByCode/:codigo", files_controller_1.getFilesByCode);
router.get("/getFilesByIdPerson/:id_persona", files_controller_1.getFilesByIdPerson);
router.get("/getHistoryFiles/:codigo", files_controller_1.getHistoryFiles);
router.get("/getFilesByPerson/:identificacion", files_controller_1.getFilesByPerson);
router.put("/updateFiles/:codigo/:usuario_sistema", files_controller_1.updateFiles);
exports.default = router;
