import { Router } from "express";
import { createReferral, getAllReferrals, getReferralsById, updateReferrals } from "../controllers/referrals.controller";

const router = Router();

router.get("/", (req, res) => {
    res.send("Hello, Login!");
});

router.post("/createReferral", createReferral);
router.get("/getAllReferrals", getAllReferrals);
router.get("/getReferralsById/:id_remision", getReferralsById);
router.put("/updateReferrals/:id_remision", updateReferrals);


export default router;
