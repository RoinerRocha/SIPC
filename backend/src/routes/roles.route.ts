import { Router } from "express";
import {
    saveRoles,
    getRoles,
    deleteRole,
    updateRole,
} from "../controllers/roles.controller";

const router = Router();

router.get("/", (req, res) => {
    res.send("Hello, Login!");
});

router.post("/saveRoles", saveRoles);
router.get("/getRoles", getRoles);
router.put("/role/:id", updateRole);

router.delete("/deleteRole/:id", deleteRole);


export default router;