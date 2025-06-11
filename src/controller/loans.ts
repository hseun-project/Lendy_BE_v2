import express, { Response } from 'express';
import { apiLimit, getApiLimit } from '../middleware/limit';
import { verifyJWT } from '../middleware/jwt';
import { AuthenticatedRequest } from '../types';
import loans from '../service/loans';

const app = express.Router();

app.post('/', apiLimit, verifyJWT, (req: AuthenticatedRequest, res: Response) => {
  loans.applyLoan(req, res);
});
app.get('/', getApiLimit, verifyJWT, (req: AuthenticatedRequest, res: Response) => {
  loans.requestLoanList(req, res);
});
app.get('/bond', getApiLimit, verifyJWT, (req: AuthenticatedRequest, res: Response) => {
  loans.searchBondUser(req, res);
});
app.get('/lent', getApiLimit, verifyJWT, (req: AuthenticatedRequest, res: Response) => {
  loans.bondList(req, res);
});
app.get('/:applyLoanId', getApiLimit, verifyJWT, (req: AuthenticatedRequest, res: Response) => {
  loans.requestLoan(req, res);
});
app.patch('/:applyLoanId', apiLimit, verifyJWT, (req: AuthenticatedRequest, res: Response) => {
  loans.changeLoanState(req, res);
});
app.delete('/:applyLoanId', apiLimit, verifyJWT, (req: AuthenticatedRequest, res: Response) => {
  loans.cancelApplyLoan(req, res);
});

export default app;
