import { employees as defaultEmployees } from "@/app/data/employee";

export function getEmployees() {
  const stored = localStorage.getItem("employees");

  if (stored) {
    return JSON.parse(stored);
  }

  localStorage.setItem(
    "employees",
    JSON.stringify(defaultEmployees)
  );

  return defaultEmployees;
}

export function saveEmployees(employees: any[]) {
  localStorage.setItem(
    "employees",
    JSON.stringify(employees)
  );
}

export function addEmployee(newEmployee: any) {
  const employees = getEmployees();

  employees.push(newEmployee);

  saveEmployees(employees);
}

export function deactivateEmployee(employeeId: string) {
  const employees = getEmployees();

  const updated = employees.map((employee: any) =>
    employee.id === employeeId
      ? { ...employee, isActive: false }
      : employee
  );

  saveEmployees(updated);
}
export function toggleEmployeeActive(employeeId: string) {
  const employees = getEmployees();

  const updatedEmployees = employees.map((employee: any) =>
    employee.id === employeeId
      ? { ...employee, isActive: employee.isActive === false }
      : employee
  );

  saveEmployees(updatedEmployees);
}
