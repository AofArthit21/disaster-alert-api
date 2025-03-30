import express from "express";
import { getAlerts, sendCustomAlert } from "../controllers/alertController.js";

const router = express.Router();
router.post("/send", sendCustomAlert);

router.get("/", getAlerts);

export default router;
