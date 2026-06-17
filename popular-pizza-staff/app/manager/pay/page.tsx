"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AppMenu from "@/app/components/AppMenu";
import { getEmployees } from "@/app/lib/employeeStorage";

type Employee = {
  id: string;
  name: string;
  roles: string[];
  hourlyRate: number;
  canAccessManager: boolean;
  isActive?: boolean;
};

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

type EmployeePaySummary = {
  employee: Employee;
  shifts: Shift[];
  hours: number;
  tips: number;
  mileage: number;
  wages: number;
  total: number;
};

export default function ManagerPayPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [openEmployeeId, setOpenEmployeeId] = useState<string | null>(null);

  useEffect(() => {
    setEmployees(getEmployees());
    setShifts(JSON.parse(localStorage.getItem("shiftHistory") || "[]"));
  }, []);

  function formatTime(dateText: string) {
    return new Date(dateText).toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  const employeeSummaries: EmployeePaySummary[] = employees.map((employee) => {
    const employeeShifts = shifts.filter(
      (shift) =>
        shift.employeeId === employee.id ||
        shift.employeeName === employee.name
    );

    const hours = employeeShifts.reduce((sum, shift) => sum + shift.hours, 0);
    const tips = employeeShifts.reduce((sum, shift) => sum + shift.tips, 0);
    const mileage = employeeShifts.reduce(
      (sum, shift) => sum + shift.mileage,
      0
    );

    const wages = hours * employee.hourlyRate;
    const total = wages + tips + mileage;

    return {
      employee,
      shifts: employeeShifts,
      hours,
      tips,
      mileage,
      wages,
      total,
    };
  });

  const totalHours = employeeSummaries.reduce(
    (sum, employee) => sum + employee.hours,
    0
  );

  const totalTips = employeeSummaries.reduce(
    (sum, employee) => sum + employee.tips,
    0
  );

  const totalMileage = employeeSummaries.reduce(
    (sum, employee) => sum + employee.mileage,
    0
  );

  const totalPayroll = employeeSummaries.reduce(
    (sum, employee) => sum + employee.total,
    0
  );

  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <div className="mx-auto max-w-md space-y-4">
        <div className="relative rounded-3xl bg-red-600 p-5 text-white shadow-lg">
          <AppMenu />

          <Link href="/manager" className="text-sm underline">
            ← Manager Dashboard
          </Link>

          <h1 className="mt-3 text-2xl font-bold">Payroll</h1>

          <p className="text-sm opacity-90">
            Employee pay overview
          </p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow">
          <p className="text-sm text-gray-500">Total Estimated Payroll</p>

          <h2 className="mt-2 text-4xl font-black text-green-600">
            ${totalPayroll.toFixed(2)}
          </h2>

          <div className="mt-4 grid grid-cols-3 gap-3 text-sm text-gray-600">
            <div>
              <p className="text-xs text-gray-500">Hours</p>
              <strong>{totalHours.toFixed(2)}</strong>
            </div>

            <div>
              <p className="text-xs text-gray-500">Tips</p>
              <strong>${totalTips.toFixed(2)}</strong>
            </div>

            <div>
              <p className="text-xs text-gray-500">Mileage</p>
              <strong>${totalMileage.toFixed(2)}</strong>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow">
          <h2 className="text-lg font-bold text-gray-900">
            Employees
          </h2>

          <div className="mt-4 space-y-3">
            {employeeSummaries.length === 0 ? (
              <p className="text-sm text-gray-500">
                No employees found.
              </p>
            ) : (
              employeeSummaries.map((summary) => {
                const isOpen = openEmployeeId === summary.employee.id;

                return (
                  <div
                    key={summary.employee.id}
                    className="rounded-2xl bg-gray-50 p-4"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenEmployeeId(
                          isOpen ? null : summary.employee.id
                        )
                      }
                      className="w-full text-left"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bold text-gray-900">
                            {summary.employee.name}
                          </p>

                          <p className="text-sm text-gray-500">
                            {summary.hours.toFixed(2)} hrs •{" "}
                            {summary.shifts.length} shift
                            {summary.shifts.length === 1 ? "" : "s"}
                          </p>
                        </div>

                        <p className="text-xl font-black text-green-600">
                          ${summary.total.toFixed(2)}
                        </p>
                      </div>

                      <div className="mt-3 grid grid-cols-3 gap-2 text-sm text-gray-600">
                        <div>
                          <p className="text-xs text-gray-500">Wages</p>
                          <strong>${summary.wages.toFixed(2)}</strong>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">Tips</p>
                          <strong>${summary.tips.toFixed(2)}</strong>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">Mileage</p>
                          <strong>${summary.mileage.toFixed(2)}</strong>
                        </div>
                      </div>
                    </button>

                    {isOpen && (
                      <div className="mt-4 space-y-3 border-t pt-4">
                        {summary.shifts.length === 0 ? (
                          <p className="text-sm text-gray-500">
                            No completed shifts recorded for this employee.
                          </p>
                        ) : (
                          summary.shifts.map((shift) => {
                            const shiftWages =
                              shift.hours * summary.employee.hourlyRate;

                            const shiftTotal =
                              shiftWages + shift.tips + shift.mileage;

                            return (
                              <div
                                key={shift.id}
                                className="rounded-xl bg-white p-3 text-sm shadow-sm"
                              >
                                <p className="font-bold text-gray-900">
                                  {new Date(
                                    shift.clockIn
                                  ).toLocaleDateString()}
                                </p>

                                <p className="mt-1 text-gray-500">
                                  {formatTime(shift.clockIn)} →{" "}
                                  {formatTime(shift.clockOut)}
                                </p>

                                <div className="mt-3 space-y-1 text-gray-600">
                                  <div className="flex justify-between">
                                    <span>Hours</span>
                                    <strong>
                                      {shift.hours.toFixed(2)} hrs
                                    </strong>
                                  </div>

                                  <div className="flex justify-between">
                                    <span>Wages</span>
                                    <strong>
                                      ${shiftWages.toFixed(2)}
                                    </strong>
                                  </div>

                                  <div className="flex justify-between">
                                    <span>Tips</span>
                                    <strong>
                                      ${shift.tips.toFixed(2)}
                                    </strong>
                                  </div>

                                  <div className="flex justify-between">
                                    <span>Mileage</span>
                                    <strong>
                                      ${shift.mileage.toFixed(2)}
                                    </strong>
                                  </div>

                                  <div className="mt-2 flex justify-between border-t pt-2 text-gray-900">
                                    <span>Total</span>
                                    <strong>
                                      ${shiftTotal.toFixed(2)}
                                    </strong>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </main>
  );
}