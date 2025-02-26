"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const referrals_controller_1 = require("../controllers/referrals.controller");
const router = (0, express_1.Router)();
router.get("/", (req, res) => {
    res.send("Hello, Login!");
});
router.post("/createReferral", referrals_controller_1.createReferral);
router.get("/getAllReferrals", referrals_controller_1.getAllReferrals);
router.get("/getReferralsById/:id_remision", referrals_controller_1.getReferralsById);
router.put("/updateReferrals/:id_remision", referrals_controller_1.updateReferrals);
exports.default = router;
