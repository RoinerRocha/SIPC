"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const income_controller_1 = require("../controllers/income.controller");
const router = (0, express_1.Router)();
// Más rutas aquí..
router.get("/", (req, res) => {
    res.send("Hello, Login!");
});
router.post("/createIncome", income_controller_1.createIncome);
router.get("/getAllIncomes", income_controller_1.getAllIncomes);
router.get("/getIncomesByPerson/:id_persona", income_controller_1.getIncomesByPerson);
router.get("/getSegmentos/:segmento", income_controller_1.getSegmentos);
router.get("/getIncomesByID/:id_ingreso", income_controller_1.getIncomesByID);
router.put("/updateIncome/:id_ingreso", income_controller_1.updateIncome);
router.delete("/deleteIncome/:id_ingreso", income_controller_1.deleteIncome);
exports.default = router;
