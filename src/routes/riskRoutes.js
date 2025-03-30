import express from "express";
import { calculateRisk } from "../controllers/riskController.js";

const router = express.Router();
router.get("/", calculateRisk);

export default router;
