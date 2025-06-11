import express from 'express';
import auth from './auth';
import open from './open';
import user from './user';
import loans from './loans';

const app = express();

app.use('/auth', auth);
app.use('/open', open);
app.use('/user', user);
app.use('/loans', loans);

export default app;
