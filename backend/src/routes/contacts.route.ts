import { Router } from "express";
import {
    createContact,
    getAllContacts,
    updateContacts,
    deleteContacts,
    getContactsByPerson,
    getContactsByID
} from "../controllers/contacts.controller";

const router = Router();
// Más rutas aquí..

router.get("/", (req, res) => {
  res.send("Hello, Login!");
});

router.post("/createContact", createContact);
router.get("/getAllContacts", getAllContacts);
router.get("/getContactsByPerson/:id_persona", getContactsByPerson);
router.get("/getContactsByID/:id_contacto", getContactsByID);
router.put("/updateContacts/:id_contacto", updateContacts);
router.delete("/deleteContacts/:id_contacto", deleteContacts);

export default router;