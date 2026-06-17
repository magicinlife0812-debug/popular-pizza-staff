"use client";

import { useEffect, useState } from "react";
import AppMenu from "@/app/components/AppMenu";
import {
  clockInShift,
  clockOutShift,
  getActiveShift,
  updateActiveShift,
} from "@/app/lib/supabaseShifts";

const mileageRates = {
  under5: 1.5,
  over5: 2.5,
  aerosports: 1,
  funzone: 1,
};

type MileageType = "under5" | "over5" | "aerosports" | "funzone";

type EmployeeProfile = {
  databaseId: string;
  id: string;
  name: string;
  roles: string[];
  hourlyRate: number;
  canAccessManager: boolean;
};

export default function EmployeeDashboard() {
  const [employeeProfile, setEmployeeProfile] =
    useState<EmployeeProfile | null>(null);

  const [clockedIn, setClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<Date | null>(null);
  const [todayHours, setTodayHours] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const [tipEntries, setTipEntries] = useState<number[]>([]);
  const [tipInput, setTipInput] = useState("");
  const [showTipModal, setShowTipModal] = useState(false);
  const [showMileageModal, setShowMileageModal] = useState(false);
  const [hasLoadedSavedData, setHasLoadedSavedData] = useState(false);

  const [mileageCounts, setMileageCounts] = useState({
    under5: 0,
    over5: 0,
    aerosports: 0,
    funzone: 0,
  });

  const totalTips = tipEntries.reduce((sum, tip) => sum + tip, 0);
  const lastTip = tipEntries[tipEntries.length - 1];

  const totalMileage =
    mileageCounts.under5 * mileageRates.under5 +
    mileageCounts.over5 * mileageRates.over5 +
    mileageCounts.aerosports * mileageRates.aerosports +
    mileageCounts.funzone * mileageRates.funzone;

  useEffect(() => {
    async function loadEmployeeAndShift() {
      const savedEmployee = localStorage.getItem("currentEmployee");

      if (!savedEmployee) return;

      const employee = JSON.parse(savedEmployee);
      setEmployeeProfile(employee);

      const activeShift = await getActiveShift(employee.databaseId);

      if (activeShift) {
        setClockedIn(true);
        setClockInTime(new Date(activeShift.clock_in));
        setTipEntries(activeShift.tip_entries ?? []);
        setMileageCounts(
          activeShift.mileage_counts ?? {
            under5: 0,
            over5: 0,
            aerosports: 0,
            funzone: 0,
          }
        );
      }

      setHasLoadedSavedData(true);
    }

    loadEmployeeAndShift();
  }, []);

  useEffect(() => {
    if (!clockedIn || !clockInTime) return;

    const timer = setInterval(() => {
      const seconds = Math.floor((Date.now() - clockInTime.getTime()) / 1000);
      setElapsedSeconds(seconds);
    }, 1000);

    return () => clearInterval(timer);
  }, [clockedIn, clockInTime]);

  useEffect(() => {
    if (!hasLoadedSavedData || !employeeProfile || !clockedIn) return;

    updateActiveShift({
      employeeDatabaseId: employeeProfile.databaseId,
      tipEntries,
      mileageCounts,
    });
  }, [hasLoadedSavedData, employeeProfile, clockedIn, tipEntries, mileageCounts]);

  function updateMileage(type: MileageType, change: number) {
    setMileageCounts((prev) => ({
      ...prev,
      [type]: Math.max(0, prev[type] + change),
    }));
  }

  async function handleClockButton() {
    if (!employeeProfile) return;

    if (!clockedIn) {
      await clockInShift({
        employeeDatabaseId: employeeProfile.databaseId,
      });

      const activeShift = await getActiveShift(employeeProfile.databaseId);

      if (activeShift) {
        setClockedIn(true);
        setClockInTime(new Date(activeShift.clock_in));
        setElapsedSeconds(0);
      }

      return;
    }

    const activeShift = await getActiveShift(employeeProfile.databaseId);

    if (activeShift) {
      const hoursWorked = await clockOutShift({
        activeShift,
        employeeDatabaseId: employeeProfile.databaseId,
        totalTips,
        totalMileage,
        mileageCounts,
      });

      setTodayHours((prev) => prev + Number(hoursWorked ?? 0));

      setTipEntries([]);
      setMileageCounts({
        under5: 0,
        over5: 0,
        aerosports: 0,
        funzone: 0,
      });
    }

    setClockedIn(false);
    setClockInTime(null);
    setElapsedSeconds(0);
  }

  if (!employeeProfile) {
    return (
      <main className="min-h-screen bg-gray-100 p-4">
        <div className="mx-auto max-w-md rounded-3xl bg-white p-5 shadow">
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <div className="mx-auto max-w-md space-y-4">
        <div className="relative rounded-3xl bg-red-600 p-5 text-white shadow-lg">
          <AppMenu />

          <p className="text-sm opacity-90">Popular Pizza Staff Portal</p>

          <h1 className="mt-1 text-2xl font-bold">
            Welcome back, {employeeProfile.name} 👋
          </h1>

          <p className="mt-2 text-sm font-medium text-red-100">
            {employeeProfile.roles.join(" • ")} • $
            {employeeProfile.hourlyRate.toFixed(2)}/hr
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6 text-center shadow">
          <p className="text-sm font-medium text-gray-500">Current Status</p>

          <h2
            className={`mt-2 text-4xl font-black ${
              clockedIn ? "text-green-600" : "text-red-600"
            }`}
          >
            {clockedIn ? "Clocked In" : "Clocked Out"}
          </h2>

          {clockInTime && (
            <p className="mt-2 text-sm text-gray-500">
              Started: {clockInTime.toLocaleTimeString()}
            </p>
          )}

          {clockedIn && (
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {Math.floor(elapsedSeconds / 3600)}h{" "}
              {Math.floor((elapsedSeconds % 3600) / 60)}m{" "}
              {elapsedSeconds % 60}s
            </p>
          )}

          <button
            type="button"
            onClick={handleClockButton}
            className={`mt-6 w-full rounded-2xl p-4 text-lg font-bold !text-white shadow ${
              clockedIn
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {clockedIn ? "Clock Out" : "Clock In"}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <StatCard title="Today" value={`${todayHours.toFixed(2)} hrs`} />
          <StatCard title="This Week" value={`${todayHours.toFixed(2)} hrs`} />

          <div className="rounded-3xl bg-white p-5 shadow">
            <div className="flex items-start justify-between">
              <p className="text-sm text-gray-500">Tips</p>

              <button
                type="button"
                onClick={() => setShowTipModal(true)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-lg font-bold !text-white"
              >
                +
              </button>
            </div>

            <h3 className="mt-4 truncate text-2xl font-bold text-gray-900">
              ${totalTips.toFixed(2)}
            </h3>

            {tipEntries.length > 0 && (
              <div className="mt-3 flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2">
                <span className="truncate text-sm font-semibold text-green-600">
                  Last: +${lastTip.toFixed(2)}
                </span>

                <button
                  type="button"
                  onClick={() => setTipEntries((prev) => prev.slice(0, -1))}
                  className="ml-2 font-bold text-red-500"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          <div className="rounded-3xl bg-white p-5 shadow">
            <div className="flex items-start justify-between">
              <p className="text-sm text-gray-500">Mileage</p>

              <button
                type="button"
                onClick={() => setShowMileageModal(true)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-lg font-bold !text-white"
              >
                +
              </button>
            </div>

            <h3 className="mt-4 text-2xl font-bold text-gray-900">
              ${totalMileage.toFixed(2)}
            </h3>

            <p className="mt-3 text-xs text-gray-500">
              {mileageCounts.under5 +
                mileageCounts.over5 +
                mileageCounts.aerosports +
                mileageCounts.funzone}{" "}
              deliveries
            </p>
          </div>
        </div>
      </div>

      {showTipModal && (
        <Modal title="Add Tip" onClose={() => setShowTipModal(false)}>
          <input
            type="number"
            step="0.01"
            placeholder="Enter amount"
            value={tipInput}
            onChange={(event) => setTipInput(event.target.value)}
            className="mt-4 w-full rounded-xl border border-gray-300 p-3 text-lg text-gray-900"
          />

          <button
            type="button"
            onClick={() => {
              const amount = Number(tipInput);

              if (!Number.isNaN(amount) && amount > 0) {
                setTipEntries((prev) => [...prev, amount]);
                setTipInput("");
                setShowTipModal(false);
              }
            }}
            className="mt-4 w-full rounded-xl bg-red-600 p-3 font-bold !text-white"
          >
            Save Tip
          </button>
        </Modal>
      )}

      {showMileageModal && (
        <Modal title="Add Mileage" onClose={() => setShowMileageModal(false)}>
          <div className="mt-4 space-y-2">
            <MileageCounter
              label="Under 5km"
              rate={mileageRates.under5}
              count={mileageCounts.under5}
              onMinus={() => updateMileage("under5", -1)}
              onPlus={() => updateMileage("under5", 1)}
            />

            <MileageCounter
              label="Over 5km"
              rate={mileageRates.over5}
              count={mileageCounts.over5}
              onMinus={() => updateMileage("over5", -1)}
              onPlus={() => updateMileage("over5", 1)}
            />

            <MileageCounter
              label="Aerosports"
              rate={mileageRates.aerosports}
              count={mileageCounts.aerosports}
              onMinus={() => updateMileage("aerosports", -1)}
              onPlus={() => updateMileage("aerosports", 1)}
            />

            <MileageCounter
              label="Funzone"
              rate={mileageRates.funzone}
              count={mileageCounts.funzone}
              onMinus={() => updateMileage("funzone", -1)}
              onPlus={() => updateMileage("funzone", 1)}
            />
          </div>

          <div className="mt-5 rounded-2xl bg-gray-100 p-4">
            <p className="text-sm text-gray-500">Mileage Total</p>
            <p className="text-2xl font-bold text-gray-900">
              ${totalMileage.toFixed(2)}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowMileageModal(false)}
            className="mt-4 w-full rounded-xl bg-red-600 p-3 font-bold !text-white"
          >
            Done
          </button>
        </Modal>
      )}
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

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>

        {children}

        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full rounded-xl border p-3 font-bold text-gray-700"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function MileageCounter({
  label,
  rate,
  count,
  onMinus,
  onPlus,
}: {
  label: string;
  rate: number;
  count: number;
  onMinus: () => void;
  onPlus: () => void;
}) {
  return (
    <div className="rounded-2xl bg-gray-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-gray-900">{label}</p>
          <p className="text-sm text-gray-500">${rate.toFixed(2)} each</p>
          <p className="mt-2 text-sm font-bold text-green-600">
            ${(count * rate).toFixed(2)}
          </p>
        </div>

        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={onMinus}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-xl font-bold text-gray-700"
          >
            −
          </button>

          <span className="w-10 text-center text-xl font-bold text-gray-900">
            {count}
          </span>

          <button
            type="button"
            onClick={onPlus}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-xl font-bold !text-white"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}