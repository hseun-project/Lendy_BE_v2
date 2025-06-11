import express, { Response } from 'express';
import { getApiLimit } from '../middleware/limit';
import { verifyJWT } from '../middleware/jwt';
import { AuthenticatedRequest } from '../types';
import loans from '../service/loans';

const app = express.Router();

app.get('/bond', getApiLimit, verifyJWT, (req: AuthenticatedRequest, res: Response) => {
  loans.searchBondUser(req, res);
});

export default app;
