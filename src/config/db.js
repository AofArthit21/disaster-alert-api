import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// กรณีใช้ ES Module ให้กำหนด __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// โหลดไฟล์ .env
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB Connection Failed:", error);
  }
};

export default connectDB;
