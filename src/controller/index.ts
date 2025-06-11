import express from 'express';
import auth from './auth';
import open from './open';
import user from './user';

const app = express();

app.use('/auth', auth);
app.use('/open', open);
app.use('/user', user);

export default app;
