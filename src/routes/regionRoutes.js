import express from "express";
import { addRegion } from "../controllers/regionController.js";

const router = express.Router();
router.post("/", addRegion);

export default router;
