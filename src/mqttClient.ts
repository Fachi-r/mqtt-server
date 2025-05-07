
import mqtt from 'mqtt';
import dotenv from 'dotenv';

dotenv.config();

export const mqttClient = mqtt.connect(process.env.MQTT_BROKER_URL || '', {
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
});
