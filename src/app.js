import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import regionRoutes from "./routes/regionRoutes.js";
import alertSettingRoutes from "./routes/alertSettingRoutes.js";
import riskRoutes from "./routes/riskRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

app.use("/api/regions", regionRoutes);
app.use("/api/alert-settings", alertSettingRoutes);
app.use("/api/disaster-risks", riskRoutes);
app.use("/api/alerts", alertRoutes);

export default app;
