import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
import logger from "../config/logger.js";

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendAlert = async (regionId, disasterType, riskLevel) => {
  const alertMessage = `🚨 Alert: ${disasterType} risk detected in Region ${regionId}!`;

  const emailMessage = `
    🚨 **Alert: High Risk Detected!** 🚨
    **Region:** ${regionId}
    **Disaster Type:** ${disasterType}
    **Risk Level:** ${riskLevel}
    **Timestamp:** ${new Date().toLocaleString("en-US", {
      timeZone: "Asia/Bangkok",
    })}
    **Message:** ${alertMessage}
  `;

  logger.info(
    `Preparing to send alert for Region ${regionId}, Disaster Type: ${disasterType}`
  );
  console.log("🔄 Preparing to send email:", emailMessage);

  const msg = {
    to: process.env.ALERT_EMAIL,
    from: process.env.SENDGRID_SENDER,
    subject: "🚨 Disaster Alert Notification",
    text: emailMessage.replace(/\n/g, " "),
    html: emailMessage.replace(/\n/g, "<br>"),
  };

  try {
    await sgMail.send(msg);
    console.log("✅ Email alert sent successfully!");
    logger.info(`Email alert sent successfully for Region ${regionId}`);
  } catch (error) {
    console.error("❌ Error sending email alert:", error.message);
    logger.error(
      `Error sending email alert for Region ${regionId}: ${error.message}`
    );
    throw new Error("Failed to send email alert.");
  }
};

export default sendAlert;
