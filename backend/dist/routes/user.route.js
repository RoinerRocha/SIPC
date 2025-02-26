"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const router = (0, express_1.Router)();
// Más rutas aquí..
router.get("/", (req, res) => {
    res.send("Hello, Login!");
});
router.post("/register", user_controller_1.register);
router.post("/login", user_controller_1.login);
router.get("/getUsers", user_controller_1.getAllUser);
router.get("/currentUser", user_controller_1.getCurrentUser);
router.put("/updateUser/:id", user_controller_1.updateUser);
router.delete("/deleteUser/:id", user_controller_1.deleteUser);
exports.default = router;
// sxgh rkqy eyvq plsf
