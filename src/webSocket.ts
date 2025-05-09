import { WebSocket, WebSocketServer } from "ws";
import http from "http";
// import { app } from ".";

export const server = http.createServer();
const wss = new WebSocketServer({ server });

export let clients: Set<WebSocket> = new Set();

export type sensorData = {
  type: string;
  temperature: number;
  humidity: number;
};

export type bulbStatus = {
  type: string;
  isOn: boolean;
};

export type healthStatus = {
  type: string;
  status: string;
};

// Handle client connections
wss.on("connection", (ws: WebSocket) => {
  console.log("Client connected to WebSocket");
  clients.add(ws);

  // // Example of sending a sensor data update every 5 seconds
  // setInterval(() => {
  //   const sensorData = {
  //     type: "sensor-data",
  //     temperature: Math.random() * 30 + 20, // Mock temperature
  //     humidity: Math.random() * 30 + 50, // Mock humidity
  //   };
  //   ws.send(JSON.stringify(sensorData));
  // }, 5000);

  // // Send bulb status updates
  // setInterval(() => {
  //   const bulbStatus = {
  //     type: "bulb-status",
  //     isOn: Math.random() > 0.5,
  //   };
  //   ws.send(JSON.stringify(bulbStatus));
  // }, 10000);

  // // Send ESP32 health status updates
  // setInterval(() => {
  //   const healthStatus = {
  //     type: "esp32-health",
  //     status: "alive",
  //   };
  //   ws.send(JSON.stringify(healthStatus));
  // }, 15000);

  ws.on("close", () => {
    clients.delete(ws);
    console.log("Client disconnected");
  });
});

export function broadcastData(data: any) {
  for (const client of clients) {
    if (client.readyState === client.OPEN) {
      client.send(data);
    }
  }
}
