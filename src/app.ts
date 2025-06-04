import express from 'express';
import cors, { CorsOptions } from 'cors';
import { configDotenv } from 'dotenv';
import router from './controller';

configDotenv();
const port: number = Number(process.env.PORT) || 8080;
const corsOptions: CorsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  credentials: true
};

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors(corsOptions));

app.use('/', router);

app
  .listen(port, () => {
    console.log(`Server is running on ${port}`);
  })
  .on('error', (err) => {
    console.error(`Failed to start server : ${err}`);
    process.exit(1);
  });
