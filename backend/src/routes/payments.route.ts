import { Router } from "express";
import {
    createPayment,
    upload,
    getPaymentsByIDPago,
    getPaymentsByIDPerson,
    getPaymentsByPerson,
    getAllPayments,
    updatePayment
} from "../controllers/payments.controller";

const router = Router();

router.get("/", (req, res) => {
    res.send("Hello, Login!");
});

router.post("/createPayment", upload, createPayment);
router.get("/getPaymentsByIDPerson/:id_persona", getPaymentsByIDPerson);
router.get("/getPaymentsByPerson/:identificacion", getPaymentsByPerson);
router.get("/getPaymentsByIDPago/:id_pago", getPaymentsByIDPago);
router.get("/getAllPayments", getAllPayments);
router.put("/updatePayment/:id_pago", updatePayment);

export default router;
