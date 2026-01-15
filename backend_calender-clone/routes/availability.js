import express from "express";
import availabilityController from "../controllers/availabilityController.js";

const router = express.Router();

router.get("/", availabilityController.getAvailability);
router.post("/", availabilityController.setAvailability);

export default router;
