"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payments_controller_1 = require("../controllers/payments.controller");
const router = (0, express_1.Router)();
router.get("/", (req, res) => {
    res.send("Hello, Login!");
});
router.post("/createPayment", payments_controller_1.upload, payments_controller_1.createPayment);
router.get("/getPaymentsByIDPerson/:id_persona", payments_controller_1.getPaymentsByIDPerson);
router.get("/getPaymentsByPerson/:identificacion", payments_controller_1.getPaymentsByPerson);
router.get("/getPaymentsByIDPago/:id_pago", payments_controller_1.getPaymentsByIDPago);
router.get("/getAllPayments", payments_controller_1.getAllPayments);
router.put("/updatePayment/:id_pago", payments_controller_1.updatePayment);
exports.default = router;
