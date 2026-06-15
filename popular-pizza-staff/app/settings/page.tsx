"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { employees } from "@/app/data/employee";

const availableRoles = ["Driver", "Kitchen", "Manager"];

export default function SettingsPage() {
  const [name, setName] = useState(employees[1].name);
  const [roles, setRoles] = useState<string[]>(employees[1].roles);
  const [hourlyRate, setHourlyRate] = useState(
    employees[1].hourlyRate.toString()
  );
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedProfile = localStorage.getItem("employeeProfile");

    if (savedProfile) {
      const profile = JSON.parse(savedProfile);

      setName(profile.name ?? employee.name);
      setRoles(profile.roles ?? ["Driver"]);
      setHourlyRate(
        String(profile.hourlyRate ?? employee.hourlyRate)
      );

      setSaved(true);
    }
  }, []);

  function toggleRole(role: string) {
    setRoles((prev) =>
      prev.includes(role)
        ? prev.filter((item) => item !== role)
        : [...prev, role]
    );
  }

  function handleSave() {
    const profile = {
      name,
      roles,
      hourlyRate: Number(hourlyRate),
    };

    localStorage.setItem(
      "employeeProfile",
      JSON.stringify(profile)
    );

    setSaved(true);
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <div className="mx-auto max-w-md space-y-4">
        <div className="rounded-3xl bg-red-600 p-5 text-white shadow-lg">
          <Link href="/employee" className="text-sm underline">
            ← Dashboard
          </Link>

          <h1 className="mt-3 text-2xl font-bold">
            Settings
          </h1>
        </div>

        {saved ? (
          <div className="rounded-3xl bg-white p-5 shadow">
            <p className="text-sm font-bold text-green-600">
              Profile Saved
            </p>

            <h2 className="mt-3 text-2xl font-bold text-gray-900">
              {name}
            </h2>

            <p className="mt-2 text-gray-600">
              {roles.join(" • ")}
            </p>

            <p className="mt-1 text-gray-600">
              ${Number(hourlyRate).toFixed(2)}/hr
            </p>

            <button
              type="button"
              onClick={() => setSaved(false)}
              className="mt-5 w-full rounded-xl bg-red-600 p-3 font-bold !text-white"
            >
              Edit Profile
            </button>
          </div>
        ) : (
          <div className="rounded-3xl bg-white p-5 shadow space-y-4">
            <div>
              <label className="text-sm text-gray-500">
                Employee Name
              </label>

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-xl border p-3 text-gray-900"
              />
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Roles
              </p>

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
                    />

                    <span>{role}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-500">
                Hourly Rate
              </label>

              <input
                type="number"
                step="0.01"
                value={hourlyRate}
                onChange={(e) =>
                  setHourlyRate(e.target.value)
                }
                className="mt-1 w-full rounded-xl border p-3 text-gray-900"
              />
            </div>

            <button
              type="button"
              onClick={handleSave}
              className="w-full rounded-xl bg-red-600 p-3 font-bold !text-white"
            >
              Save Settings
            </button>
          </div>
        )}
      </div>
    </main>
  );
}