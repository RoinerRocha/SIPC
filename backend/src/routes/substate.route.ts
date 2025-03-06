import { Router } from "express";
import {
    getAllCompanySituation,
    getAllCompanyProgram,
    getAllBanhviState,
    getAllBanhviPurpose,
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

export default router;