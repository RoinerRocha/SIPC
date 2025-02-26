"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ubications_controller_1 = require("../controllers/ubications.controller");
const router = (0, express_1.Router)();
router.get("/", (req, res) => {
    res.send("Hello, Login!");
});
router.get("/getAllProvince", ubications_controller_1.getAllProvince);
router.get("/getCantonByProvince/:provincia", ubications_controller_1.getCantonByProvince);
router.get("/getDistrictByProvinciaCanton/:provincia/:canton", ubications_controller_1.getDistrictByProvinciaCanton);
router.get("/getNeighborhoodByProvinciaCantonDistrict/:provincia/:canton/:distrito", ubications_controller_1.getNeighborhoodByProvinciaCantonDistrict);
exports.default = router;
