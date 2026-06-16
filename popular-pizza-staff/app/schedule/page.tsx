"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getEmployees } from "@/app/lib/employeeStorage";
import {
  addScheduleShift,
  getScheduleShifts,
  ScheduleShift,
} from "@/app/lib/scheduleStorage";

type Employee = {
  id: string;
  name: string;
  roles: string[];
  hourlyRate: number;
  canAccessManager: boolean;
  isActive?: boolean;
};

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function SchedulePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<ScheduleShift[]>([]);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);

  const [showAddShift, setShowAddShift] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [day, setDay] = useState("Mon");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  useEffect(() => {
    const savedEmployee = localStorage.getItem("currentEmployee");

    if (savedEmployee) {
      setCurrentEmployee(JSON.parse(savedEmployee));
    }

    setEmployees(getEmployees().filter((employee: Employee) => employee.isActive !== false));
    setShifts(getScheduleShifts());
  }, []);

  function calculateHours(start: string, end: string) {
    if (!start || !end) return 0;

    const [startHour, startMinute] = start.split(":").map(Number);
    const [endHour, endMinute] = end.split(":").map(Number);

    const startTotal = startHour * 60 + startMinute;
    const endTotal = endHour * 60 + endMinute;

    return Math.max(0, (endTotal - startTotal) / 60);
  }

  function getEmployeeHours(employeeId: string) {
    return shifts
      .filter((shift) => shift.employeeId === employeeId)
      .reduce((sum, shift) => sum + calculateHours(shift.startTime, shift.endTime), 0);
  }

  function handleAddShift() {
    const employee = employees.find((item) => item.id === selectedEmployeeId);

    if (!employee || !startTime || !endTime) return;

    const newShift: ScheduleShift = {
      id: crypto.randomUUID(),
      employeeId: employee.id,
      employeeName: employee.name,
      date: day,
      startTime,
      endTime,
      status: "scheduled",
    };

    addScheduleShift(newShift);
    setShifts(getScheduleShifts());

    setSelectedEmployeeId("");
    setDay("Mon");
    setStartTime("");
    setEndTime("");
    setShowAddShift(false);
  }

  const totalLaborHours = employees.reduce(
    (sum, employee) => sum + getEmployeeHours(employee.id),
    0
  );

  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <div className="mx-auto max-w-md space-y-4">
        <div className="rounded-3xl bg-red-600 p-5 text-white shadow-lg">
          <Link href="/employee" className="text-sm underline">
            ← Dashboard
          </Link>

          <h1 className="mt-3 text-2xl font-bold">Schedule</h1>
          <p className="text-sm opacity-90">Weekly team schedule</p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow">
          <p className="text-sm text-gray-500">Total Labor Hours</p>
          <h2 className="mt-1 text-3xl font-black text-gray-900">
            {totalLaborHours.toFixed(1)} hrs
          </h2>
        </div>

        {currentEmployee?.canAccessManager && (
          <div className="rounded-3xl bg-white p-5 shadow">
            {!showAddShift ? (
              <button
                type="button"
                onClick={() => setShowAddShift(true)}
                className="w-full rounded-xl bg-red-600 p-3 font-bold text-white"
              >
                + Add Shift
              </button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900">Add Shift</h2>

                  <button
                    type="button"
                    onClick={() => setShowAddShift(false)}
                    className="text-sm font-semibold text-red-600"
                  >
                    Cancel
                  </button>
                </div>

                <select
                  value={selectedEmployeeId}
                  onChange={(event) => setSelectedEmployeeId(event.target.value)}
                  className="w-full rounded-xl border p-3 text-gray-900"
                >
                  <option value="">Select Employee</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name}
                    </option>
                  ))}
                </select>

                <select
                  value={day}
                  onChange={(event) => setDay(event.target.value)}
                  className="w-full rounded-xl border p-3 text-gray-900"
                >
                  {days.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>

                <input
                  type="time"
                  value={startTime}
                  onChange={(event) => setStartTime(event.target.value)}
                  className="w-full rounded-xl border p-3 text-gray-900"
                />

                <input
                  type="time"
                  value={endTime}
                  onChange={(event) => setEndTime(event.target.value)}
                  className="w-full rounded-xl border p-3 text-gray-900"
                />

                <button
                  type="button"
                  onClick={handleAddShift}
                  className="w-full rounded-xl bg-red-600 p-3 font-bold text-white"
                >
                  Save Shift
                </button>
              </div>
            )}
          </div>
        )}

        <div className="rounded-3xl bg-white p-5 shadow">
          <h2 className="text-lg font-bold text-gray-900">Weekly Hours</h2>

          <div className="mt-4 space-y-3">
            {employees.map((employee) => (
              <div
                key={employee.id}
                className={`rounded-2xl p-4 ${
                  employee.id === currentEmployee?.id
                    ? "bg-red-50 ring-2 ring-red-200"
                    : "bg-gray-50"
                }`}
              >
                <div className="flex justify-between">
                  <p className="font-bold text-gray-900">{employee.name}</p>
                  <p className="font-bold text-green-600">
                    {getEmployeeHours(employee.id).toFixed(1)} hrs
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow">
          <h2 className="text-lg font-bold text-gray-900">Week View</h2>

          <div className="mt-4 space-y-4">
            {days.map((item) => {
              const dayShifts = shifts.filter((shift) => shift.date === item);

              return (
                <div key={item} className="rounded-2xl bg-gray-50 p-4">
                  <h3 className="font-bold text-gray-900">{item}</h3>

                  <div className="mt-3 space-y-2">
                    {dayShifts.length === 0 ? (
                      <p className="text-sm text-gray-500">No shifts yet.</p>
                    ) : (
                      dayShifts.map((shift) => (
                        <div
                          key={shift.id}
                          className={`rounded-xl bg-white p-3 text-sm shadow-sm ${
                            shift.employeeId === currentEmployee?.id
                              ? "ring-2 ring-red-300"
                              : ""
                          }`}
                        >
                          <p className="font-bold text-gray-900">
                            {shift.employeeName}
                          </p>

                          <p className="text-gray-500">
                            {shift.startTime} - {shift.endTime}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}