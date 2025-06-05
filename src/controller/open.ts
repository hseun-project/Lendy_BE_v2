import express, { Response } from 'express';
import { getApiLimit } from '../middleware/limit';
import { AuthenticatedRequest } from '../types';
import open from '../service/open';
import { verifyJWT } from '../middleware/jwt';

const app = express.Router();

app.get('/identification', getApiLimit, verifyJWT, (req: AuthenticatedRequest, res: Response) => {
  open.identificationUrl(req, res);
});

export default app;
