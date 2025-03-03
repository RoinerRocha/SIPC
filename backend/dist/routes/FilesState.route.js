"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const FilesStates_controller_1 = require("../controllers/FilesStates.controller");
const router = (0, express_1.Router)();
router.get("/", (req, res) => {
    res.send("Hello, Login!");
});
router.get("/getAllStateFiles", FilesStates_controller_1.getAllStateFiles);
exports.default = router;
