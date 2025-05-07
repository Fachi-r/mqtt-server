
import express from 'express';
import dotenv from 'dotenv';
import { mqttClient } from './mqttClient';
import routes from './routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/', routes);

mqttClient.on('connect', () => {
  console.log('Connected to MQTT broker');
});

mqttClient.on('error', (err) => {
  console.error('MQTT Error:', err);
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
