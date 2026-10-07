import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePayrollAmounts } from '../src/utils/payrollCalculation.js';
import { generatePayslipHtml, getDefaultPayslipSettings } from '../src/utils/payslipUtils.js';

test('unpaid days and half days are reflected once in earned pay', () => {
  const amounts = calculatePayrollAmounts({
    fullDays: 9,
    halfDays: 5,
    paidLeaves: 0,
    dailyWage: 12000 / 26,
    overtimeAmount: 598.85,
    extraAmount: 461.54,
    penalties: 0,
    loanAmount: 0,
    professionalTax: 0,
  });

  assert.equal(amounts.workedDaysPay.toFixed(2), '5307.69');
  assert.equal(amounts.grossPay.toFixed(2), '6368.08');
  assert.equal(amounts.deductions, 0);
  assert.equal(amounts.netPay.toFixed(2), '6368.08');
});

test('payslip uses payroll components and omits removed extras', () => {
  const salary = {
    employeeName: 'Example',
    salaryMonth: 9,
    salaryYear: 2026,
    baseSalary: 12000,
    bonuses: 461.54,
    deductions: 5538.46,
    totalSalary: 5307.69,
    payrollBreakdown: {
      workedDaysPay: 5307.69,
      paidLeavePay: 0,
      overtimePay: 0,
      extraPay: 0,
      leaveEncashmentPay: 0,
      penalties: 0,
      loanAmount: 0,
      professionalTax: 0,
      netPayAdjustment: 0,
    },
  };
  const html = generatePayslipHtml({
    salary,
    employee: { name: 'Example', email: 'example@test.com', employeeCode: 'E1' },
    settings: getDefaultPayslipSettings(),
    template: { accentStyle: 'classic' },
  });

  assert.match(html, /Base Salary \(Worked Days\)<\/td><td>5307\.69/);
  assert.match(html, /Gross Salary<\/td><td>5307\.69/);
  assert.match(html, /Total Deductions<\/td><td>0\.00/);
  assert.match(html, /Net Salary<\/td><td class="total">5307\.69/);
  assert.doesNotMatch(html, /Bonus<\/td>|Extra Allowances<\/td>|5538\.46/);
});

test('full payslip shows saved attendance and reconciles to saved net salary', () => {
  const salary = {
    employeeName: 'Example',
    salaryMonth: 9,
    salaryYear: 2026,
    baseSalary: 12000,
    bonuses: 9999,
    deductions: 9999,
    totalSalary: 0,
  };
  const payroll = {
    workingDays: 26,
    fullDays: 9,
    halfDays: 5,
    paidLeaves: 0,
    unpaidDays: 12,
    dailyWage: 12000 / 26,
    overtimeHours: 10.38,
    overtimeAmount: 598.85,
    extraAmount: 0,
    leaveEncashmentAmount: 0,
    penalties: 50,
    loanAmount: 100,
    professionalTax: 0,
    totalSalary: 5756.54,
    status: 'unpaid',
  };
  const html = generatePayslipHtml({
    salary,
    payroll,
    format: 'full',
    employee: { name: 'Example', email: 'example@test.com', employeeCode: 'E1' },
    settings: getDefaultPayslipSettings(),
    template: { accentStyle: 'classic' },
  });

  assert.match(html, /Full Payslip for September 2026/);
  assert.match(html, /Full Days Present<\/span><strong>9<\/strong>/);
  assert.match(html, /Half Days Present<\/span><strong>5<\/strong>/);
  assert.match(html, /Paid Leaves<\/span><strong>0<\/strong>/);
  assert.match(html, /Unpaid \/ Absent Days<\/span><strong>12<\/strong>/);
  assert.match(html, /Worked Days \(9 full \+ 5 half\)<\/td><td>5307\.69/);
  assert.match(html, /Gross Salary<\/td><td>5906\.54/);
  assert.match(html, /Total Deductions<\/td><td>150\.00/);
  assert.doesNotMatch(html, /Net Pay Adjustment<\/td>/);
  assert.match(html, /Net Salary<\/td><td class="total">5756\.54/);
  assert.doesNotMatch(html, /Extra Allowances<\/td>|9999\.00/);
});
