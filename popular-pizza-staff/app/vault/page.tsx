"use client";

import Link from "next/link";

export default function VaultPage() {
  return (
    <main className="min-h-screen bg-red-50 p-4">
      <div className="mx-auto max-w-md space-y-4">
        <div className="rounded-3xl bg-red-600 p-6 text-white shadow-lg">
          <h1 className="text-3xl font-bold">For Baban ❤️</h1>
          <p className="mt-2 text-sm opacity-90">
            A little secret hidden in plain sight.
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow">
          <p className="text-lg leading-8 text-gray-800">
            My Baban,
            <br />
            <br />
            This little corner of the app is only for you. Hidden inside all
            the work, schedules, payroll, and pizza chaos, there is still one
            place that belongs only to us.
            <br />
            <br />
            No matter how busy life gets, no matter how far we are, you are
            always my favourite thought, my safest feeling, and my happiest
            dream.
            <br />
            <br />
            One day, when all of this becomes just a funny story, I hope this
            reminds you that even while building apps, chasing dreams, and
            figuring life out, my heart was always finding little ways to come
            back to you.
            <br />
            <br />
            I LOVE YOU ❤️
            
            <br />
            Always yours,
            <br />
            Tanvir
          </p>
        </div>

        <Link
          href="/"
          className="block rounded-2xl bg-red-600 p-4 text-center font-bold text-white"
        >
          Close Vault
        </Link>
      </div>
    </main>
  );
}