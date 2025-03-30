import sendAlert from "../services/alertService.js";
import Alert from "../models/alertModel.js";

export const sendCustomAlert = async (req, res) => {
  try {
    let { regionID, disasterType, riskLevel } = req.body;

    // สร้างข้อความแจ้งเตือน
    const alertMessage = `🚨 Alert: ${disasterType} risk detected in Region ${regionID}!`;

    // บันทึกลงฐานข้อมูลก่อนส่งอีเมล
    const newAlert = new Alert({
      RegionID: regionID,
      DisasterType: disasterType,
      RiskLevel: riskLevel,
      AlertMessage: alertMessage,
    });

    await newAlert.save();
    console.log("✅ New alert saved:", newAlert);

    // ส่งอีเมลแจ้งเตือน
    await sendAlert(regionID, disasterType, riskLevel);

    res.status(201).json({ success: true, message: "Alert sent and saved." });
  } catch (error) {
    console.error("❌ Error in sendCustomAlert:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ timestamp: -1 });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
