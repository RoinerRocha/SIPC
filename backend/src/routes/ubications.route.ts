import { Router } from "express";
import { getAllProvince, getCantonByProvince, getDistrictByProvinciaCanton, getNeighborhoodByProvinciaCantonDistrict } from "../controllers/ubications.controller";

const router = Router();

router.get("/", (req, res) => {
    res.send("Hello, Login!");
});


router.get("/getAllProvince", getAllProvince);
router.get("/getCantonByProvince/:provincia", getCantonByProvince);
router.get("/getDistrictByProvinciaCanton/:provincia/:canton", getDistrictByProvinciaCanton);
router.get("/getNeighborhoodByProvinciaCantonDistrict/:provincia/:canton/:distrito", getNeighborhoodByProvinciaCantonDistrict);

export default router;


