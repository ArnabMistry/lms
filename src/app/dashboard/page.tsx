"use client";

import { useEffect, useState } from "react";
import SpinWheel from "@/components/SpinWheel";

type Team = {
  id: number;
  name: string;
  members: string[];
  eliminated: string[];
};

const CREWMATE_COLORS = [
  '#C51111', // Red
  '#132ED1', // Blue  
  '#117F2D', // Green
  '#ED54BA', // Pink
  '#EF7D0D', // Orange
  '#F5F557', // Yellow
  '#3F474E', // Black
  '#D6E0F0', // White
  '#9B59D6', // Purple
  '#6B2FBB', // Brown
  '#38FEDB', // Cyan
  '#50EF39', // Lime
];

export default function DashboardPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [showWheelFor, setShowWheelFor] = useState<number | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const saved = typeof window !== "undefined" && localStorage.getItem("lms_teams");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Team[];
        setTeams(parsed.map(t => ({ ...t, eliminated: t.eliminated || [] })));
        return;
      } catch {
        // ignore
      }
    }
    setTeams([]);
  }, []);

  const persist = (next: Team[]) => {
    setTeams(next);
    localStorage.setItem("lms_teams", JSON.stringify(next));
  };

  const onDragStart = (e: React.DragEvent, idx: number) => {
    setDragIndex(idx);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === idx) {
      setDragIndex(null);
      return;
    }
    const next = [...teams];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(idx, 0, moved);
    persist(next);
    setDragIndex(null);
  };

  const handleEliminate = (teamIndex: number, memberName: string) => {
    const next = teams.map((t, i) => {
      if (i !== teamIndex) return t;
      const members = t.members.filter(m => m !== memberName);
      return { ...t, members, eliminated: [...t.eliminated, memberName] };
    });
    persist(next);
    setTimeout(() => setShowWheelFor(null), 800);
  };

  const manualRemove = (teamIndex: number, memberName: string) => {
    if (!confirm(`Eject ${memberName} from ${teams[teamIndex].name}?`)) return;
    const next = teams.map((t, i) => {
      if (i !== teamIndex) return t;
      const members = t.members.filter(m => m !== memberName);
      return { ...t, members, eliminated: [...t.eliminated, memberName] };
    });
    persist(next);
  };

  const reviveMember = (teamIndex: number, memberName: string) => {
    const next = teams.map((t, i) => {
      if (i !== teamIndex) return t;
      const eliminated = t.eliminated.filter(e => e !== memberName);
      const members = [...t.members, memberName];
      return { ...t, members, eliminated };
    });
    persist(next);
  };

  const addMember = (teamIndex: number) => {
    const name = prompt("Enter crewmate name:");
    if (!name || !name.trim()) return;
    const next = teams.map((t, i) => (i === teamIndex ? { ...t, members: [...t.members, name.trim()] } : t));
    persist(next);
  };

  const saveNow = () => {
    localStorage.setItem("lms_teams", JSON.stringify(teams));
    alert("Game settings saved!");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white overflow-hidden">
      
      {/* Among Us CSS Styling */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Roboto:wght@400;500;700;900&display=swap');
        
        .space-bg {
          background: 
            radial-gradient(ellipse at 30% 40%, #1a1a2e 0%, #16213e 30%, #0f3460 70%, #000000 100%);
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }
        
        .stars-field::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            radial-gradient(2px 2px at 30px 40px, #ffffff, transparent),
            radial-gradient(1px 1px at 80px 120px, #ffffff, transparent),
            radial-gradient(1px 1px at 140px 60px, #ffffff, transparent),
            radial-gradient(2px 2px at 200px 180px, #ffffff, transparent),
            radial-gradient(1px 1px at 260px 80px, #ffffff, transparent);
          background-size: 300px 200px;
          background-repeat: repeat;
          opacity: 0.8;
          animation: twinkle 3s ease-in-out infinite alternate;
        }
        
        @keyframes twinkle {
          0% { opacity: 0.4; }
          100% { opacity: 0.8; }
        }
        
        .among-panel {
          background: linear-gradient(135deg, #2D3748 0%, #1A202C 100%);
          border: 3px solid #4A5568;
          border-radius: 20px;
          box-shadow: 
            0 20px 25px -5px rgba(0, 0, 0, 0.6),
            0 10px 10px -5px rgba(0, 0, 0, 0.4),
            inset 0 2px 0 rgba(255, 255, 255, 0.1);
        }
        
        .among-panel:hover {
          border-color: #718096;
          transform: translateY(-2px);
          box-shadow: 
            0 25px 35px -5px rgba(0, 0, 0, 0.7),
            0 15px 15px -5px rgba(0, 0, 0, 0.5),
            inset 0 2px 0 rgba(255, 255, 255, 0.15);
        }
        
        .crewmate-bean {
          width: 40px;
          height: 50px;
          border-radius: 20px 20px 25px 25px;
          position: relative;
          display: inline-block;
          border: 2px solid rgba(0, 0, 0, 0.3);
        }
        
        .crewmate-bean::before {
          content: '';
          position: absolute;
          top: 8px;
          left: 50%;
          transform: translateX(-50%);
          width: 20px;
          height: 12px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 10px;
          border: 1px solid rgba(0, 0, 0, 0.2);
        }
        
        .emergency-button {
          background: linear-gradient(135deg, #E53E3E 0%, #C53030 100%);
          border: 4px solid #742A2A;
          border-radius: 50%;
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Orbitron', monospace;
          font-weight: 900;
          font-size: 10px;
          color: white;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
          box-shadow: 
            0 8px 16px rgba(197, 48, 48, 0.4),
            inset 0 2px 4px rgba(255, 255, 255, 0.3),
            inset 0 -2px 4px rgba(0, 0, 0, 0.3);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .emergency-button:hover {
          transform: scale(1.1);
          box-shadow: 
            0 12px 20px rgba(197, 48, 48, 0.6),
            inset 0 2px 4px rgba(255, 255, 255, 0.4),
            inset 0 -2px 4px rgba(0, 0, 0, 0.4);
        }
        
        .among-button {
          background: linear-gradient(135deg, #4A5568 0%, #2D3748 100%);
          border: 2px solid #718096;
          border-radius: 12px;
          font-family: 'Roboto', sans-serif;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          transition: all 0.2s ease;
          box-shadow: 
            0 4px 8px rgba(0, 0, 0, 0.3),
            inset 0 1px 2px rgba(255, 255, 255, 0.1);
        }
        
        .among-button:hover {
          background: linear-gradient(135deg, #718096 0%, #4A5568 100%);
          border-color: #E2E8F0;
          transform: translateY(-1px);
          box-shadow: 
            0 6px 12px rgba(0, 0, 0, 0.4),
            inset 0 1px 2px rgba(255, 255, 255, 0.2);
        }
        
        .impostor-text {
          color: #E53E3E;
          font-family: 'Orbitron', monospace;
          font-weight: 900;
          text-shadow: 
            0 0 10px rgba(229, 62, 62, 0.8),
            2px 2px 4px rgba(0, 0, 0, 0.8);
        }
        
        .crewmate-text {
          color: #48BB78;
          font-family: 'Roboto', sans-serif;
          font-weight: 700;
        }
        
        .task-bar {
          background: linear-gradient(90deg, #2D3748 0%, #4A5568 50%, #2D3748 100%);
          border: 2px solid #718096;
          border-radius: 10px;
          height: 8px;
          overflow: hidden;
          position: relative;
        }
        
        .task-progress {
          background: linear-gradient(90deg, #48BB78 0%, #38A169 100%);
          height: 100%;
          border-radius: 6px;
          transition: width 0.3s ease;
          box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.3);
        }
        
        .voting-panel {
          background: linear-gradient(135deg, #1A202C 0%, #2D3748 100%);
          border: 4px solid #4A5568;
          border-radius: 24px;
          box-shadow: 
            0 25px 50px -12px rgba(0, 0, 0, 0.8),
            inset 0 4px 0 rgba(255, 255, 255, 0.1),
            inset 0 -4px 0 rgba(0, 0, 0, 0.3);
        }
        
        .sus-meter {
          background: linear-gradient(90deg, 
            #48BB78 0%, 
            #F6E05E 25%, 
            #ED8936 50%, 
            #E53E3E 75%, 
            #742A2A 100%);
          height: 6px;
          border-radius: 3px;
          margin: 8px 0;
        }
        
        .among-font {
          font-family: 'Orbitron', monospace;
          font-weight: 700;
        }
        
        .game-font {
          font-family: 'Roboto', sans-serif;
          font-weight: 500;
        }
        
        .ejected-crewmate {
          opacity: 0.5;
          transform: rotate(-45deg);
          filter: grayscale(0.8);
          position: relative;
        }
        
        .ejected-crewmate::after {
          content: '💀';
          position: absolute;
          top: -10px;
          right: -10px;
          font-size: 16px;
        }
      `}</style>

      {/* Space Background */}
      <div className="space-bg stars-field"></div>

      {/* Emergency Meeting Header */}
      <div className="voting-panel relative z-10 mx-4 mt-6 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="emergency-button">
                EMERGENCY
              </div>
              <div>
                <h1 className="among-font text-4xl font-black text-white mb-2">
                  CREWMATE ASSIGNMENT
                </h1>
                <p className="game-font text-lg text-gray-300">
                  Configure your lobby before the game starts
                </p>
                <div className="sus-meter w-96 mt-2"></div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="among-panel p-4 text-center">
                <div className="game-font text-sm text-gray-400 mb-1">LOBBY STATUS</div>
                <div className="among-font text-white font-bold">WAITING</div>
              </div>
              
              <button
                onClick={saveNow}
                className="among-button px-6 py-3 text-white hover:scale-105 transition-transform duration-200"
              >
                SAVE CONFIG
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Game Interface */}
      <div className="relative z-10 px-4 py-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Game Instructions */}
          <div className="among-panel p-8 mb-8">
            <div className="text-center">
              <h2 className="among-font text-3xl font-bold text-white mb-4">
                LOBBY CONFIGURATION
              </h2>
              <p className="game-font text-xl text-gray-300 mb-4">
                Drag and drop crew assignments to match your physical seating arrangement
              </p>
              <div className="flex items-center justify-center space-x-8">
                <div className="flex items-center space-x-2">
                  <div className="crewmate-bean" style={{backgroundColor: '#48BB78'}}></div>
                  <span className="crewmate-text">Active Crewmates</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="crewmate-bean ejected-crewmate" style={{backgroundColor: '#E53E3E'}}></div>
                  <span className="impostor-text">Ejected Players</span>
                </div>
              </div>
            </div>
          </div>

          {teams.length === 0 ? (
            <div className="among-panel p-16 text-center">
              <div className="among-font text-6xl font-black text-gray-600 mb-6">
                EMPTY LOBBY
              </div>
              <h3 className="among-font text-3xl font-bold text-white mb-4">
                NO CREWS ASSIGNED
              </h3>
              <p className="game-font text-xl text-gray-400">
                Set up your teams to start the assignment process
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {teams.map((team, idx) => {
                const teamColor = CREWMATE_COLORS[idx % CREWMATE_COLORS.length];
                return (
                  <div
                    key={team.id}
                    draggable={true}
                    onDragStart={(e) => onDragStart(e, idx)}
                    onDragOver={onDragOver}
                    onDrop={(e) => onDrop(e, idx)}
                    className={`among-panel p-6 cursor-move transition-all duration-300 ${
                      dragIndex === idx ? 'scale-110 z-50' : ''
                    }`}
                  >
                    
                    {/* Crew Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="crewmate-bean" style={{backgroundColor: teamColor}}></div>
                        <div>
                          <div className="among-button px-3 py-1 text-white text-xs mb-2">
                            CREW #{String(team.id).padStart(2, '0')}
                          </div>
                          <h3 className="among-font text-xl font-bold text-white">
                            {team.name.toUpperCase()}
                          </h3>
                        </div>
                      </div>
                      <div className="game-font text-xs text-gray-500 px-2 py-1 bg-gray-800 rounded">
                        DRAGGABLE
                      </div>
                    </div>

                    {/* Task Progress Bar */}
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="game-font text-sm text-gray-400">CREW TASKS</span>
                        <span className="among-font text-white font-bold text-sm">
                          {team.members.length}/{team.members.length + team.eliminated.length}
                        </span>
                      </div>
                      <div className="task-bar">
                        <div 
                          className="task-progress"
                          style={{
                            width: `${team.members.length + team.eliminated.length > 0 ? 
                              (team.members.length / (team.members.length + team.eliminated.length)) * 100 : 0}%`
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Active Crewmates */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="game-font text-sm font-bold text-green-400 uppercase">
                          Active Crewmates
                        </h4>
                        <div className="among-button px-3 py-1 text-white text-sm">
                          {team.members.length}
                        </div>
                      </div>
                      
                      {team.members.length === 0 ? (
                        <div className="border-2 border-dashed border-gray-600 rounded-xl p-6 text-center">
                          <div className="crewmate-bean mx-auto mb-2" style={{backgroundColor: '#4A5568'}}></div>
                          <div className="game-font text-gray-500 text-sm">
                            No crewmates in this section
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {team.members.map((member, memberIdx) => (
                            <div key={member} className="group flex items-center justify-between p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700/70 transition-all duration-200">
                              <div className="flex items-center space-x-3">
                                <div 
                                  className="crewmate-bean" 
                                  style={{backgroundColor: CREWMATE_COLORS[memberIdx % CREWMATE_COLORS.length]}}
                                ></div>
                                <div>
                                  <div className="game-font text-white font-semibold">
                                    {member}
                                  </div>
                                  <div className="crewmate-text text-xs">
                                    ALIVE
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={(e) => { e.stopPropagation(); manualRemove(idx, member); }}
                                className="opacity-0 group-hover:opacity-100 among-button px-3 py-1 text-red-400 hover:text-red-300 text-xs transition-all duration-200"
                              >
                                EJECT
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Ejected Crewmates */}
                    {team.eliminated.length > 0 && (
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="game-font text-sm font-bold text-red-400 uppercase">
                            Ejected into Space
                          </h4>
                          <div className="among-button px-3 py-1 border-red-500 text-red-400 text-sm">
                            {team.eliminated.length}
                          </div>
                        </div>
                        <div className="space-y-2">
                          {team.eliminated.map((member, elimIdx) => (
                            <div key={member} className="group flex items-center justify-between p-3 rounded-xl bg-red-900/20 border border-red-800/30 transition-all duration-200">
                              <div className="flex items-center space-x-3">
                                <div 
                                  className="crewmate-bean ejected-crewmate" 
                                  style={{backgroundColor: CREWMATE_COLORS[elimIdx % CREWMATE_COLORS.length]}}
                                ></div>
                                <div>
                                  <div className="game-font text-red-300 font-semibold line-through opacity-75">
                                    {member}
                                  </div>
                                  <div className="impostor-text text-xs">
                                    EJECTED
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={(e) => { e.stopPropagation(); reviveMember(idx, member); }}
                                className="opacity-0 group-hover:opacity-100 among-button px-3 py-1 text-green-400 hover:text-green-300 text-xs transition-all duration-200"
                              >
                                REVIVE
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Crew Controls */}
                    <div className="flex space-x-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowWheelFor(idx); }}
                        disabled={team.members.length === 0}
                        className="flex-1 among-button px-4 py-3 text-white hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="among-font font-bold">
                          RANDOM EJECT
                        </div>
                        <div className="game-font text-xs text-gray-400 mt-1">
                          Emergency vote
                        </div>
                      </button>
                      
                      <button
                        onClick={(e) => { e.stopPropagation(); addMember(idx); }}
                        className="among-button px-4 py-3 text-white hover:scale-105 transition-all duration-300"
                      >
                        <div className="among-font font-bold text-sm">
                          ADD
                        </div>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Game Master Controls */}
          <div className="mt-12 text-center">
            <div className="among-panel inline-block p-8">
              <h3 className="among-font text-2xl font-bold text-white mb-4">
                GAME MASTER CONTROLS
              </h3>
              <button 
                onClick={saveNow} 
                className="among-button px-8 py-4 text-white hover:scale-105 transition-all duration-300"
              >
                <div className="among-font font-black text-xl mb-1">
                  SAVE LOBBY CONFIG
                </div>
                <div className="game-font text-sm text-gray-400">
                  Store current assignments
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Meeting Voting */}
      {showWheelFor !== null && teams[showWheelFor] && (
        <SpinWheel
          open={showWheelFor !== null}
          members={teams[showWheelFor].members}
          onClose={() => setShowWheelFor(null)}
          onEliminate={(member) => handleEliminate(showWheelFor, member)}
        />
      )}
    </div>
  );
}
