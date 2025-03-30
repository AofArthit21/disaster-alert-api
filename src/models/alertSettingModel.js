import mongoose from "mongoose";

const alertSettingSchema = new mongoose.Schema({
  RegionID: { type: String, ref: "Region", required: true },
  DisasterType: { type: String, required: true },
  ThresholdScore: { type: Number, required: true },
});

export default mongoose.model("AlertSetting", alertSettingSchema);
