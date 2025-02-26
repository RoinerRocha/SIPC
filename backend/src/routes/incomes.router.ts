import { Router } from "express";
import {
    createIncome,
    getAllIncomes,
    updateIncome,
    deleteIncome,
    getIncomesByPerson,
    getIncomesByID,
    getSegmentos
} from "../controllers/income.controller";

const router = Router();
// Más rutas aquí..

router.get("/", (req, res) => {
  res.send("Hello, Login!");
});

router.post("/createIncome", createIncome);
router.get("/getAllIncomes", getAllIncomes);
router.get("/getIncomesByPerson/:id_persona", getIncomesByPerson);
router.get("/getSegmentos/:segmento", getSegmentos);
router.get("/getIncomesByID/:id_ingreso", getIncomesByID);
router.put("/updateIncome/:id_ingreso", updateIncome);
router.delete("/deleteIncome/:id_ingreso", deleteIncome);

export default router;