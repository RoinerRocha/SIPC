"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const states_controller_1 = require("../controllers/states.controller");
const router = (0, express_1.Router)();
router.get("/", (req, res) => {
    res.send("Hello, Login!");
});
router.post("/saveStates", states_controller_1.saveStates);
router.get("/getStates", states_controller_1.getStates);
exports.default = router;
