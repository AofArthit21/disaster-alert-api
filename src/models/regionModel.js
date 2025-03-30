import mongoose from "mongoose";

const regionSchema = new mongoose.Schema({
  RegionID: { type: String, unique: true, required: true },
  LocationCoordinates: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  DisasterTypes: [{ type: String, required: true }],
});

export default mongoose.model("Region", regionSchema);
