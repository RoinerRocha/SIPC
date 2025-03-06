import { Router } from "express";
import {
    getAllCompanySituation,
    getAllCompanyProgram,
    getAllBanhviState,
    getAllBanhviPurpose,
    getAllEntity,
} from "../controllers/substates.controller";

const router = Router();
// Más rutas aquí..

router.get("/", (req, res) => {
  res.send("Hello, Login!");
});

router.get("/getAllCompanySituation", getAllCompanySituation);
router.get("/getAllCompanyProgram", getAllCompanyProgram);
router.get("/getAllBanhviState", getAllBanhviState);
router.get("/getAllBanhviPurpose", getAllBanhviPurpose);
router.get("/getAllEntity", getAllEntity);
export default router;