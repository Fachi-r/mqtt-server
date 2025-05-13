import express from "express";
import routes from "./routes";
import { server } from "./webSocket";
import cors from "cors";

export const app = express();
const webSocketPort = process.env.PORT || 4000;
const mqttPort = process.env.MQTT_PORT || 4001;

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

app.get("/", (_req, res) => {
  res.send("Server + WebSocket are up!");
});

app.listen(mqttPort, () => {
  console.log(`🚀 MQTT server running on http://localhost:${mqttPort}`);
});

server.listen(webSocketPort, () => {
  console.log(`🚀 WebSocket server running on http://localhost:${webSocketPort}`);
});
