export const calculatePayrollAmounts = ({
  fullDays = 0,
  halfDays = 0,
  paidLeaves = 0,
  dailyWage = 0,
  overtimeAmount = 0,
  extraAmount = 0,
  leaveEncashmentAmount = 0,
  penalties = 0,
  loanAmount = 0,
  professionalTax = 0,
}) => {
  const workedDaysPay = (fullDays + halfDays * 0.5) * dailyWage;
  const paidLeavePay = paidLeaves * dailyWage;
  const grossPay =
    workedDaysPay + paidLeavePay + overtimeAmount + extraAmount + leaveEncashmentAmount;
  const deductions = penalties + loanAmount + professionalTax;

  return { workedDaysPay, paidLeavePay, grossPay, deductions, netPay: grossPay - deductions };
};
