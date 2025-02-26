import { Router } from "express";
import {
  createDireccion,
  getAllDirections,
  updateDireccion,
  deleteDireccion,
  getDireccionesByPersona,
  getDireccionesByID
} from "../controllers/direction.controller";

const router = Router();
// Más rutas aquí..

router.get("/", (req, res) => {
  res.send("Hello, Login!");
});

router.post("/createDireccion", createDireccion);
router.get("/getAllDirections", getAllDirections);
router.get("/getDireccionesByPersona/:id_persona", getDireccionesByPersona);
router.get("/getDireccionesByID/:id_direccion", getDireccionesByID);
router.put("/updateDireccion/:id_direccion", updateDireccion);
router.delete("/deleteDireccion/:id_direccion", deleteDireccion);

export default router;