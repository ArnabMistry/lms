"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Teams page:
 * - edit 20 teams and 4 members each
 * - Save & Continue -> stores to localStorage under "lms_teams" and navigates to /dashboard
 */

type Team = {
  id: number;
  name: string;
  members: string[];        // active members
  eliminated?: string[];    // eliminated members (optional)
};

export default function TeamsPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);

  // initialize 20 teams or load from localStorage if present
  useEffect(() => {
    const saved = typeof window !== "undefined" && localStorage.getItem("lms_teams");
    if (saved) {
      try {
        setTeams(JSON.parse(saved));
        return;
      } catch {
        // fallthrough to create default
      }
    }
    const initial = Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      name: `Team ${i + 1}`,
      members: ["", "", "", ""],
      eliminated: [],
    }));
    setTeams(initial);
  }, []);

  const updateTeamName = (id: number, newName: string) => {
    setTeams(prev => prev.map(t => (t.id === id ? { ...t, name: newName } : t)));
  };

  const updateMember = (id: number, index: number, val: string) => {
    setTeams(prev => prev.map(t => {
      if (t.id !== id) return t;
      const members = [...t.members];
      members[index] = val;
      return { ...t, members };
    }));
  };

  // Save to localStorage and navigate to dashboard
  const saveAndContinue = () => {
    // sanitize: ensure members array exists
    const payload = teams.map(t => ({
      id: t.id,
      name: t.name || `Team ${t.id}`,
      members: t.members.map(m => (m || "").trim()),
      eliminated: t.eliminated || [],
    }));
    localStorage.setItem("lms_teams", JSON.stringify(payload));
    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen bg-darkBg text-white p-8">
      <h1 className="text-center neon-text text-4xl font-extrabold mb-8">Teams Setup</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {teams.map(team => (
          <div key={team.id} className="glass-card p-4 flex flex-col">
            <input
              className="input-field text-center font-semibold text-lg mb-3"
              value={team.name}
              onChange={(e) => updateTeamName(team.id, e.target.value)}
              placeholder={`Team ${team.id}`}
            />

            <div className="space-y-2">
              {team.members.map((m, idx) => (
                <input
                  key={idx}
                  className="input-field"
                  placeholder={`Member ${idx + 1}`}
                  value={m}
                  onChange={(e) => updateMember(team.id, idx, e.target.value)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ===== Save & Continue Button =====
          This saves the teams to localStorage and navigates to /dashboard.
          You can style or move this button as needed.
      */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={saveAndContinue}
          className="px-6 py-3 bg-neonBlue text-darkBg font-bold rounded-xl hover:scale-105 transition-transform"
        >
          Save & Continue → Dashboard
        </button>
      </div>
    </main>
  );
}
