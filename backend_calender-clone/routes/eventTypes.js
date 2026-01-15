import express from "express";
import eventTypesController from "../controllers/eventTypesController.js";

const router = express.Router();

router.get("/", eventTypesController.getAllEventTypes);
router.get("/:slug", eventTypesController.getEventTypeBySlug);
router.post("/", eventTypesController.createEventType);
router.put("/:id", eventTypesController.updateEventType);
router.delete("/:id", eventTypesController.deleteEventType);

export default router;
