import { Router } from "express";
import {
    updateFiles,
    getFilesByCode,
    getHistoryFiles,
    getFilesByPerson,
    getAllFiles,
    getFilesByIdPerson,
} from "../controllers/files.controller";

const router = Router();
// Más rutas aquí..

router.get("/", (req, res) => {
  res.send("Hello, Login!");
});

router.get("/getAllFiles", getAllFiles);
router.get("/getFilesByCode/:codigo", getFilesByCode);
router.get("/getFilesByIdPerson/:id_persona", getFilesByIdPerson);
router.get("/getHistoryFiles/:codigo", getHistoryFiles);
router.get("/getFilesByPerson/:identificacion", getFilesByPerson);
router.put("/updateFiles/:codigo/:usuario_sistema", updateFiles);

export default router;
