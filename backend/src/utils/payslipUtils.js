export const getDefaultTemplateCatalog = () => [
  {
    id: 'classic-template',
    name: 'Classic Ledger',
    description: 'Balanced blocks with summary rows',
    accentStyle: 'classic',
  },
  {
    id: 'modern-template',
    name: 'Modern Stripe',
    description: 'Top strip style with clean sections',
    accentStyle: 'modern',
  },
  {
    id: 'minimal-template',
    name: 'Minimal Mono',
    description: 'Lightweight compact payslip layout',
    accentStyle: 'minimal',
  },
  {
    id: 'executive-template',
    name: 'Executive Panel',
    description: 'Strong heading with highlighted totals',
    accentStyle: 'executive',
  },
];

export const getDefaultPayslipSettings = () => ({
  companyName: 'Your Company',
  companyAddress: '',
  companyEmail: '',
  companyPhone: '',
  logoData: '',
  signatureData: '',
  primaryColor: '#0F766E',
  secondaryColor: '#E2E8F0',
  footerNote: 'This is a system generated payslip.',
  activeTemplateId: 'classic-template',
  templates: getDefaultTemplateCatalog(),
});

const templateClassMap = {
  classic: 'border-top: 4px solid {{primaryColor}};',
  modern: 'background: linear-gradient(90deg, {{primaryColor}} 0%, #0ea5e9 100%); color: #fff;',
  minimal: 'border-bottom: 2px solid {{secondaryColor}};',
  executive: 'background: #111827; color: #fff;',
};

