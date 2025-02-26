"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const roles_controller_1 = require("../controllers/roles.controller");
const router = (0, express_1.Router)();
router.get("/", (req, res) => {
    res.send("Hello, Login!");
});
router.post("/saveRoles", roles_controller_1.saveRoles);
router.get("/getRoles", roles_controller_1.getRoles);
router.put("/role/:id", roles_controller_1.updateRole);
router.delete("/deleteRole/:id", roles_controller_1.deleteRole);
exports.default = router;
