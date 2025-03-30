import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

export const fetchWeatherData = async (lat, lon) => {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    console.log(`🔄 Fetching weather data for lat: ${lat}, lon: ${lon}`);
    const response = await axios.get(url);
    console.log(JSON.stringify(response.data, null, 2));
    if (!response.data || !response.data.main) {
      throw new Error("Incomplete weather data received.");
    }

    const { main, wind, rain } = response.data;
    return {
      temperature: main.temp || 0,
      humidity: main.humidity || 0,
      windSpeed: wind?.speed || 0,
      rainfall: rain?.["1h"] || 0,
    };
  } catch (error) {
    console.error("❌ Error fetching weather data:", error.message);
    return null;
  }
};

export const fetchEarthquakeData = async (lat, lon) => {
  try {
    const url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&latitude=${lat}&longitude=${lon}&maxradiuskm=100&orderby=time&limit=1`;
    console.log(`🔄 Fetching earthquake data for lat: ${lat}, lon: ${lon}`);
    const response = await axios.get(url);
    console.log(JSON.stringify(response.data, null, 2));
    if (
      !response.data ||
      !response.data.features ||
      response.data.features.length === 0
    ) {
      throw new Error("No earthquake data available.");
    }

    return response.data.features.map((quake) => ({
      magnitude: quake.properties.mag || 0,
      location: quake.properties.place || "Unknown",
      time: quake.properties.time
        ? new Date(quake.properties.time)
        : new Date(),
    }));
  } catch (error) {
    console.error("❌ Error fetching earthquake data:", error.message);
    return null;
  }
};
