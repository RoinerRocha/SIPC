"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const direction_controller_1 = require("../controllers/direction.controller");
const router = (0, express_1.Router)();
// Más rutas aquí..
router.get("/", (req, res) => {
    res.send("Hello, Login!");
});
router.post("/createDireccion", direction_controller_1.createDireccion);
router.get("/getAllDirections", direction_controller_1.getAllDirections);
router.get("/getDireccionesByPersona/:id_persona", direction_controller_1.getDireccionesByPersona);
router.get("/getDireccionesByID/:id_direccion", direction_controller_1.getDireccionesByID);
router.put("/updateDireccion/:id_direccion", direction_controller_1.updateDireccion);
router.delete("/deleteDireccion/:id_direccion", direction_controller_1.deleteDireccion);
exports.default = router;
