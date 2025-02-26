"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const referralsDetails_controller_1 = require("../controllers/referralsDetails.controller");
const router = (0, express_1.Router)();
router.get("/", (req, res) => {
    res.send("Hello, Login!");
});
router.post("/createReferralDetails", referralsDetails_controller_1.createReferralDetails);
router.get("/getReferralsDetailsById/:id_dremision", referralsDetails_controller_1.getReferralsDetailsById);
router.get("/getReferralsDetailsByIdRemision/:id_remision", referralsDetails_controller_1.getReferralsDetailsByIdRemision);
router.put("/updateReferralsDetails/:id_dremision", referralsDetails_controller_1.updateReferralsDetails);
exports.default = router;
