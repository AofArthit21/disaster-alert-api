import redisClient from "../config/redis.js";
import alertSettingModel from "../models/alertSettingModel.js";
import Alert from "../models/alertModel.js";
import sendAlert from "../services/alertService.js";
import {
  fetchWeatherData,
  fetchEarthquakeData,
} from "../services/externalAPI.js";
import Region from "../models/regionModel.js";

const calculateFloodRisk = (rainfall) => {
  if (rainfall <= 50) return (rainfall / 50) * 80;
  return Math.min(80 + ((rainfall - 50) / 50) * 20, 100);
};

const calculateEarthquakeRisk = (magnitude) => {
  if (magnitude <= 5) return (magnitude / 5) * 80;
  return Math.min(80 + ((magnitude - 5) / 5) * 20, 100);
};

const calculateWildfireRisk = (temperature, humidity) => {
  let riskScore = temperature * 1.5 - humidity * 0.5;
  return Math.max(0, Math.min(riskScore, 100));
};

const getRiskLevel = (score) =>
  score >= 80 ? "High" : score >= 50 ? "Medium" : "Low";

export const calculateRisk = async (req, res) => {
  try {
    const cachedData = await redisClient.get("risk_data");

    if (cachedData) {
      console.log("✅ Fetching risk data from Redis cache");

      const parsedData = JSON.parse(cachedData);

      // ตรวจสอบว่ามีรายการไหนที่ AlertTriggered: true
      const alertsToSend = parsedData.filter((data) => data.AlertTriggered);

      if (alertsToSend.length > 0) {
        console.log(
          "🚨 Cached risk data contains alerts. Sending notifications..."
        );
        for (const alert of alertsToSend) {
          await sendAlert(alert.RegionID, alert.DisasterType, alert.RiskLevel);
        }
      }

      return res.json(parsedData);
    }

    const regions = await Region.find();
    if (!regions || regions.length === 0) {
      throw new Error("No regions available for risk calculation.");
    }

    let riskData = [];

    for (const region of regions) {
      const { latitude, longitude } = region.LocationCoordinates || {};
      if (!latitude || !longitude) {
        console.warn(
          `⚠️ Missing location data for Region ID: ${region.RegionID}`
        );
        continue; // ข้ามที่ไม่มีข้อมูล
      }

      let riskReports = [];

      for (const disasterType of region.DisasterTypes || []) {
        let riskScore = 0;

        const cacheKey = `env_data:${latitude},${longitude}`;
        let weatherData = await redisClient.get(cacheKey);

        if (!weatherData) {
          console.log(
            `🔄 Fetching new environmental data for ${latitude}, ${longitude}`
          );
          weatherData = await fetchWeatherData(latitude, longitude);
          if (weatherData) {
            await redisClient.setEx(cacheKey, 900, JSON.stringify(weatherData));
          } else {
            console.warn(
              `⚠️ No weather data available for ${latitude}, ${longitude}`
            );
            continue; // ข้ามไปหากไม่มีข้อมูลสภาพอากาศ
          }
        } else {
          console.log(
            `✅ Using cached environmental data for ${latitude}, ${longitude}`
          );
          weatherData = JSON.parse(weatherData);
        }

        if (disasterType === "flood") {
          riskScore = calculateFloodRisk(weatherData.rainfall);
        }

        if (disasterType === "earthquake") {
          const earthquakeCacheKey = `earthquake_data:${latitude},${longitude}`;
          let earthquakeData = await redisClient.get(earthquakeCacheKey);

          if (!earthquakeData) {
            console.log(
              `🔄 Fetching new earthquake data for ${latitude}, ${longitude}`
            );

            earthquakeData = await fetchEarthquakeData(latitude, longitude);

            if (earthquakeData) {
              await redisClient.setEx(
                earthquakeCacheKey,
                900,
                JSON.stringify(earthquakeData)
              );
            } else {
              console.warn(
                `⚠️ No earthquake data available for ${latitude}, ${longitude}`
              );
              continue;
            }
          } else {
            console.log(
              `✅ Using cached earthquake data for ${latitude}, ${longitude}`
            );
            earthquakeData = JSON.parse(earthquakeData);
          }

          if (earthquakeData.length > 0) {
            riskScore = calculateEarthquakeRisk(earthquakeData[0].magnitude);
          }
        }

        if (disasterType === "wildfire") {
          riskScore = calculateWildfireRisk(
            weatherData.temperature,
            weatherData.humidity
          );
        }

        let riskLevel = getRiskLevel(riskScore);

        const alertSetting = await alertSettingModel.findOne({
          RegionID: region.RegionID,
          DisasterType: disasterType,
        });

        let alertTriggered =
          alertSetting && riskScore >= alertSetting.ThresholdScore;

        if (alertTriggered) {
          const alertMessage = `🚨 Alert: ${disasterType} risk detected in Region ${region.RegionID}!`;
          await new Alert({
            RegionID: region.RegionID,
            DisasterType: disasterType,
            RiskLevel: riskLevel,
            AlertMessage: alertMessage,
          }).save();
          await sendAlert(region.RegionID, disasterType, riskLevel);
        }

        riskReports.push({
          RegionID: region.RegionID,
          DisasterType: disasterType,
          RiskScore: riskScore,
          RiskLevel: riskLevel,
          AlertTriggered: alertTriggered,
        });
      }

      if (riskReports.length > 0) {
        riskData.push(...riskReports);
      }
    }

    if (riskData.length === 0) {
      throw new Error("No risk data generated.");
    }

    await redisClient.setEx("risk_data", 900, JSON.stringify(riskData));
    res.json(riskData);
  } catch (error) {
    console.error("❌ Error calculating risk:", error.message);
    res.status(500).json({ error: error.message });
  }
};
