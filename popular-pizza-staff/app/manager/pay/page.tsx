"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AppMenu from "@/app/components/AppMenu";
import { getPayrollShifts } from "@/app/lib/supabasePayroll";
import {
  getPayrollPayments,
  markPayrollPaid,
  markPayrollUnpaid,
} from "@/app/lib/supabasePayrollPayments";

type PayrollShift = {
  id: string;
  employeeDatabaseId: string;
  employeeId: string;
  employeeName: string;
  hourlyRate: number;
  clockIn: string;
  clockOut: string;
  hours: number;
  tips: number;
  mileage: number;
};

type PayrollPayment = {
  id: string;
  employeeDatabaseId: string;
  employeeId: string;
  employeeName: string;
  periodStart: string;
  periodEnd: string;
  amount: number;
  status: string;
  paidAt: string | null;
};

type EmployeePayrollSummary = {
  employeeDatabaseId: string;
  employeeId: string;
  employeeName: string;
  hourlyRate: number;
  shifts: PayrollShift[];
  hours: number;
  tips: number;
  mileage: number;
  wages: number;
  total: number;
};

type PayPeriod = {
  key: string;
  start: Date;
  end: Date;
  shifts: PayrollShift[];
};

const PAY_PERIOD_START = new Date("2026-06-01T00:00:00");

function getPayPeriodForDate(date: Date) {
  const start = new Date(PAY_PERIOD_START);

  while (start.getTime() + 14 * 24 * 60 * 60 * 1000 <= date.getTime()) {
    start.setDate(start.getDate() + 14);
  }

  const end = new Date(start);
  end.setDate(end.getDate() + 14);

  return { start, end };
}

