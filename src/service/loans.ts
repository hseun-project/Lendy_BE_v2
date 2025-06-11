import { applyLoan } from './loans/applyLoan';
import { bondList } from './loans/bondList';
import { cancelApplyLoan } from './loans/cancelApplyLoan';
import { changeLoanState } from './loans/changeLoanState';
import { requestLoan } from './loans/requestLoan';
import { requestLoanList } from './loans/requestLoanList';
import { searchBondUser } from './loans/searchBondUser';

export default {
  searchBondUser,
  applyLoan,
  cancelApplyLoan,
  requestLoanList,
  requestLoan,
  changeLoanState,
  bondList
};
