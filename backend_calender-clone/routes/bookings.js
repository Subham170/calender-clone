import express from "express";
import bookingsController from "../controllers/bookingsController.js";

const router = express.Router();

router.get("/", bookingsController.getAllBookings);
router.get("/slots/:slug", bookingsController.getAvailableSlots);
router.post("/:slug", bookingsController.createBooking);
router.put("/:id/cancel", bookingsController.cancelBooking);

export default router;
