export const buildPayrollRangeQuery = ({ from, to }) => ({
  startMonth: Number(from.slice(5, 7)),
  startYear: Number(from.slice(0, 4)),
  endMonth: Number(to.slice(5, 7)),
  endYear: Number(to.slice(0, 4)),
  all: 'true',
});

export const matchesEmployeeSelection = (employeeId, selectedIds) =>
  selectedIds.length === 0 || selectedIds.includes(employeeId);

export const filterPayrollRecords = (payrolls, employees, filters) => {
  const query = filters.searchQuery.trim().toLowerCase();
  return payrolls.filter(payroll => {
    const employeeId = payroll.employee?._id || payroll.employee;
    if (!matchesEmployeeSelection(employeeId, filters.selectedEmployeeIds)) return false;
    const employee = typeof payroll.employee === 'object'
      ? payroll.employee
      : employees.find(item => item._id === employeeId);
    if (!employee) return false;
    if (filters.department !== 'all' && employee.department !== filters.department) return false;
    if (filters.status !== 'all' && payroll.status !== filters.status) return false;
    if (!query) return true;
    return [employee.name, employee.email, employee.employeeCode, employee.department, employee.designation]
      .some(value => String(value || '').toLowerCase().includes(query));
  });
};
