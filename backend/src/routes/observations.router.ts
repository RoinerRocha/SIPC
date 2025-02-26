import { Router } from "express";
import {createObservations, getAllObservations, getObservationsByIDPerson, getObservationByPerson } from "../controllers/observations.controller";

const router = Router();

router.get("/", (req, res) => {
    res.send("Hello, Login!");
});

router.post("/createObservations", createObservations);
router.get("/getAllObservations", getAllObservations);
router.get("/getObservationsByIDPerson/:id_persona", getObservationsByIDPerson);
router.get("/getObservationByPerson/:identificacion", getObservationByPerson);

export default router;
  