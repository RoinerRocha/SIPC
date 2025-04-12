import { Router } from "express";
import { downloadRequirementFile , createRequirements, upload, getAllBaseRequirements,  getRequirementsByPerson,getRequirementsById, getRequirementsByIdentification, updateRequirements, getAllRequirements  } from "../controllers/requirements.controller";

const router = Router();

router.get("/", (req, res) => {
    res.send("Hello, Login!");
});

router.post("/createRequirements", upload, createRequirements);
router.get("/getAllRequirements", getAllRequirements);
router.get("/getAllBaseRequirements", getAllBaseRequirements);
router.get("/getRequirementsByPerson/:id_persona", getRequirementsByPerson);
router.get("/getRequirementsById/:id_requisito", getRequirementsById);
router.get("/getRequirementsByIdentification/:identificacion", getRequirementsByIdentification);
router.put("/updateRequirements/:id_requisito", updateRequirements);
router.get("/downloadRequirementFile/:filename", downloadRequirementFile);

export default router;
