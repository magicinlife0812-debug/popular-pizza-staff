"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Employee = {
  name: string;
  canAccessManager: boolean;
};

export default function AppMenu() {
  const [showMenu, setShowMenu] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    const savedEmployee = localStorage.getItem("currentEmployee");

    if (savedEmployee) {
      setCurrentEmployee(JSON.parse(savedEmployee));
    }
  }, []);

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        onClick={() => setShowMenu(!showMenu)}
        className="absolute right-4 top-4 z-30 flex h-12 w-12 items-center justify-center rounded-xl hover:bg-red-700"
      >
        <span className="pointer-events-none text-4xl leading-none text-white">
          ☰
        </span>
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />

          <div className="absolute right-5 top-16 z-20 w-48 rounded-2xl bg-white p-3 text-gray-900 shadow-xl">
            <Link href="/employee" className="block rounded-xl p-3 hover:bg-gray-100">
              Dashboard
            </Link>

            <Link href="/schedule" className="block rounded-xl p-3 hover:bg-gray-100">
              Schedule
            </Link>

            <Link href="/history" className="block rounded-xl p-3 hover:bg-gray-100">
              Shift History
            </Link>

            <Link href="/pay" className="block rounded-xl p-3 hover:bg-gray-100">
              Pay History
            </Link>

            <Link href="/settings" className="block rounded-xl p-3 hover:bg-gray-100">
              Settings
            </Link>

            {currentEmployee?.canAccessManager && (
              <>
                <Link href="/manager" className="block rounded-xl p-3 hover:bg-gray-100">
                  Manager Dashboard
                </Link>

              </>
            )}
          </div>
        </>
      )}
    </>
  );
}