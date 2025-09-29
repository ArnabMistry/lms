import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col h-screen items-center justify-center bg-darkBg gap-6">
      <h1 className="neon-text text-5xl font-extrabold mb-8">
        Last Man Standing 3.0 🚀
      </h1>

      <nav className="flex flex-col gap-4 text-lg">
        <Link
          href="/teams"
          className="px-6 py-3 rounded-lg bg-neonBlue text-darkBg font-bold hover:scale-105 transition-transform"
        >
          Teams
        </Link>
        <Link
          href="/dashboard"
          className="px-6 py-3 rounded-lg bg-neonPurple text-white font-bold hover:scale-105 transition-transform"
        >
          Dashboard
        </Link>
        <Link
          href="/wheel"
          className="px-6 py-3 rounded-lg bg-neonBlue text-darkBg font-bold hover:scale-105 transition-transform"
        >
          Spin the Wheel
        </Link>
        <Link
          href="/winner"
          className="px-6 py-3 rounded-lg bg-neonPurple text-white font-bold hover:scale-105 transition-transform"
        >
          Winner
        </Link>
      </nav>
    </main>
  );
}
