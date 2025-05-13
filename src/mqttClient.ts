import dotenv from "dotenv";
import mqtt from "mqtt";
import { postSensorData } from "./utils";
import { broadcastData } from "./webSocket";

dotenv.config();

export const mqttClient = mqtt.connect(process.env.MQTT_BROKER_URL || "", {
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
});

export let lastSeenTimestamp = new Date();

mqttClient.subscribe("esp32/health");
mqttClient.subscribe("esp32/sensor-data");
mqttClient.subscribe("esp32/bulb-status");

mqttClient.on("connect", () => {
  console.log("Connected to MQTT broker");
});

mqttClient.on("error", (err) => {
  console.error("MQTT Error:", err);
});


mqttClient.on("message", (topic, message) => {
  const payload = JSON.parse(message.toString());

  switch (topic) {
    case "esp32/health": {
      // Update frontend on ESP32 state
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
      // Update frontend about the bulb state
      console.log(`Bulb status: ${payload.bulb}`);
      const data = JSON.stringify({
        type: "bulb-status",
        isOn: payload.bulb,
      });
      broadcastData(data);
      break;
    }

    case "esp32/sensor-data": {
      // Parse and store sensor data
      console.log(`Sensor data received: ${payload}`);
      const data = JSON.stringify({
        type: "sensor-data",
        temperature: payload.temperature,
        humidity: payload.humidity,
      });
      (async () => {
        try {
          // Post to Database and send to all Websocket clients
          const { temperature, humidity } = payload;
          postSensorData(temperature, humidity);
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