import express from "express";
import { addOrUpdateAlertSetting } from "../controllers/alertSettingController.js";

const router = express.Router();
router.post("/", addOrUpdateAlertSetting);

export default router;
