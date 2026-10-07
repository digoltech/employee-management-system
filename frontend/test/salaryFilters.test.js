import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildPayrollRangeQuery,
  filterPayrollRecords,
  matchesEmployeeSelection,
} from '../src/pages/admin/dashboard/salaryFilters.js';

const employees = [
  { _id: 'e1', name: 'Asha Shah', email: 'asha@example.com', employeeCode: 'E001', department: 'Design' },
  { _id: 'e2', name: 'Ben Patel', email: 'ben@example.com', employeeCode: 'E002', department: 'Sales' },
];
const payrolls = [
  { _id: 'june', employee: employees[0], month: 6, year: 2026, status: 'paid' },
  { _id: 'september', employee: employees[1], month: 9, year: 2026, status: 'unpaid' },
];

test('range query includes every month from June through September', () => {
  assert.deepEqual(buildPayrollRangeQuery({ from: '2026-06-01', to: '2026-09-11' }), {
    startMonth: 6,
    startYear: 2026,
    endMonth: 9,
    endYear: 2026,
    all: 'true',
  });
});

test('employee selection filters rows and combines with search and status', () => {
  assert.equal(matchesEmployeeSelection('e1', []), true);
  assert.equal(matchesEmployeeSelection('e2', ['e1']), false);
  const filtered = filterPayrollRecords(payrolls, employees, {
    selectedEmployeeIds: ['e1'],
    searchQuery: 'asha@example.com',
    department: 'Design',
    status: 'paid',
  });
  assert.deepEqual(filtered.map(payroll => payroll._id), ['june']);
});
