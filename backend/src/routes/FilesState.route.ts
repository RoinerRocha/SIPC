import { Router } from "express";
import {
    getAllStateFiles
} from "../controllers/FilesStates.controller";


const router = Router();

router.get("/", (req, res) => {
    res.send("Hello, Login!");
});


router.get("/getAllStateFiles", getAllStateFiles);

export default router;