"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const observations_controller_1 = require("../controllers/observations.controller");
const router = (0, express_1.Router)();
router.get("/", (req, res) => {
    res.send("Hello, Login!");
});
router.post("/createObservations", observations_controller_1.createObservations);
router.get("/getAllObservations", observations_controller_1.getAllObservations);
router.get("/getObservationsByIDPerson/:id_persona", observations_controller_1.getObservationsByIDPerson);
router.get("/getObservationByPerson/:identificacion", observations_controller_1.getObservationByPerson);
exports.default = router;
