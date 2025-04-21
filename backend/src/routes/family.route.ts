import { Router } from "express";
import {
    createFamilyMember,
    getMemberByPerson,
    getMemberByID,
    updateMember,
    deleteMember,
    getColumnLimits
} from "../controllers/family.controller";

const router = Router();
// Más rutas aquí..

router.get("/", (req, res) => {
  res.send("Hello, Login!");
});

router.post("/createFamilyMember", createFamilyMember);
router.get("/getMemberByPerson/:idpersona", getMemberByPerson);
router.get("/getMemberByID/:idnucleo", getMemberByID);
router.put("/updateMember/:idnucleo", updateMember);
router.delete("/deleteMember/:idnucleo", deleteMember);
router.get('/family/limits', getColumnLimits);


export default router;