"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { addEmployee, getEmployees } from "@/app/lib/employeeStorage";

type Employee = {
  id: string;
  pin: string;
  name: string;
  roles: string[];
  hourlyRate: number;
  canAccessManager: boolean;
  isActive?: boolean;
};

export default function ManagerEmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showAddEmployee, setShowAddEmployee] = useState(false);

  const [name, setName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [pin, setPin] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");

  useEffect(() => {
    setEmployees(getEmployees());
  }, []);

  function handleAddEmployee() {
    if (!name.trim() || !employeeId.trim() || !pin.trim() || !hourlyRate.trim()) {
      return;
    }

    const newEmployee: Employee = {
      id: employeeId.trim().toUpperCase(),
      pin: pin.trim(),
      name: name.trim(),
      roles: ["Driver"],
      hourlyRate: Number(hourlyRate),
      canAccessManager: false,
      isActive: true,
    };

    addEmployee(newEmployee);
    setEmployees(getEmployees());

    setName("");
    setEmployeeId("");
    setPin("");
    setHourlyRate("");
    setShowAddEmployee(false);
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <div className="mx-auto max-w-md space-y-4">
        <div className="rounded-3xl bg-red-600 p-5 text-white shadow-lg">
          <Link href="/manager" className="text-sm underline">
            ← Manager Dashboard
          </Link>

          <h1 className="mt-3 text-2xl font-bold">Employees</h1>

          <p className="text-sm opacity-90">
            {employees.length} staff members
          </p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow">
          {!showAddEmployee ? (
            <button
              type="button"
              onClick={() => setShowAddEmployee(true)}
              className="w-full rounded-xl bg-red-600 p-3 font-bold text-white"
            >
              + Add Employee
            </button>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">
                  Add Employee
                </h2>

                <button
                  type="button"
                  onClick={() => setShowAddEmployee(false)}
                  className="text-sm font-semibold text-red-600"
                >
                  Cancel
                </button>
              </div>

              <div className="mt-4 space-y-3">
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Name"
                  className="w-full rounded-xl border p-3 text-gray-900"
                />

                <input
                  value={employeeId}
                  onChange={(event) => setEmployeeId(event.target.value)}
                  placeholder="Employee ID"
                  className="w-full rounded-xl border p-3 text-gray-900"
                />

                <input
                  value={pin}
                  onChange={(event) => setPin(event.target.value)}
                  placeholder="PIN"
                  className="w-full rounded-xl border p-3 text-gray-900"
                />

                <input
                  value={hourlyRate}
                  onChange={(event) => setHourlyRate(event.target.value)}
                  placeholder="Hourly Rate"
                  type="number"
                  step="0.01"
                  className="w-full rounded-xl border p-3 text-gray-900"
                />

                <button
                  type="button"
                  onClick={handleAddEmployee}
                  className="w-full rounded-xl bg-red-600 p-3 font-bold text-white"
                >
                  Save Employee
                </button>
              </div>
            </>
          )}
        </div>

        <div className="space-y-3">
          {employees.map((employee) => (
            <div key={employee.id} className="rounded-2xl bg-white p-4 shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-gray-900">{employee.name}</p>
                  <p className="text-sm text-gray-500">{employee.id}</p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    employee.isActive === false
                      ? "bg-gray-200 text-gray-600"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {employee.isActive === false ? "Inactive" : "Active"}
                </span>
              </div>

              <p className="mt-3 text-sm text-gray-600">
                {employee.roles.join(" • ")}
              </p>

              <p className="mt-1 font-bold text-gray-900">
                ${employee.hourlyRate.toFixed(2)}/hr
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}