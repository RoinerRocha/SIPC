"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const contacts_controller_1 = require("../controllers/contacts.controller");
const router = (0, express_1.Router)();
// Más rutas aquí..
router.get("/", (req, res) => {
    res.send("Hello, Login!");
});
router.post("/createContact", contacts_controller_1.createContact);
router.get("/getAllContacts", contacts_controller_1.getAllContacts);
router.get("/getContactsByPerson/:id_persona", contacts_controller_1.getContactsByPerson);
router.get("/getContactsByID/:id_contacto", contacts_controller_1.getContactsByID);
router.put("/updateContacts/:id_contacto", contacts_controller_1.updateContacts);
router.delete("/deleteContacts/:id_contacto", contacts_controller_1.deleteContacts);
exports.default = router;
