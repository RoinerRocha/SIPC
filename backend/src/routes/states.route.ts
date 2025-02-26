import { Router } from "express";
import {
    saveStates,
    getStates,
} from "../controllers/states.controller";

const router = Router();

router.get("/", (req, res) => {
    res.send("Hello, Login!");
});

router.post("/saveStates", saveStates);
router.get("/getStates", getStates);

export default router;
