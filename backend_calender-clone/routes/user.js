import express from "express";
import userController from "../controllers/userController.js";

const router = express.Router();

router.get("/", userController.getCurrentUser);
router.put("/", userController.updateCurrentUser);

export default router;
