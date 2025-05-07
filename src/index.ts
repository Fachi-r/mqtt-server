import express from "express";
import dotenv from "dotenv";
import routes from "./routes";
import mqtt from "mqtt";

dotenv.config();

export const mqttClient = mqtt.connect(process.env.MQTT_BROKER_URL || "", {
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
});

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use("/", routes);

mqttClient.on("connect", () => {
  console.log("Connected to MQTT broker");
});

mqttClient.on("error", (err) => {
  console.error("MQTT Error:", err);
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