export const generatePayslipHtml = ({ salary, employee, settings, template, payroll, format = 'compact' }) => {
  const isFull = format === 'full' && payroll;
  const dailyWage = Number(payroll?.dailyWage || 0);
  const fullDays = Number(payroll?.fullDays || 0);
  const halfDays = Number(payroll?.halfDays || 0);
  const paidLeaves = Number(payroll?.paidLeaves || 0);
  const breakdown = isFull
    ? {
        workedDaysPay: (fullDays + halfDays * 0.5) * dailyWage,
        paidLeavePay: paidLeaves * dailyWage,
        overtimePay: Number(payroll.overtimeAmount || 0),
        extraPay: Number(payroll.extraAmount || 0),
        leaveEncashmentPay: Number(payroll.leaveEncashmentAmount || 0),
        penalties: Number(payroll.penalties || 0),
        loanAmount: Number(payroll.loanAmount || 0),
        professionalTax: Number(payroll.professionalTax || 0),
      }
    : salary.payrollBreakdown?.workedDaysPay == null
    ? null
    : salary.payrollBreakdown;
  const earnings = isFull
    ? [
        [`Worked Days (${fullDays} full + ${halfDays} half)`, breakdown.workedDaysPay],
        [`Paid Leaves (${paidLeaves} days)`, breakdown.paidLeavePay],
        [`Overtime (${Number(payroll.overtimeHours || 0).toFixed(2)} hours)`, breakdown.overtimePay],
        ['Extra Allowances', breakdown.extraPay],
        ['Leave Encashment', breakdown.leaveEncashmentPay],
      ]
    : breakdown
    ? [
        ['Base Salary (Worked Days)', breakdown.workedDaysPay],
        ['Paid Leave', breakdown.paidLeavePay],
        ['Overtime', breakdown.overtimePay],
        ['Extra Allowances', breakdown.extraPay],
        ['Leave Encashment', breakdown.leaveEncashmentPay],
      ]
    : [
        ['Base Salary', salary.baseSalary],
        ['Bonus', salary.bonuses],
      ];
  const gross = breakdown
    ? earnings.reduce((total, [, amount]) => total + Number(amount || 0), 0)
    : Number(salary.baseSalary || 0) + Number(salary.bonuses || 0);
  const deductions = breakdown
    ? [
        ['Penalties', breakdown.penalties],
        ['Loan / Advance', breakdown.loanAmount],
        ['Professional Tax', breakdown.professionalTax],
      ]
    : [];
  const totalDeductions = breakdown
    ? deductions.reduce((total, [, amount]) => total + Number(amount || 0), 0)
    : Number(salary.deductions || 0);
  const adjustment = isFull
    ? Number(payroll.totalSalary ?? gross - totalDeductions) - (gross - totalDeductions)
    : Number(breakdown?.netPayAdjustment || 0);
  const net = isFull
    ? Number(payroll.totalSalary ?? gross - totalDeductions)
    : salary.totalSalary == null
    ? gross - totalDeductions + adjustment
    : Number(salary.totalSalary);
  const componentRows = (items) => items
    .filter(([, amount], index) => index === 0 || Number(amount || 0) !== 0)
    .map(([label, amount]) => `<tr><td>${label}</td><td>${Number(amount || 0).toFixed(2)}</td></tr>`)
    .join('');
  const attendanceSummary = isFull
    ? `<section class="attendance">
        <h2>Attendance Summary</h2>
        <div class="attendance-grid">
          <div><span>Working Days</span><strong>${Number(payroll.workingDays || 0)}</strong></div>
          <div><span>Full Days Present</span><strong>${fullDays}</strong></div>
          <div><span>Half Days Present</span><strong>${halfDays}</strong></div>
          <div><span>Paid Leaves</span><strong>${paidLeaves}</strong></div>
          <div><span>Unpaid / Absent Days</span><strong>${Number(payroll.unpaidDays || 0)}</strong></div>
        </div>
        <p>Daily wage: INR ${dailyWage.toFixed(2)}. Half days earn 50% of the daily wage. Unpaid days are excluded from earnings.</p>
      </section>`
    : '';
  const monthName = new Date(
    salary.salaryYear || new Date().getFullYear(),
    (salary.salaryMonth || 1) - 1
  ).toLocaleString('en-US', { month: 'long' });
  const headerStyle =
    templateClassMap[template?.accentStyle || 'classic'] || templateClassMap.classic;

  return `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Payslip - ${salary.employeeName}</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f8fafc; margin: 0; padding: 24px; color: #0f172a; }
    .card { max-width: 840px; margin: 0 auto; background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden; }
    .header { padding: 20px 24px; ${headerStyle.replace('{{primaryColor}}', settings.primaryColor).replace('{{secondaryColor}}', settings.secondaryColor)} }
    .body { padding: 24px; }
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 18px; }
    .label { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.04em; }
    .value { font-size: 14px; font-weight: 600; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { text-align: left; padding: 10px 8px; border-bottom: 1px solid #e2e8f0; }
    th { font-size: 12px; text-transform: uppercase; color: #64748b; }
    .total { font-weight: 700; color: ${settings.primaryColor}; }
    .footer { padding: 18px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; }
    .brand { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .brand img { max-height: 48px; }
    .signature { margin-top: 24px; }
    .signature img { max-height: 64px; }
    .attendance { margin: 20px 0 24px; }
    .attendance h2, .breakdown-heading { font-size: 15px; margin: 0 0 12px; color: #0f172a; }
    .attendance-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
    .attendance-grid div { padding: 12px 8px; background: #f1f5f9; border-radius: 8px; }
    .attendance-grid span { display: block; font-size: 11px; color: #64748b; }
    .attendance-grid strong { display: block; margin-top: 6px; font-size: 18px; }
    .attendance p { color: #64748b; font-size: 12px; line-height: 1.5; }
    .group-row td { background: #f8fafc; font-weight: 700; font-size: 12px; color: #475569; }
    .print-actions { max-width: 840px; margin: 0 auto 12px; text-align: right; }
    .print-actions button { padding: 9px 14px; border: 0; border-radius: 7px; background: ${settings.primaryColor}; color: #fff; font-weight: 600; cursor: pointer; }
    @media (max-width: 600px) { .attendance-grid { grid-template-columns: repeat(2, 1fr); } }
    @media print { body { background: #fff; padding: 0; } .card { border: 0; } .print-actions { display: none; } }
  </style>
</head>
<body>
  ${isFull ? '<div class="print-actions"><button type="button" onclick="window.print()">Print / Save PDF</button></div>' : ''}
  <div class="card">
    <div class="header">
      <div class="brand">
        ${settings.logoData ? `<img src="${settings.logoData}" alt="Company Logo" />` : ''}
        <div>
          <div style="font-size: 20px; font-weight: 700;">${settings.companyName}</div>
          <div style="font-size: 12px; opacity: 0.85;">${settings.companyAddress || ''}</div>
        </div>
      </div>
      <div style="font-size: 13px; margin-top: 8px;">${isFull ? 'Full Payslip' : 'Payslip'} for ${monthName} ${salary.salaryYear}</div>
    </div>
    <div class="body">
      <div class="grid">
        <div><div class="label">Employee Name</div><div class="value">${employee.name}</div></div>
        <div><div class="label">Employee Email</div><div class="value">${employee.email}</div></div>
        <div><div class="label">Employee ID</div><div class="value">${employee.employeeCode || employee._id || '-'}</div></div>
        <div><div class="label">Month</div><div class="value">${monthName}</div></div>
        <div><div class="label">Year</div><div class="value">${salary.salaryYear}</div></div>
        ${isFull ? `<div><div class="label">Payment Status</div><div class="value">${payroll.status === 'paid' ? 'Paid' : 'Unpaid'}</div></div>` : ''}
      </div>

      ${attendanceSummary}
      ${isFull ? '<h2 class="breakdown-heading">Salary Breakdown</h2>' : ''}
      <table>
        <thead>
          <tr><th>Component</th><th>Amount (INR)</th></tr>
        </thead>
        <tbody>
          ${isFull ? '<tr class="group-row"><td colspan="2">Earnings</td></tr>' : ''}
          ${componentRows(earnings)}
          <tr><td>Gross Salary</td><td>${gross.toFixed(2)}</td></tr>
          ${isFull ? '<tr class="group-row"><td colspan="2">Deductions</td></tr>' : ''}
          ${componentRows(deductions)}
          <tr><td>Total Deductions</td><td>${totalDeductions.toFixed(2)}</td></tr>
          ${Math.abs(adjustment) >= 0.005 ? `<tr><td>Net Pay Adjustment</td><td>${adjustment.toFixed(2)}</td></tr>` : ''}
          <tr><td class="total">Net Salary</td><td class="total">${net.toFixed(2)}</td></tr>
        </tbody>
      </table>

      <div class="signature">
        ${settings.signatureData ? `<img src="${settings.signatureData}" alt="Authorized Signature" />` : ''}
        <div class="label" style="margin-top:8px;">Authorized Signatory</div>
      </div>
    </div>
    <div class="footer">
      <div>${settings.footerNote || ''}</div>
      <div style="margin-top: 4px;">${settings.companyEmail || ''} ${settings.companyPhone ? `| ${settings.companyPhone}` : ''}</div>
    </div>
  </div>
</body>
</html>`;
};
