import express from 'express';
import auth from './auth';
import open from './open';

const app = express();

app.use('/auth', auth);
app.use('/open', open);

export default app;
