import { Router } from "express";
import {
    createNormalizers,
    updateNormalizers,
    getNormalizersById,
    getAllNormalizers,
    getNormalizeByCompany,
    getUniqueCompanies,
    getFiscalesAndIngenierosByEmpresa,
} from "../controllers/normalizers.controller";

const router = Router();

router.get("/", (req, res) => {
    res.send("Hello, Login!");
});

router.post("/createNormalizers", createNormalizers);
router.get("/getAllNormalizers", getAllNormalizers);
router.get("/getNormalizersById/:id", getNormalizersById);
router.get("/getNormalizeByCompany/:empresa", getNormalizeByCompany);
router.get("/getUniqueCompanies", getUniqueCompanies);
router.get("/getFiscalesIngenieros/:empresa", getFiscalesAndIngenierosByEmpresa);
router.put("/updateNormalizers/:id", updateNormalizers);

export default router;
