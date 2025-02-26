import { Router } from "express";
import {
  register,
  login,
  getAllUser,
  getCurrentUser,
  updateUser,
  deleteUser
} from "../controllers/user.controller";

const router = Router();
// Más rutas aquí..

router.get("/", (req, res) => {
  res.send("Hello, Login!");
});

router.post("/register", register);

router.post("/login", login);

router.get("/getUsers", getAllUser);
router.get("/currentUser", getCurrentUser);
router.put("/updateUser/:id", updateUser);
router.delete("/deleteUser/:id", deleteUser);

export default router;

// sxgh rkqy eyvq plsf
