import { Router } from "express";
import {
    getAllStateFiles,
    getStateFilesByGroup
} from "../controllers/FilesStates.controller";


const router = Router();

router.get("/", (req, res) => {
    res.send("Hello, Login!");
});


router.get("/getAllStateFiles", getAllStateFiles);
router.get("/getStateFilesByGroup/:grupo", getStateFilesByGroup);

export default router;