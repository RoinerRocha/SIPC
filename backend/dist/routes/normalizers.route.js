"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const normalizers_controller_1 = require("../controllers/normalizers.controller");
const router = (0, express_1.Router)();
router.get("/", (req, res) => {
    res.send("Hello, Login!");
});
router.post("/createNormalizers", normalizers_controller_1.createNormalizers);
router.get("/getAllNormalizers", normalizers_controller_1.getAllNormalizers);
router.get("/getAnalistasConstructora", normalizers_controller_1.getAnalistasConstructora);
router.get("/getAnalistasEntidad", normalizers_controller_1.getAnalistasEntidad);
router.get("/getNormalizersById/:id", normalizers_controller_1.getNormalizersById);
router.get("/getNormalizeByCompany/:empresa", normalizers_controller_1.getNormalizeByCompany);
router.get("/getUniqueCompanies", normalizers_controller_1.getUniqueCompanies);
router.get("/getFiscalesIngenieros/:empresa", normalizers_controller_1.getFiscalesAndIngenierosByEmpresa);
router.put("/updateNormalizers/:id", normalizers_controller_1.updateNormalizers);
exports.default = router;
