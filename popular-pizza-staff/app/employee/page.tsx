"use client";

import { useEffect, useState } from "react";

export default function EmployeeDashboard() {
  const [clockedIn, setClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<Date | null>(null);
  const [todayHours, setTodayHours] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [tipEntries, setTipEntries] = useState<number[]>([]);
  const [tipInput, setTipInput] = useState("");
  const [showTipModal, setShowTipModal] = useState(false);

  const totalTips = tipEntries.reduce((sum, tip) => sum + tip, 0);
  const lastTip = tipEntries[tipEntries.length - 1];

  function handleClockButton() {
    if (!clockedIn) {
      setClockedIn(true);
      setClockInTime(new Date());
      setElapsedSeconds(0);
    } else {
      if (clockInTime) {
        const clockOutTime = new Date();
        const millisecondsWorked =
          clockOutTime.getTime() - clockInTime.getTime();

        const hoursWorked = millisecondsWorked / (1000 * 60 * 60);
        setTodayHours((prev) => prev + hoursWorked);
      }

      setClockedIn(false);
      setClockInTime(null);
    }
  }

  useEffect(() => {
    if (!clockedIn || !clockInTime) return;

    const timer = setInterval(() => {
      const now = new Date();
      const seconds = Math.floor(
        (now.getTime() - clockInTime.getTime()) / 1000
      );

      setElapsedSeconds(seconds);
    }, 1000);

    return () => clearInterval(timer);
  }, [clockedIn, clockInTime]);

  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <div className="mx-auto max-w-md space-y-4">
        <div className="rounded-3xl bg-red-600 p-5 text-white shadow-lg">
          <p className="text-sm opacity-90">Popular Pizza Staff Portal</p>
          <h1 className="mt-1 text-2xl font-bold">
            Welcome back, Tanvir 👋
          </h1>
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
          <div className="rounded-3xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">Today</p>
            <h3 className="mt-1 text-2xl font-bold text-gray-900">
              {todayHours.toFixed(2)} hrs
            </h3>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">This Week</p>
            <h3 className="mt-1 text-2xl font-bold text-gray-900">
              {todayHours.toFixed(2)} hrs
            </h3>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow">
            <div className="flex items-start justify-between">
              <p className="text-sm text-gray-500">Tips</p>

              <button
                type="button"
                onClick={() => setShowTipModal(true)}
                className="flex h-8 w-8 min-h-8 min-w-8 items-center justify-center rounded-full bg-red-600 text-lg font-bold !text-white shadow hover:bg-red-700"
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
                  onClick={() => {
                    setTipEntries((prev) => prev.slice(0, -1));
                  }}
                  className="ml-2 font-bold text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          <div className="rounded-3xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">Mileage</p>
            <h3 className="mt-1 text-2xl font-bold text-gray-900">0 km</h3>
          </div>
        </div>
      </div>

      {showTipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900">Add Tip</h2>

            <input
              type="number"
              step="0.01"
              placeholder="Enter amount"
              value={tipInput}
              onChange={(e) => setTipInput(e.target.value)}
              className="mt-4 w-full rounded-xl border border-gray-300 p-3 text-lg text-gray-900"
            />

            <button
              type="button"
              onClick={() => {
                const amount = Number(tipInput);

                if (!isNaN(amount) && amount > 0) {
                  setTipEntries((prev) => [...prev, amount]);
                  setTipInput("");
                  setShowTipModal(false);
                }
              }}
              className="mt-4 w-full rounded-xl bg-red-600 p-3 font-bold !text-white"
            >
              Save Tip
            </button>

            <button
              type="button"
              onClick={() => {
                setTipInput("");
                setShowTipModal(false);
              }}
              className="mt-3 w-full rounded-xl border p-3 font-bold text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </main>
  );
}