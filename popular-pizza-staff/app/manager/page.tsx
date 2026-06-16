"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Shift = {
  id: string;
  employeeId?: string;
  employeeName: string;
  clockIn: string;
  clockOut: string;
  hours: number;
  tips: number;
  mileage: number;
};

type Employee = {
  id: string;
  pin: string;
  name: string;
  roles: string[];
  hourlyRate: number;
  canAccessManager: boolean;
};

type EmployeeSummary = {
  employeeId: string;
  employeeName: string;
  hours: number;
  tips: number;
  mileage: number;
};

export default function ManagerDashboard() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    setShifts(JSON.parse(localStorage.getItem("shiftHistory") || "[]"));

    const savedEmployee = localStorage.getItem("currentEmployee");

    if (savedEmployee) {
      setCurrentEmployee(JSON.parse(savedEmployee));
    }
  }, []);

  if (!currentEmployee) {
    return (
      <main className="min-h-screen bg-gray-100 p-4">
        <div className="mx-auto max-w-md rounded-3xl bg-white p-5 shadow">
          <p className="text-gray-500">Checking access...</p>
        </div>
      </main>
    );
  }

  if (!currentEmployee.canAccessManager) {
    return (
      <main className="min-h-screen bg-gray-100 p-4">
        <div className="mx-auto max-w-md rounded-3xl bg-white p-6 text-center shadow">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>

          <p className="mt-2 text-gray-600">
            You do not have permission to view the Manager Dashboard.
          </p>

          <Link
            href="/employee"
            className="mt-5 block rounded-xl bg-red-600 p-3 font-bold text-white"
          >
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const totalHours = shifts.reduce((sum, shift) => sum + shift.hours, 0);
  const totalTips = shifts.reduce((sum, shift) => sum + shift.tips, 0);
  const totalMileage = shifts.reduce((sum, shift) => sum + shift.mileage, 0);

  const employeeSummaries = shifts.reduce<EmployeeSummary[]>((list, shift) => {
    const employeeId = shift.employeeId ?? shift.employeeName;
    const existingEmployee = list.find((item) => item.employeeId === employeeId);

    if (existingEmployee) {
      existingEmployee.hours += shift.hours;
      existingEmployee.tips += shift.tips;
      existingEmployee.mileage += shift.mileage;
      return list;
    }

    list.push({
      employeeId,
      employeeName: shift.employeeName,
      hours: shift.hours,
      tips: shift.tips,
      mileage: shift.mileage,
    });

    return list;
  }, []);

  const payroll = employeeSummaries.reduce((sum, employee) => {
    return sum + employee.hours * currentEmployee.hourlyRate + employee.tips + employee.mileage;
  }, 0);

  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <div className="mx-auto max-w-md space-y-4">
        <div className="rounded-3xl bg-red-600 p-5 text-white shadow-lg">
          <Link href="/employee" className="text-sm underline">
            ← Dashboard
          </Link>

          <h1 className="mt-3 text-2xl font-bold">Manager Dashboard</h1>
          <p className="text-sm opacity-90">
            Payroll overview • {currentEmployee.name}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <StatCard title="Total Hours" value={totalHours.toFixed(2)} />
          <StatCard title="Tips" value={`$${totalTips.toFixed(2)}`} />
          <StatCard title="Mileage" value={`$${totalMileage.toFixed(2)}`} />
          <StatCard title="Payroll" value={`$${payroll.toFixed(2)}`} />
        </div>

         <Link
    href="/schedule?mode=manager"
  className="block rounded-3xl bg-white p-5 shadow hover:bg-gray-50"
>
  <p className="text-sm text-gray-500">Scheduling</p>

  <h2 className="mt-1 text-xl font-bold text-gray-900">
    Schedule
  </h2>

  <p className="mt-2 text-sm text-gray-500">
    Create, edit, and manage weekly shifts
  </p>
</Link>

        <Link
  href="/manager/employees"
  className="block rounded-3xl bg-white p-5 shadow hover:bg-gray-50"
>
  <p className="text-sm text-gray-500">Staff</p>
  <h2 className="mt-1 text-xl font-bold text-gray-900">
    Employee Management
  </h2>
  <p className="mt-2 text-sm text-gray-500">
    Add, edit, activate, and deactivate employees
  </p>
</Link>

        <div className="rounded-3xl bg-white p-5 shadow">
          <h2 className="text-lg font-bold text-gray-900">Employees</h2>

          <div className="mt-4 space-y-3">
            {employeeSummaries.length === 0 ? (
              <p className="text-sm text-gray-500">No employee shifts recorded yet.</p>
            ) : (
              employeeSummaries.map((employee) => (
                <div
                  key={employee.employeeId}
                  className="rounded-2xl bg-gray-50 p-4"
                >
                  <p className="font-bold text-gray-900">
                    {employee.employeeName}
                  </p>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                    <p>
                      <strong>{employee.hours.toFixed(2)}</strong> hrs
                    </p>

                    <p>
                      <strong>${employee.tips.toFixed(2)}</strong> tips
                    </p>

                    <p>
                      <strong>${employee.mileage.toFixed(2)}</strong> mileage
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow">
      <p className="text-sm text-gray-500">{title}</p>
      <h3 className="mt-1 text-2xl font-bold text-gray-900">{value}</h3>
    </div>
  );
}