import Region from "../models/regionModel.js";
import redisClient from "../config/redis.js";

export const addRegion = async (req, res) => {
  try {
    const region = await Region.create(req.body);

    // อัปเดต Redis Cache
    const regions = await Region.find();
    await redisClient.setEx("regions", 900, JSON.stringify(regions));

    // ล้าง Cache risk_data เพื่อบังคับ fetch ใหม่
    await redisClient.del("risk_data");

    res.status(201).json(region);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
