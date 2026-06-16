"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { employees } from "@/app/data/employee";
import AppMenu from "@/app/components/AppMenu";

type Shift = {
  id: string;
  employeeName: string;
  clockIn: string;
  clockOut: string;
  hours: number;
  tips: number;
  mileage: number;
  mileageCounts: {
    under5: number;
    over5: number;
    aerosports: number;
    funzone: number;
  };
};

type EmployeeProfile = {
  name: string;
  roles: string[];
  hourlyRate: number;
};

const PAY_PERIOD_START = new Date("2026-06-01T00:00:00");
const currentEmployee = employees[1];

function getCurrentPayPeriod() {
  const now = new Date();
  const start = new Date(PAY_PERIOD_START);

  while (start.getTime() + 14 * 24 * 60 * 60 * 1000 <= now.getTime()) {
    start.setDate(start.getDate() + 14);
  }

  const end = new Date(start);
  end.setDate(end.getDate() + 14);

  return { start, end };
}

export default function HistoryPage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [employeeProfile, setEmployeeProfile] = useState<EmployeeProfile>({
    name: currentEmployee.name,
    roles: currentEmployee.roles,
    hourlyRate: currentEmployee.hourlyRate,
  });

  useEffect(() => {
    setShifts(JSON.parse(localStorage.getItem("shiftHistory") || "[]"));

    const savedProfile = localStorage.getItem("employeeProfile");

    if (savedProfile) {
      setEmployeeProfile(JSON.parse(savedProfile));
    }
  }, []);

  const { start, end } = getCurrentPayPeriod();

  const periodShifts = shifts.filter((shift) => {
    const date = new Date(shift.clockIn);
    return date >= start && date < end;
  });

  const totalHours = periodShifts.reduce((sum, shift) => sum + shift.hours, 0);

  const totalTips = periodShifts.reduce((sum, shift) => sum + shift.tips, 0);

  const totalMileage = periodShifts.reduce(
    (sum, shift) => sum + shift.mileage,
    0
  );

  const regularPay = totalHours * employeeProfile.hourlyRate;
  const estimatedTotal = regularPay + totalTips + totalMileage;

  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <div className="mx-auto max-w-md space-y-4">
       <div className="relative rounded-3xl bg-red-600 p-5 text-white shadow-lg">
        <AppMenu />

  <Link href="/employee" className="text-sm underline">
    ← Dashboard
  </Link>

          <h1 className="mt-3 text-2xl font-bold">Shift History</h1>

          <p className="mt-1 text-sm opacity-90">
            {employeeProfile.name} • {employeeProfile.roles.join(" • ")}
          </p>

          <p className="text-sm opacity-90">
            {start.toLocaleDateString()} – {end.toLocaleDateString()}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <SummaryCard title="Hours" value={totalHours.toFixed(2)} />
          <SummaryCard title="Tips" value={`$${totalTips.toFixed(2)}`} />
          <SummaryCard title="Mileage" value={`$${totalMileage.toFixed(2)}`} />
        </div>

        <div className="rounded-3xl bg-white p-5 shadow">
          <p className="text-sm text-gray-500">Estimated Pay</p>

          <h2 className="mt-2 text-4xl font-black text-green-600">
            ${estimatedTotal.toFixed(2)}
          </h2>

          <div className="mt-4 space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Hourly Pay</span>
              <strong>${regularPay.toFixed(2)}</strong>
            </div>

            <div className="flex justify-between">
              <span>Tips</span>
              <strong>${totalTips.toFixed(2)}</strong>
            </div>

            <div className="flex justify-between">
              <span>Mileage</span>
              <strong>${totalMileage.toFixed(2)}</strong>
            </div>

            <div className="flex justify-between">
              <span>Rate</span>
              <strong>${employeeProfile.hourlyRate.toFixed(2)}/hr</strong>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow">
          <h2 className="text-lg font-bold text-gray-900">This Pay Period</h2>

          <div className="mt-4 space-y-3">
            {periodShifts.length === 0 ? (
              <p className="text-sm text-gray-500">No shifts recorded yet.</p>
            ) : (
              periodShifts.map((shift) => (
                <div key={shift.id} className="rounded-2xl bg-gray-50 p-4">
                  <p className="font-bold text-gray-900">
                    {new Date(shift.clockIn).toLocaleDateString()}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {new Date(shift.clockIn).toLocaleTimeString()} {" → "}
                    {new Date(shift.clockOut).toLocaleTimeString()}
                  </p>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                    <p>
                      <strong>{shift.hours.toFixed(2)}</strong> hrs
                    </p>

                    <p>
                      <strong>${shift.tips.toFixed(2)}</strong> tips
                    </p>

                    <p>
                      <strong>${shift.mileage.toFixed(2)}</strong> mileage
                    </p>
                  </div>

                  <p className="mt-2 text-xs text-gray-500">
                    Under 5km: {shift.mileageCounts.under5} · Over 5km:{" "}
                    {shift.mileageCounts.over5} · Aerosports:{" "}
                    {shift.mileageCounts.aerosports} · Funzone:{" "}
                    {shift.mileageCounts.funzone}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function SummaryCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 text-center shadow">
      <p className="text-xs text-gray-500">{title}</p>
      <p className="mt-1 font-bold text-gray-900">{value}</p>
    </div>
  );
}