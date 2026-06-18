"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AppMenu from "@/app/components/AppMenu";
import { getShiftHistory } from "@/app/lib/supabaseShiftHistory";

type Employee = {
  id: string;
  name: string;
  roles: string[];
  hourlyRate: number;
  canAccessManager: boolean;
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

type PayPeriod = {
  key: string;
  start: Date;
  end: Date;
  shifts: Shift[];
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

function formatTime(dateText: string) {
  return new Date(dateText).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function calculateShiftTotal(shift: Shift, hourlyRate: number) {
  return shift.hours * hourlyRate + shift.tips + shift.mileage;
}

export default function PayHistoryPage() {
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [openPeriodKey, setOpenPeriodKey] = useState<string | null>(null);

  useEffect(() => {
  async function loadPayHistory() {
    const savedEmployee = localStorage.getItem("currentEmployee");

    if (!savedEmployee) return;

    const employee = JSON.parse(savedEmployee);
    setCurrentEmployee(employee);

    const allShifts = await getShiftHistory();

    setShifts(
      allShifts.filter((shift: Shift) => shift.employeeId === employee.id)
    );
  }

  loadPayHistory();
}, []);

 const employeeShifts = shifts;

  const payPeriods = employeeShifts.reduce<PayPeriod[]>((periods, shift) => {
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

  function getPeriodTotals(period: PayPeriod) {
    const hourlyRate = currentEmployee?.hourlyRate ?? 0;

    const hours = period.shifts.reduce((sum, shift) => sum + shift.hours, 0);
    const tips = period.shifts.reduce((sum, shift) => sum + shift.tips, 0);
    const mileage = period.shifts.reduce(
      (sum, shift) => sum + shift.mileage,
      0
    );
    const hourlyPay = hours * hourlyRate;
    const estimatedPay = hourlyPay + tips + mileage;

    return {
      hours,
      tips,
      mileage,
      hourlyPay,
      estimatedPay,
    };
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <div className="mx-auto max-w-md space-y-4">
        <div className="relative rounded-3xl bg-red-600 p-5 text-white shadow-lg">
          <AppMenu />

          <Link href="/employee" className="text-sm underline">
            ← Dashboard
          </Link>

          <h1 className="mt-3 text-2xl font-bold">Pay History</h1>

          <p className="text-sm opacity-90">
            Biweekly estimated earnings
          </p>
        </div>

        <div className="space-y-3">
          {displayedPeriods.map((period, index) => {
            const totals = getPeriodTotals(period);
            const isOpen = openPeriodKey === period.key;
            const isCurrentPeriod = index === 0;

            return (
              <div
                key={period.key}
                className="rounded-3xl bg-white p-5 shadow"
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenPeriodKey(isOpen ? null : period.key)
                  }
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
                        {period.shifts.length} completed shift
                        {period.shifts.length === 1 ? "" : "s"}
                      </p>
                    </div>

                    <p className="text-2xl font-black text-green-600">
                      ${totals.estimatedPay.toFixed(2)}
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
                    {period.shifts.length === 0 ? (
                      <p className="text-sm text-gray-500">
                        No shifts recorded in this pay period yet.
                      </p>
                    ) : (
                      period.shifts.map((shift) => {
                        const hourlyRate = currentEmployee?.hourlyRate ?? 0;
                        const shiftHourlyPay = shift.hours * hourlyRate;
                        const shiftTotal = calculateShiftTotal(
                          shift,
                          hourlyRate
                        );

                        return (
                          <div
                            key={shift.id}
                            className="rounded-2xl bg-gray-50 p-4"
                          >
                            <p className="font-bold text-gray-900">
                              {new Date(shift.clockIn).toLocaleDateString()}
                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                              {formatTime(shift.clockIn)} →{" "}
                              {formatTime(shift.clockOut)}
                            </p>

                            <div className="mt-3 space-y-1 text-sm text-gray-600">
                              <div className="flex justify-between">
                                <span>Hours</span>
                                <strong>{shift.hours.toFixed(2)} hrs</strong>
                              </div>

                              <div className="flex justify-between">
                                <span>Hourly Pay</span>
                                <strong>${shiftHourlyPay.toFixed(2)}</strong>
                              </div>

                              <div className="flex justify-between">
                                <span>Tips</span>
                                <strong>${shift.tips.toFixed(2)}</strong>
                              </div>

                              <div className="flex justify-between">
                                <span>Mileage</span>
                                <strong>${shift.mileage.toFixed(2)}</strong>
                              </div>

                              <div className="mt-2 flex justify-between border-t pt-2 text-gray-900">
                                <span>Total</span>
                                <strong>${shiftTotal.toFixed(2)}</strong>
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
          })}
        </div>
      </div>
    </main>
  );
}