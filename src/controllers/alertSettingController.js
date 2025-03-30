import AlertSetting from "../models/alertSettingModel.js";
import redisClient from "../config/redis.js";

export const addOrUpdateAlertSetting = async (req, res) => {
  try {
    const { RegionID, DisasterType, ThresholdScore } = req.body;

    const updatedSetting = await AlertSetting.findOneAndUpdate(
      { RegionID, DisasterType },
      { ThresholdScore },
      { new: true, upsert: true }
    );

    // อัปเดต Redis Cache
    const alertSettings = await AlertSetting.find();
    await redisClient.setEx(
      "alert_settings",
      900,
      JSON.stringify(alertSettings)
    );

    // ล้าง Cache risk_data เพื่อบังคับ fetch ใหม่
    await redisClient.del("risk_data");

    res.status(200).json(updatedSetting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
