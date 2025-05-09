import express from "express";
import dotenv from "dotenv";
import routes from "./routes";
import mqtt from "mqtt";
import { postSensorData } from "./utils";
import { broadcastData, server } from "./webSocket";
import cors from "cors";

dotenv.config();

export const mqttClient = mqtt.connect(process.env.MQTT_BROKER_URL || "", {
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
});

export const app = express();
const port = process.env.PORT || 4000;
const mqttPort = process.env.MQTT_PORT || 4001;

export let lastSeenTimestamp = new Date();

app.use(express.json());
// Allow all origins (development mode only!)
// Fix: CORS middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  })
);
app.use("/", routes);

mqttClient.on("connect", () => {
  console.log("Connected to MQTT broker");
});

mqttClient.on("error", (err) => {
  console.error("MQTT Error:", err);
});

mqttClient.subscribe("esp32/health");
mqttClient.subscribe("esp32/sensor-data");
mqttClient.subscribe("esp32/bulb-status");
mqttClient.on("message", (topic, message) => {
  const payload = JSON.parse(message.toString());

  switch (topic) {
    case "esp32/health": {
      console.log("ESP32 heartbeat received.");
      lastSeenTimestamp = new Date();
      const data = JSON.stringify({
        type: "esp32-health",
        status: payload.status,
      });
      broadcastData(data);
      break;
    }

    case "esp32/bulb-status": {
      // Update DB or frontend about the bulb state
      console.log(`Bulb status: ${payload.bulb}`);
      const data = JSON.stringify({
        type: "bulb-status",
        isOn: payload.bulb,
      });
      broadcastData(data);
      break;
    }

    case "esp32/sensor-data": {
      // Parse and store the sensor data (e.g., temp and humidity)
      console.log(`Sensor data received: ${payload}`);
      const data = JSON.stringify({
        type: "sensor-data",
        temperature: payload.temperature,
        humidity: payload.humidity,
      });
      (async () => {
        try {
          // Post to Database
          const { temperature, humidity } = payload;
          postSensorData(temperature, humidity);
          // Send to all WebSocket clients
          broadcastData(data);
        } catch (error) {
          console.error("Failed to parse sensor data:", error);
        }
      })();
      break;
    }

    default:
      console.warn(`Unhandled topic: ${topic}`);
      break;
  }
});

app.get("/", (_req, res) => {
  res.send("Server + WebSocket are up!");
});

app.listen(mqttPort, () => {
  console.log(`🚀 MQTT server running on http://localhost:${mqttPort}`);
});

server.listen(port, () => {
  console.log(`🚀 WebSocket server running on http://localhost:${port}`);
});
