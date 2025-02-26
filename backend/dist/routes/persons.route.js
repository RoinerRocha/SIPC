"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const persons_controller_1 = require("../controllers/persons.controller");
const router = (0, express_1.Router)();
// Más rutas aquí..
router.get("/", (req, res) => {
    res.send("Hello, Login!");
});
router.post("/createPerson", persons_controller_1.createPerson);
router.get("/getPersons", persons_controller_1.getAllPersons);
router.get("/getAllDisabilities", persons_controller_1.getAllDisabilities);
router.get("/getPersonById/:id_persona", persons_controller_1.getPersonById);
router.get("/getPersonHistoryChanges/:id_persona", persons_controller_1.getPersonHistoryChanges);
router.get("/getPersonByIdentifcation/:numero_identifiacion", persons_controller_1.getPersonByIdentifcation);
router.put("/updatePersons/:id_persona/:usuario_sistema", persons_controller_1.updatePerson);
router.delete("/deletePersons/:id_persona", persons_controller_1.deletePerson);
exports.default = router;
