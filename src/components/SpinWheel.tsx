"use client";

import { useEffect, useRef, useState } from "react";

type SpinWheelProps = {
  members: string[];
  open: boolean;
  onClose: () => void;
  onEliminate: (member: string) => void;
  wheelRounds?: number;
  spinDuration?: number;
};

// ========== TIMING CONFIGURATION (Easy to edit!) ==========
const TIMING = {
  SPACE_ANIMATION_DURATION: 6000,  // How long space screen shows (ms)
  TYPING_ANIMATION_SPEED: 100,     // Typing speed per character (ms)
  AUTO_CLOSE_DELAY: 500,           // Delay after space animation before closing (ms)
};
// ===========================================================

const CREWMATE_COLORS = [
  '#C51111', '#132ED1', '#117F2D', '#ED54BA', 
  '#EF7D0D', '#F5F557', '#3F474E', '#D6E0F0',
  '#9B59D6', '#6B2FBB', '#38FEDB', '#50EF39'
];

export default function SpinWheel({
  members,
  open,
  onClose,
  onEliminate,
  wheelRounds = 8,
  spinDuration = 6,
}: SpinWheelProps) {
  const n = members.length;
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [showSpaceAnimation, setShowSpaceAnimation] = useState(false);
  const [typedText, setTypedText] = useState("");
  const wheelRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const liveRegionRef = useRef<HTMLDivElement | null>(null);

  const angle = n > 0 ? 360 / n : 0;

  const announce = (message: string) => {
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = message;
    }
  };

  // Typing animation effect for space screen
  useEffect(() => {
    if (showSpaceAnimation && result) {
      setTypedText("");
      const fullText = result.toUpperCase();
      let currentIndex = 0;
      
      const typingInterval = setInterval(() => {
        if (currentIndex < fullText.length) {
          setTypedText(fullText.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(typingInterval);
        }
      }, TIMING.TYPING_ANIMATION_SPEED);
      
      return () => clearInterval(typingInterval);
    }
  }, [showSpaceAnimation, result]);

  useEffect(() => {
    if (!open) {
      setSpinning(false);
      setRotation(0);
      setResult(null);
      setShowSpaceAnimation(false);
      setTypedText("");
      window.clearTimeout(timeoutRef.current ?? 0);
    }
    return () => {
      window.clearTimeout(timeoutRef.current ?? 0);
    };
  }, [open]);

  const startSpin = () => {
    if (n === 0 || spinning) return;
    setSpinning(true);
    setResult(null);
    setShowSpaceAnimation(false);
    setTypedText("");
    
    announce("Emergency meeting in progress");

    const targetIndex = Math.floor(Math.random() * n);
    const segMid = (targetIndex * angle) + angle / 2;
    const needed = (360 - segMid) % 360;
    const jitter = Math.random() * (angle * 0.2) - (angle * 0.1);
    const finalRotation = wheelRounds * 360 + needed + jitter;

    requestAnimationFrame(() => {
      setRotation(finalRotation);
    });

    const totalMs = Math.round(spinDuration * 1000 + 200);
    timeoutRef.current = window.setTimeout(() => {
      const chosen = members[targetIndex];
      
      setResult(chosen);
      setSpinning(false);
      setShowSpaceAnimation(true);
      
      announce(`${chosen} has been eliminated`);
      
      // After space animation duration, eliminate and close
      setTimeout(() => {
        onEliminate(chosen);
        setTimeout(() => {
          onClose();
        }, TIMING.AUTO_CLOSE_DELAY);
      }, TIMING.SPACE_ANIMATION_DURATION);
    }, totalMs);
  };

  const handleClose = () => {
    window.clearTimeout(timeoutRef.current ?? 0);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && !spinning && !showSpaceAnimation) {
      handleClose();
    }
    if ((e.key === "Enter" || e.key === " ") && !spinning && !showSpaceAnimation && n > 0) {
      e.preventDefault();
      startSpin();
    }
  };

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="emergency-meeting-title"
    >
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Roboto:wght@400;500;700;900&display=swap');
        
        .space-backdrop {
          background: radial-gradient(ellipse at 30% 40%, #1a1a2e 0%, #16213e 30%, #0f3460 70%, #000000 100%);
        }
        
        .space-screen {
          background: 
            radial-gradient(ellipse at 20% 30%, rgba(138, 43, 226, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, rgba(0, 191, 255, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, #000000 0%, #0a0a0a 100%);
          animation: spaceShimmer 3s ease-in-out infinite alternate;
        }
        
        @keyframes spaceShimmer {
          0% { filter: brightness(1); }
          100% { filter: brightness(1.1); }
        }
        
        .star {
          position: absolute;
          background: white;
          border-radius: 50%;
          animation: twinkle 2s ease-in-out infinite;
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        
        .typing-text {
          font-size: clamp(3rem, 12vw, 8rem);
          font-weight: 900;
          color: #ff0000;
          text-shadow: 
            0 0 40px rgba(255, 0, 0, 1),
            0 0 80px rgba(255, 0, 0, 0.8),
            0 0 120px rgba(255, 0, 0, 0.6),
            0 5px 15px rgba(0, 0, 0, 0.9);
          letter-spacing: 0.05em;
          animation: textGlow 2s ease-in-out infinite alternate;
        }
        
        @keyframes textGlow {
          0% { 
            filter: brightness(1);
            text-shadow: 
              0 0 40px rgba(255, 0, 0, 1),
              0 0 80px rgba(255, 0, 0, 0.8),
              0 0 120px rgba(255, 0, 0, 0.6),
              0 5px 15px rgba(0, 0, 0, 0.9);
          }
          100% { 
            filter: brightness(1.3);
            text-shadow: 
              0 0 60px rgba(255, 0, 0, 1),
              0 0 100px rgba(255, 0, 0, 0.9),
              0 0 140px rgba(255, 0, 0, 0.7),
              0 5px 15px rgba(0, 0, 0, 0.9);
          }
        }
        
        .typing-cursor {
          display: inline-block;
          width: 4px;
          height: 1em;
          background: #ff0000;
          margin-left: 8px;
          animation: blink 0.7s step-end infinite;
        }
        
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        
        .ejected-subtext {
          font-size: clamp(1.5rem, 5vw, 3rem);
          color: #ffffff;
          text-shadow: 
            0 0 20px rgba(255, 255, 255, 0.8),
            0 0 40px rgba(255, 0, 0, 0.5),
            0 3px 10px rgba(0, 0, 0, 0.8);
          letter-spacing: 0.2em;
          animation: subtextFade 2s ease-in-out infinite alternate;
        }
        
        @keyframes subtextFade {
          0% { opacity: 0.7; }
          100% { opacity: 1; }
        }
        
        .among-font {
          font-family: 'Orbitron', monospace;
          font-weight: 700;
        }
        
        .game-font {
          font-family: 'Roboto', sans-serif;
          font-weight: 500;
        }
        
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
      `}</style>

      <div ref={liveRegionRef} className="sr-only" role="status" aria-live="polite" aria-atomic="true" />

      {/* DRAMATIC SPACE EJECTION ANIMATION */}
      {result && showSpaceAnimation && (
        <div className="space-screen absolute inset-0 z-50 flex items-center justify-center overflow-hidden">
          {/* Starfield */}
          {[...Array(100)].map((_, i) => (
            <div
              key={i}
              className="star"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${1 + Math.random() * 3}px`,
                height: `${1 + Math.random() * 3}px`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`,
              }}
            />
          ))}
          
          {/* Main Content */}
          <div className="relative z-10 text-center px-4">
            <div className="among-font typing-text mb-8">
              {typedText}
              {typedText.length < result.toUpperCase().length && (
                <span className="typing-cursor"></span>
              )}
            </div>
            
            <div className="among-font ejected-subtext">
              WAS EJECTED
            </div>
          </div>
        </div>
      )}

      {/* Main Emergency Meeting Interface - Only show if not in space animation */}
      {!showSpaceAnimation && (
        <div className="space-backdrop absolute inset-0" />
      )}

      {!showSpaceAnimation && (
        <div className="voting-booth relative w-full max-w-5xl mx-auto h-full max-h-screen overflow-y-auto m-4">
          <div className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="among-font text-xl md:text-2xl font-black text-white mb-1">
                  EMERGENCY MEETING
                </h1>
                <p className="game-font text-xs md:text-sm text-gray-300">
                  Random elimination protocol
                </p>
              </div>
              <button
                onClick={handleClose}
                disabled={spinning}
                className="p-2 hover:bg-red-600/20 border border-red-500/30 rounded-lg transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col lg:flex-row items-center gap-6">
              <div className="relative flex-shrink-0">
                <div className="absolute left-1/2 -translate-x-1/2 z-20" style={{ top: -12 }}>
                  <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-b-[15px] border-l-transparent border-r-transparent rotate-180 border-b-red-500" />
                </div>

                <div className="relative" style={{ width: 240, height: 240 }}>
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-red-800 border-2 border-red-400/50 shadow-lg flex items-center justify-center">
                    <div className="among-font text-white font-black text-xs">VOTE</div>
                  </div>

                  <div
                    ref={wheelRef}
                    className="relative rounded-full overflow-hidden border-2 border-gray-600"
                    style={{
                      width: 240,
                      height: 240,
                      transform: `rotate(${rotation}deg)`,
                      transition: spinning
                        ? `transform ${spinDuration}s cubic-bezier(0.25, 0.46, 0.45, 0.94)`
                        : "transform 0.3s ease-out",
                      background: n > 0
                        ? `conic-gradient(${members
                            .map((_, i) => {
                              const color = CREWMATE_COLORS[i % CREWMATE_COLORS.length];
                              return `${color} ${i * angle}deg ${(i + 1) * angle}deg`;
                            })
                            .join(", ")})`
                        : "#1a1a2e",
                      boxShadow: "0 10px 20px rgba(0,0,0,0.8), inset 0 0 15px rgba(0,0,0,0.3)",
                    }}
                  >
                    <svg className="absolute inset-0" width="240" height="240" viewBox="0 0 240 240">
                      {members.map((_, i) => {
                        const segAngle = i * angle;
                        const rad = (segAngle - 90) * (Math.PI / 180);
                        const x2 = 120 + Math.cos(rad) * 120;
                        const y2 = 120 + Math.sin(rad) * 120;
                        return (
                          <line
                            key={i}
                            x1="120"
                            y1="120"
                            x2={x2}
                            y2={y2}
                            stroke="rgba(0,0,0,0.4)"
                            strokeWidth="2"
                          />
                        );
                      })}
                    </svg>

                    <div className="absolute inset-0">
                      {n > 0 && (
                        <svg width="240" height="240" viewBox="0 0 240 240">
                          {members.map((m, i) => {
                            const mid = i * angle + angle / 2;
                            const radius = 80;
                            const rad = (mid - 90) * (Math.PI / 180);
                            const x = 120 + Math.cos(rad) * radius;
                            const y = 120 + Math.sin(rad) * radius;
                            const displayName = m.length > 8 ? m.slice(0, 6) + "…" : m;
                            return (
                              <text
                                key={i}
                                x={x}
                                y={y}
                                fontSize="13"
                                fontWeight="700"
                                fill="white"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="game-font"
                                style={{
                                  textShadow: "0 1px 3px rgba(0,0,0,0.8)",
                                  transform: `rotate(${mid}deg)`,
                                  transformOrigin: `${x}px ${y}px`,
                                }}
                              >
                                {displayName}
                              </text>
                            );
                          })}
                        </svg>
                      )}
                    </div>
                  </div>
                </div>

                {spinning && (
                  <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                    <div className="px-4 py-2 bg-red-600/20 border border-red-400/50 rounded-full backdrop-blur-sm">
                      <span className="among-font text-white font-semibold flex items-center gap-2 text-xs">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                        VOTING...
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-4 min-w-[250px]">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 bg-red-500 rounded-full"></div>
                    <h2 className="among-font text-sm font-bold text-white uppercase">
                      Suspected Crewmates
                    </h2>
                    <span className="px-2 py-1 text-xs bg-red-500/20 text-red-300 rounded-full border border-red-500/30">
                      {n}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                    {n === 0 ? (
                      <div className="col-span-3 text-center py-6 text-gray-500 text-sm">
                        No crewmates available
                      </div>
                    ) : (
                      members.map((m, idx) => (
                        <div
                          key={m}
                          className="p-2 text-center hover:scale-105 transition-transform duration-200 border border-gray-600 bg-slate-800/50 rounded-lg"
                        >
                          <div className="flex justify-center mb-1">
                            <div
                              className="w-6 h-7 rounded-sm border border-black/30 relative"
                              style={{
                                backgroundColor: CREWMATE_COLORS[idx % CREWMATE_COLORS.length],
                                borderRadius: '3px 3px 4px 4px'
                              }}
                            >
                              <div className="absolute top-0.5 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-white/90 rounded-full"></div>
                            </div>
                          </div>
                          <span className="game-font text-xs text-white/90 font-medium truncate block">{m}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <button
                  onClick={startSpin}
                  disabled={spinning || n === 0}
                  className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-sm md:text-base rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 among-font"
                >
                  {spinning ? "VOTING..." : "START VOTE"}
                </button>

                <div className="p-3 bg-red-900/20 border border-red-700/30 rounded-xl">
                  <p className="game-font text-xs text-red-200">
                    Emergency protocol will randomly select one crewmate for ejection.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}