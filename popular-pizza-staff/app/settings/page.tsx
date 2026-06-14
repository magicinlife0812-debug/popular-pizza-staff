"use client";

import Link from "next/link";
import { employee } from "@/app/data/employee";

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <div className="mx-auto max-w-md space-y-4">
        <div className="rounded-3xl bg-red-600 p-5 text-white shadow-lg">
          <Link href="/employee" className="text-sm underline">
            ← Dashboard
          </Link>

          <h1 className="mt-3 text-2xl font-bold">Settings</h1>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow">
          <p className="text-sm text-gray-500">Employee Name</p>
          <p className="mt-1 text-xl font-bold text-gray-900">
            {employee.name}
          </p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow">
          <p className="text-sm text-gray-500">Role</p>
          <p className="mt-1 text-xl font-bold text-gray-900">
            {employee.role}
          </p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow">
          <p className="text-sm text-gray-500">Hourly Rate</p>
          <p className="mt-1 text-xl font-bold text-gray-900">
            ${employee.hourlyRate.toFixed(2)}
          </p>
        </div>
      </div>
    </main>
  );
}