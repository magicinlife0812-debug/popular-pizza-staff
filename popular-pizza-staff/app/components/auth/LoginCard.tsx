import Image from "next/image";

export default function LoginCard() {
  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border-t-8 border-red-600">
      <div className="text-center mb-6">
        <Image
          src="/logo.jpg"
          alt="Popular Pizza Logo"
          width={180}
          height={100}
          className="mx-auto mb-4"
        />

        <h1 className="text-3xl font-bold text-red-600">
          Employee Portal
        </h1>

        <p className="text-green-600 font-semibold mt-2">
          Staff Portal
        </p>
      </div>

      <div className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 border rounded-lg"
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 border rounded-lg"
        />

        <button className="w-full bg-red-600 text-white p-3 rounded-lg font-semibold">
          Sign In
        </button>
      </div>
    </div>
  );
}