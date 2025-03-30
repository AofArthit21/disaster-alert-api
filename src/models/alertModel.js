import mongoose from "mongoose";

const alertSchema = new mongoose.Schema({
  RegionID: { type: String, ref: "Region", required: true },
  DisasterType: { type: String, required: true },
  RiskLevel: { type: String, enum: ["Low", "Medium", "High"], required: true },
  AlertMessage: { type: String, required: true },
  Timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("Alert", alertSchema);
