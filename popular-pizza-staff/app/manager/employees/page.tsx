"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  addEmployee,
  getEmployees,
  toggleEmployeeActive,
} from "@/app/lib/employeeStorage";

const availableRoles = ["Driver", "Kitchen", "Manager"];

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
  const [employeeToToggle, setEmployeeToToggle] =
    useState<Employee | null>(null);
  const [editingEmployee, setEditingEmployee] =
    useState<Employee | null>(null);

  const [name, setName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [pin, setPin] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [roles, setRoles] = useState<string[]>(["Driver"]);
  const [canAccessManager, setCanAccessManager] = useState(false);

  useEffect(() => {
    setEmployees(getEmployees());
  }, []);

  function toggleRole(role: string) {
    setRoles((prev) => {
      if (prev.includes(role)) {
        return prev.filter((item) => item !== role);
      }

      return [...prev, role];
    });

    if (role === "Manager") {
      setCanAccessManager((prev) => !prev);
    }
  }

  function resetForm() {
    setName("");
    setEmployeeId("");
    setPin("");
    setHourlyRate("");
    setRoles(["Driver"]);
    setCanAccessManager(false);
  }

  function handleAddEmployee() {
    if (
      !name.trim() ||
      !employeeId.trim() ||
      !pin.trim() ||
      !hourlyRate.trim() ||
      roles.length === 0
    ) {
      return;
    }

    const newEmployee: Employee = {
      id: employeeId.trim().toUpperCase(),
      pin: pin.trim(),
      name: name.trim(),
      roles,
      hourlyRate: Number(hourlyRate),
      canAccessManager,
      isActive: true,
    };

    addEmployee(newEmployee);
    setEmployees(getEmployees());

    resetForm();
    setShowAddEmployee(false);
  }

  return (
    <>
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
                    onClick={() => {
                      resetForm();
                      setShowAddEmployee(false);
                    }}
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

                  <div>
                    <p className="text-sm text-gray-500">Roles</p>

                    <div className="mt-2 space-y-2">
                      {availableRoles.map((role) => (
                        <label
                          key={role}
                          className="flex items-center gap-3 rounded-xl border p-3 text-gray-900"
                        >
                          <input
                            type="checkbox"
                            checked={roles.includes(role)}
                            onChange={() => toggleRole(role)}
                            className="h-5 w-5"
                          />

                          <span>{role}</span>
                        </label>
                      ))}
                    </div>
                  </div>

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
              <div
                key={employee.id}
                className="rounded-2xl bg-white p-4 shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-gray-900">
                      {employee.name}
                    </p>

                    <p className="text-sm text-gray-500">
                      {employee.id}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingEmployee(employee)}
                      className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                    >
                      ✏️
                    </button>

                    <button
                      type="button"
                      onClick={() => setEmployeeToToggle(employee)}
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        employee.isActive === false
                          ? "bg-gray-200 text-gray-600"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {employee.isActive === false ? "Inactive" : "Active"}
                    </button>
                  </div>
                </div>

                <p className="mt-3 text-sm text-gray-600">
                  {employee.roles.join(" • ")}
                </p>

                <p className="mt-1 font-bold text-gray-900">
                  ${employee.hourlyRate.toFixed(2)}/hr
                </p>

                {employee.canAccessManager && (
                  <p className="mt-2 text-sm font-semibold text-red-600">
                    Manager Access
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      {employeeToToggle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900">
              {employeeToToggle.isActive === false
                ? "Activate Employee?"
                : "Deactivate Employee?"}
            </h2>

            <p className="mt-3 text-gray-600">
              {employeeToToggle.isActive === false
                ? `Reactivate ${employeeToToggle.name}? They will be able to log in again.`
                : `Deactivate ${employeeToToggle.name}? They will no longer be able to log in.`}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setEmployeeToToggle(null)}
                className="rounded-xl border p-3 font-bold text-gray-700"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  toggleEmployeeActive(employeeToToggle.id);
                  setEmployees(getEmployees());
                  setEmployeeToToggle(null);
                }}
                className={`rounded-xl p-3 font-bold text-white ${
                  employeeToToggle.isActive === false
                    ? "bg-green-600"
                    : "bg-red-600"
                }`}
              >
                {employeeToToggle.isActive === false
                  ? "Activate"
                  : "Deactivate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {editingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900">
              Edit Employee
            </h2>

            <p className="mt-3 text-gray-600">
              Editing {editingEmployee.name}
            </p>

            <button
              type="button"
              onClick={() => setEditingEmployee(null)}
              className="mt-5 w-full rounded-xl bg-red-600 p-3 font-bold text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}