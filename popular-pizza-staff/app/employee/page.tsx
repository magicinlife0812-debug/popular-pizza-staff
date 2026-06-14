"use client";

import { useState } from "react";

export default function EmployeeDashboard() {
  const [clockedIn, setClockedIn] = useState(false);

  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <div className="mx-auto max-w-md space-y-4">
        <div className="rounded-3xl bg-red-600 p-5 text-white shadow-lg">
          <p className="text-sm opacity-90">Popular Pizza Staff Portal</p>
          <h1 className="mt-1 text-2xl font-bold">Welcome back, Tanvir 👋</h1>
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

          <button
            onClick={() => setClockedIn(!clockedIn)}
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
            <h3 className="mt-1 text-2xl font-bold text-gray-900">0.0 hrs</h3>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">This Week</p>
            <h3 className="mt-1 text-2xl font-bold text-gray-900">0.0 hrs</h3>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">Tips</p>
            <h3 className="mt-1 text-2xl font-bold text-gray-900">$0</h3>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">Mileage</p>
            <h3 className="mt-1 text-2xl font-bold text-gray-900">0 km</h3>
          </div>
        </div>
      </div>
    </main>
  );
}