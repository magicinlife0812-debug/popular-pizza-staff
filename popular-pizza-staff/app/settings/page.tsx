"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AppMenu from "@/app/components/AppMenu";
import { updateSupabaseEmployee } from "@/app/lib/supabaseEmployees";

const availableRoles = ["Driver", "Kitchen", "Manager"];

type EmployeeProfile = {
    databaseId: string;
  id: string;
  pin: string;
  name: string;
  roles: string[];
  hourlyRate: number;
  canAccessManager: boolean;
  isActive?: boolean;
};

export default function SettingsPage() {
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);

  const [name, setName] = useState("");
  const [roles, setRoles] = useState<string[]>([]);
  const [hourlyRate, setHourlyRate] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedEmployee = localStorage.getItem("currentEmployee");

    if (savedEmployee) {
      const employee = JSON.parse(savedEmployee);

      setProfile(employee);
      setName(employee.name);
      setRoles(employee.roles ?? []);
      setHourlyRate(String(employee.hourlyRate ?? 0));
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

 async function handleSave() {
  if (!profile) return;

  const updatedProfile = {
  ...profile,
  name: name.trim(),
  roles,
  hourlyRate: Number(hourlyRate),
  canAccessManager: roles.includes("Manager"),
  isActive: profile.isActive !== false,
};

  await updateSupabaseEmployee(updatedProfile);

  localStorage.setItem("currentEmployee", JSON.stringify(updatedProfile));
  localStorage.setItem("employeeProfile", JSON.stringify(updatedProfile));

  setProfile(updatedProfile);
  setSaved(true);
}

  if (!profile) {
    return (
      <main className="min-h-screen bg-gray-100 p-4">
        <div className="mx-auto max-w-md rounded-3xl bg-white p-5 shadow">
          <p className="text-gray-500">Loading settings...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <div className="mx-auto max-w-md space-y-4">
        <div className="relative rounded-3xl bg-red-600 p-5 text-white shadow-lg">
          <AppMenu />

          <Link href="/employee" className="text-sm underline">
            ← Dashboard
          </Link>

          <h1 className="mt-3 text-2xl font-bold">Settings</h1>
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
                onChange={(event) => setName(event.target.value)}
                className="mt-1 w-full rounded-xl border p-3 text-gray-900"
              />
            </div>

            <div>
              <p className="text-sm text-gray-500">Roles</p>

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
                onChange={(event) => setHourlyRate(event.target.value)}
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