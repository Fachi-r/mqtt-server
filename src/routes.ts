import express from "express";
import { mqttClient } from ".";

const router = express.Router();

router.post("/bulb", (req, res) => {
  const { state } = req.body;
  if (!state || !["on", "off"].includes(state)) {
    return res
      .status(400)
      .json({ message: 'Invalid state. Use "on" or "off".' });
  }

  mqttClient.publish("home/bulb", state, (err) => {
    if (err) {
      return res.status(500).json({ message: "Failed to publish bulb state" });
    }
    res.status(200).json({ message: `Bulb turned ${state}` });
  });
});

export default router;
