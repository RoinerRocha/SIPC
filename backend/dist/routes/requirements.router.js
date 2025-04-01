"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const requirements_controller_1 = require("../controllers/requirements.controller");
const router = (0, express_1.Router)();
router.get("/", (req, res) => {
    res.send("Hello, Login!");
});
router.post("/createRequirements", requirements_controller_1.upload, requirements_controller_1.createRequirements);
router.get("/getAllRequirements", requirements_controller_1.getAllRequirements);
router.get("/getAllBaseRequirements", requirements_controller_1.getAllBaseRequirements);
router.get("/getRequirementsByPerson/:id_persona", requirements_controller_1.getRequirementsByPerson);
router.get("/getRequirementsById/:id_requisito", requirements_controller_1.getRequirementsById);
router.get("/getRequirementsByIdentification/:identificacion", requirements_controller_1.getRequirementsByIdentification);
router.put("/updateRequirements/:id_requisito", requirements_controller_1.updateRequirements);
exports.default = router;
