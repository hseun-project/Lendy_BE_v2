import express, { Response } from 'express';
import { apiLimit, getApiLimit } from '../middleware/limit';
import { AuthenticatedRequest } from '../types';
import user from '../service/user';
import { verifyJWT } from '../middleware/jwt';

const app = express.Router();

app.get('/info', getApiLimit, verifyJWT, (req: AuthenticatedRequest, res: Response) => {
  user.userInfo(req, res);
});
app.put('/bank', apiLimit, verifyJWT, (req: AuthenticatedRequest, res: Response) => {
  user.modifyBank(req, res);
});

export default app;
