import express, { Request, Response } from 'express';
import auth from '../service/auth';
import { apiLimit } from '../middleware/limit';

const app = express.Router();

app.post('/signup', apiLimit, (req: Request, res: Response) => {
  auth.signUp(req, res);
});
app.post('/login', apiLimit, (req: Request, res: Response) => {
  auth.login(req, res);
});

export default app;
