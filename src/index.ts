import express from "express";
import dotenv from "dotenv";
import routes from "./routes";
import mqtt from "mqtt";
import { postSensorData } from "./utils";

dotenv.config();

export const mqttClient = mqtt.connect(process.env.MQTT_BROKER_URL || "", {
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
});

const app = express();
const port = process.env.PORT || 3000;

export let lastSeenTimestamp = new Date();

app.use(express.json());
app.use("/", routes);

mqttClient.on("connect", () => {
  console.log("Connected to MQTT broker");
});

mqttClient.on("error", (err) => {
  console.error("MQTT Error:", err);
});

mqttClient.subscribe("esp32/health");
mqttClient.subscribe("esp32/sensor-data");
mqttClient.on("message", (topic, message) => {
  if (topic === "esp32/health") {
    console.log("Heartbeat received:", message.toString());
    lastSeenTimestamp = new Date();
  }

  if (topic === "esp32/sensor-data") {
    console.log("Sensor Data received:", message.toString());
    (async () => {
      try {
        const { temperature, humidity } = JSON.parse(message.toString());
        await postSensorData(temperature, humidity);
      } catch (error) {
        console.error("Failed to parse or insert sensor data:", error);
      }
    })();
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
