import express, { Response } from 'express';
import { apiLimit, getApiLimit } from '../middleware/limit';
import { verifyJWT } from '../middleware/jwt';
import { AuthenticatedRequest } from '../types';
import repay from '../service/repay';

const app = express.Router();

app.get('/', getApiLimit, verifyJWT, (req: AuthenticatedRequest, res: Response) => {
  repay.repayList(req, res);
});
app.get('/:loanId', getApiLimit, verifyJWT, (req: AuthenticatedRequest, res: Response) => {
  repay.repayDetail(req, res);
});
app.post('/:loanId', apiLimit, verifyJWT, (req: AuthenticatedRequest, res: Response) => {
  repay.repay(req, res);
});

export default app;