function formatDate(date: Date) {
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function formatDateForDatabase(date: Date) {
  return date.toISOString().split("T")[0];
}

function formatTime(dateText: string) {
  return new Date(dateText).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ManagerPayPage() {
  const [shifts, setShifts] = useState<PayrollShift[]>([]);
  const [payments, setPayments] = useState<PayrollPayment[]>([]);
  const [openPeriodKey, setOpenPeriodKey] = useState<string | null>(null);
  const [openEmployeeId, setOpenEmployeeId] = useState<string | null>(null);

  async function loadPayroll() {
    const payrollShifts = await getPayrollShifts();
    const payrollPayments = await getPayrollPayments();

    setShifts(payrollShifts as PayrollShift[]);
    setPayments(payrollPayments as PayrollPayment[]);
  }

  useEffect(() => {
    loadPayroll();
  }, []);

  const payPeriods = shifts.reduce<PayPeriod[]>((periods, shift) => {
    const shiftDate = new Date(shift.clockIn);
    const { start, end } = getPayPeriodForDate(shiftDate);
    const key = start.toISOString();

    const existingPeriod = periods.find((period) => period.key === key);

    if (existingPeriod) {
      existingPeriod.shifts.push(shift);
      return periods;
    }

    periods.push({
      key,
      start,
      end,
      shifts: [shift],
    });

    return periods;
  }, []);

  payPeriods.sort((a, b) => b.start.getTime() - a.start.getTime());

  const currentPeriodDates = getPayPeriodForDate(new Date());

  const currentPeriod =
    payPeriods.find(
      (period) => period.key === currentPeriodDates.start.toISOString()
    ) ?? {
      key: currentPeriodDates.start.toISOString(),
      start: currentPeriodDates.start,
      end: currentPeriodDates.end,
      shifts: [],
    };

  const displayedPeriods = [
    currentPeriod,
    ...payPeriods.filter((period) => period.key !== currentPeriod.key),
  ];

  function getEmployeeSummaries(periodShifts: PayrollShift[]) {
    const summaries = periodShifts.reduce<EmployeePayrollSummary[]>(
      (list, shift) => {
        const existingEmployee = list.find(
          (item) => item.employeeId === shift.employeeId
        );

        if (existingEmployee) {
          existingEmployee.shifts.push(shift);
          existingEmployee.hours += shift.hours;
          existingEmployee.tips += shift.tips;
          existingEmployee.mileage += shift.mileage;
          existingEmployee.wages += shift.hours * shift.hourlyRate;
          existingEmployee.total =
            existingEmployee.wages +
            existingEmployee.tips +
            existingEmployee.mileage;

          return list;
        }

        const wages = shift.hours * shift.hourlyRate;

        list.push({
          employeeDatabaseId: shift.employeeDatabaseId,
          employeeId: shift.employeeId,
          employeeName: shift.employeeName,
          hourlyRate: shift.hourlyRate,
          shifts: [shift],
          hours: shift.hours,
          tips: shift.tips,
          mileage: shift.mileage,
          wages,
          total: wages + shift.tips + shift.mileage,
        });

        return list;
      },
      []
    );

    summaries.sort((a, b) => a.employeeName.localeCompare(b.employeeName));

    return summaries;
  }

  function getPaymentStatus(employee: EmployeePayrollSummary, period: PayPeriod) {
    const periodStart = formatDateForDatabase(period.start);
    const periodEnd = formatDateForDatabase(period.end);

    const payment = payments.find(
      (item) =>
        item.employeeId === employee.employeeId &&
        item.periodStart === periodStart &&
        item.periodEnd === periodEnd
    );

    return payment?.status === "paid" ? "paid" : "unpaid";
  }

  function getPeriodTotals(period: PayPeriod) {
    const employeeSummaries = getEmployeeSummaries(period.shifts);

    const hours = employeeSummaries.reduce(
      (sum, employee) => sum + employee.hours,
      0
    );

    const tips = employeeSummaries.reduce(
      (sum, employee) => sum + employee.tips,
      0
    );

    const mileage = employeeSummaries.reduce(
      (sum, employee) => sum + employee.mileage,
      0
    );

    const wages = employeeSummaries.reduce(
      (sum, employee) => sum + employee.wages,
      0
    );

    const payroll = employeeSummaries.reduce(
      (sum, employee) => sum + employee.total,
      0
    );

    const unpaidCount = employeeSummaries.filter(
      (employee) => getPaymentStatus(employee, period) !== "paid"
    ).length;

    return {
      employeeSummaries,
      hours,
      tips,
      mileage,
      wages,
      payroll,
      unpaidCount,
    };
  }

  async function handleMarkPaid(employee: EmployeePayrollSummary, period: PayPeriod) {
    await markPayrollPaid({
      employeeDatabaseId: employee.employeeDatabaseId,
      periodStart: formatDateForDatabase(period.start),
      periodEnd: formatDateForDatabase(period.end),
      amount: employee.total,
    });

    await loadPayroll();
  }

  async function handleMarkUnpaid(
    employee: EmployeePayrollSummary,
    period: PayPeriod
  ) {
    await markPayrollUnpaid({
      employeeDatabaseId: employee.employeeDatabaseId,
      periodStart: formatDateForDatabase(period.start),
      periodEnd: formatDateForDatabase(period.end),
      amount: employee.total,
    });

    await loadPayroll();
  }

  function exportPeriodCsv(period: PayPeriod) {
  const totals = getPeriodTotals(period);

  const rows = totals.employeeSummaries.map((employee) => {
    const status = getPaymentStatus(employee, period);

    return [
      employee.employeeName,
      employee.hours.toFixed(2),
      employee.wages.toFixed(2),
      employee.tips.toFixed(2),
      employee.mileage.toFixed(2),
      employee.total.toFixed(2),
      status,
    ];
  });

  const csvContent = [
    ["Employee", "Hours", "Wages", "Tips", "Mileage", "Total", "Status"],
    ...rows,
  ]
    .map((row) => row.join(","))
    .join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;

  link.download = `payroll-${formatDateForDatabase(
    period.start
  )}-to-${formatDateForDatabase(period.end)}.csv`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <div className="mx-auto max-w-md space-y-4">
        <div className="relative rounded-3xl bg-red-600 p-5 text-white shadow-lg">
          <AppMenu />

          <Link href="/manager" className="text-sm underline">
            ← Manager Dashboard
          </Link>

          <h1 className="mt-3 text-2xl font-bold">Payroll</h1>

          <p className="text-sm opacity-90">Biweekly employee payroll</p>
        </div>

        <div className="space-y-3">
          {displayedPeriods.map((period, index) => {
            const totals = getPeriodTotals(period);
            const isOpen = openPeriodKey === period.key;
            const isCurrentPeriod = index === 0;

            return (
              <div key={period.key} className="rounded-3xl bg-white p-5 shadow">
                <button
                  type="button"
                  onClick={() => {
                    setOpenPeriodKey(isOpen ? null : period.key);
                    setOpenEmployeeId(null);
                  }}
                  className="w-full text-left"
                >
                  <p className="text-sm text-gray-500">
                    {isCurrentPeriod ? "Current Pay Period" : "Pay Period"}
                  </p>

                  <div className="mt-1 flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {formatDate(period.start)} – {formatDate(period.end)}
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        {totals.employeeSummaries.length} employee
                        {totals.employeeSummaries.length === 1 ? "" : "s"} •{" "}
                        {period.shifts.length} shift
                        {period.shifts.length === 1 ? "" : "s"}
                      </p>

                      <p
                        className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold ${
                          totals.unpaidCount === 0 &&
                          totals.employeeSummaries.length > 0
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {totals.employeeSummaries.length === 0
                          ? "No payroll yet"
                          : totals.unpaidCount === 0
                          ? "All Paid"
                          : `${totals.unpaidCount} Unpaid`}
                      </p>
                    </div>

                    <p className="text-2xl font-black text-green-600">
                      ${totals.payroll.toFixed(2)}
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-sm text-gray-600">
                    <div>
                      <p className="text-xs text-gray-500">Hours</p>
                      <strong>{totals.hours.toFixed(2)}</strong>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Tips</p>
                      <strong>${totals.tips.toFixed(2)}</strong>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Mileage</p>
                      <strong>${totals.mileage.toFixed(2)}</strong>
                    </div>
                  </div>
                </button>

                {isOpen && (
                  <div className="mt-4 space-y-3 border-t pt-4">
                   <button
                    type="button"
                    onClick={() => exportPeriodCsv(period)}
                    className="w-full rounded-xl bg-gray-900 p-3 font-bold text-white"
                    >
                Export Payroll CSV
                </button>
                //BABANTANVIR 
                    {totals.employeeSummaries.length === 0 ? (
                      <p className="text-sm text-gray-500">
                        No completed shifts in this pay period yet.
                      </p>
                    ) : (
                      totals.employeeSummaries.map((employee) => {
                        const employeeOpen =
                          openEmployeeId === employee.employeeId;

                        const status = getPaymentStatus(employee, period);
                        const isPaid = status === "paid";

                        return (
                          <div
                            key={employee.employeeId}
                            className="rounded-2xl bg-gray-50 p-4"
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setOpenEmployeeId(
                                  employeeOpen ? null : employee.employeeId
                                )
                              }
                              className="w-full text-left"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="font-bold text-gray-900">
                                    {employee.employeeName}
                                  </p>

                                  <p className="text-sm text-gray-500">
                                    {employee.hours.toFixed(2)} hrs •{" "}
                                    {employee.shifts.length} shift
                                    {employee.shifts.length === 1 ? "" : "s"}
                                  </p>

                                  <p
                                    className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold ${
                                      isPaid
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                    }`}
                                  >
                                    {isPaid ? "Paid" : "Unpaid"}
                                  </p>
                                </div>

                                <p className="text-xl font-black text-green-600">
                                  ${employee.total.toFixed(2)}
                                </p>
                              </div>

                              <div className="mt-3 grid grid-cols-3 gap-2 text-sm text-gray-600">
                                <div>
                                  <p className="text-xs text-gray-500">Wages</p>
                                  <strong>${employee.wages.toFixed(2)}</strong>
                                </div>

                                <div>
                                  <p className="text-xs text-gray-500">Tips</p>
                                  <strong>${employee.tips.toFixed(2)}</strong>
                                </div>

                                <div>
                                  <p className="text-xs text-gray-500">
                                    Mileage
                                  </p>
                                  <strong>
                                    ${employee.mileage.toFixed(2)}
                                  </strong>
                                </div>
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                isPaid
                                  ? handleMarkUnpaid(employee, period)
                                  : handleMarkPaid(employee, period)
                              }
                              className={`mt-4 w-full rounded-xl p-3 font-bold text-white ${
                                isPaid ? "bg-gray-900" : "bg-green-600"
                              }`}
                            >
                              {isPaid ? "Mark Unpaid" : "Mark Paid"}
                            </button>

                            {employeeOpen && (
                              <div className="mt-4 space-y-3 border-t pt-4">
                                {employee.shifts.map((shift) => {
                                  const shiftWages =
                                    shift.hours * shift.hourlyRate;

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
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}