import express from "express";
import { mqttClient } from ".";
import { lastSeenTimestamp } from ".";

const router = express.Router();

router.get('/status', (req, res) => {
  if (!lastSeenTimestamp) {
    return res.json({ online: false });
  }

  const now = new Date();
  const diff = now.getTime() - lastSeenTimestamp.getTime();
  const isOnline = diff < 15000;

  res.json({ online: isOnline, lastSeen: lastSeenTimestamp });
});

router.post("/bulb", (req, res) => {
  const { state } = req.body;
  if (!state || !["on", "off"].includes(state)) {
    return res
      .status(400)
      .json({ message: `Invalid state. Use "on" or "off". Received state of: \n ${state}` });
  }

  mqttClient.publish("home/bulb", state, (err) => {
    if (err) {
      return res.status(500).json({ message: "Failed to publish bulb state" });
    }
    res.status(200).json({ message: `Bulb turned ${state}` });
  });
});

export default router;
