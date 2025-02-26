"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const family_controller_1 = require("../controllers/family.controller");
const router = (0, express_1.Router)();
// Más rutas aquí..
router.get("/", (req, res) => {
    res.send("Hello, Login!");
});
router.post("/createFamilyMember", family_controller_1.createFamilyMember);
router.get("/getMemberByPerson/:idpersona", family_controller_1.getMemberByPerson);
router.get("/getMemberByID/:idnucleo", family_controller_1.getMemberByID);
router.put("/updateMember/:idnucleo", family_controller_1.updateMember);
router.delete("/deleteMember/:idnucleo", family_controller_1.deleteMember);
exports.default = router;
