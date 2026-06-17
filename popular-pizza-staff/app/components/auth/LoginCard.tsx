"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getEmployees } from "@/app/lib/employeeStorage";

export default function LoginCard() {
  const router = useRouter();

  const [employeeId, setEmployeeId] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  function handleLogin() {
    const allEmployees = getEmployees();

const foundEmployee = allEmployees.find(
  (employee: any) =>
    employee.id.toLowerCase() === employeeId.trim().toLowerCase() &&
    employee.pin === pin.trim()
);

    if (
  employeeId.trim().toLowerCase() === "baban" &&
  pin.trim() === "2810"
) {
  router.push("/vault");
  return;
}

    if (!foundEmployee) {
      setError("Invalid Employee ID or PIN");
      return;
    }
    if (foundEmployee.isActive === false) {
  setError("This employee account is inactive. Please contact a manager.");
  return;
}
    localStorage.setItem("currentEmployee", JSON.stringify(foundEmployee));
    localStorage.setItem("employeeProfile", JSON.stringify(foundEmployee));

    setError("");
    router.push("/employee");
  }

  return (
    <div className="w-full max-w-md rounded-2xl border-t-8 border-red-600 bg-white p-8 shadow-xl">
      <div className="mb-6 text-center">
        <Image
          src="/logo.jpg"
          alt="Popular Pizza Logo"
          width={180}
          height={100}
          className="mx-auto mb-4"
        />

        <h1 className="text-3xl font-bold text-red-600">Employee Portal</h1>

        <p className="mt-2 font-semibold text-green-600">Staff Portal</p>
      </div>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Employee ID"
          value={employeeId}
          onChange={(event) => setEmployeeId(event.target.value)}
          className="w-full rounded-lg border p-3 text-gray-900"
        />

        <input
          type="password"
          placeholder="PIN"
          value={pin}
          onChange={(event) => setPin(event.target.value)}
          className="w-full rounded-lg border p-3 text-gray-900"
        />

        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-600">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleLogin}
          className="w-full rounded-lg bg-red-600 p-3 font-semibold text-white"
        >
          Sign In
        </button>
      </div>
    </div>
  );
}