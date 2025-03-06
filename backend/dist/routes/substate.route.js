"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const substates_controller_1 = require("../controllers/substates.controller");
const router = (0, express_1.Router)();
// Más rutas aquí..
router.get("/", (req, res) => {
    res.send("Hello, Login!");
});
router.get("/getAllCompanySituation", substates_controller_1.getAllCompanySituation);
router.get("/getAllCompanyProgram", substates_controller_1.getAllCompanyProgram);
router.get("/getAllBanhviState", substates_controller_1.getAllBanhviState);
router.get("/getAllBanhviPurpose", substates_controller_1.getAllBanhviPurpose);
router.get("/getAllEntity", substates_controller_1.getAllEntity);
router.get("/getAllStateEntity", substates_controller_1.getAllStateEntity);
exports.default = router;
