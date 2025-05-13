import routes from "./routes";
import { app, server } from "./webSocket";
import cors from "cors";
import express from "express";

const PORT = process.env.PORT || 4000;
// const mqttPort = process.env.MQTT_PORT || 4001;

// Allow all origins (development mode only!)
app.use(cors());
app.use(express.json());
app.use("/", routes);

app.get("/", (_req, res) => {
  res.send("Server + WebSocket are up!");
});

// app.listen(mqttPort, () => {
//   console.log(`🚀 MQTT server running on http://localhost:${mqttPort}`);
// });

server.listen(PORT, () => {
  console.log(`🚀 Server (Express + WebSocket) running on port ${PORT}`);
});
