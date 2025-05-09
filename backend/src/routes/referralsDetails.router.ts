import { Router } from "express";
import { createReferralDetails, getReferralsDetailsById, getReferralsDetailsByIdRemision, updateReferralsDetails, getColumnLimits } from "../controllers/referralsDetails.controller";

const router = Router();

router.get("/", (req, res) => {
    res.send("Hello, Login!");
});

router.post("/createReferralDetails", createReferralDetails);
router.get("/getReferralsDetailsById/:id_dremision", getReferralsDetailsById);
router.get("/getReferralsDetailsByIdRemision/:id_remision", getReferralsDetailsByIdRemision);
router.put("/updateReferralsDetails/:id_dremision", updateReferralsDetails);
router.get('/details/limits', getColumnLimits);

export default router;

