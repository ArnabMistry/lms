"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type SpinWheelProps = {
  members: string[];
  open: boolean;
  onClose: () => void;
  onEliminate: (member: string) => void;
  wheelRounds?: number;
  spinDuration?: number;
  roastMode?: boolean;
  roastLines?: string[];
  colors?: {
    palette: string[];
    pointer: string;
    bg: string;
  };
};

const CREWMATE_COLORS = [
  '#C51111', '#132ED1', '#117F2D', '#ED54BA', 
  '#EF7D0D', '#F5F557', '#3F474E', '#D6E0F0',
  '#9B59D6', '#6B2FBB', '#38FEDB', '#50EF39'
];

const SUPER_FUN_MESSAGES = [
  "🎉 {name} just got the ULTIMATE SPACE VACATION! 🚀✨ Party crew activated! 💃🕺",
  "🌟 {name} became our SHOOTING STAR CHAMPION! 🏆 Everyone dance NOW! 💫🎪",
  "🎊 {name} got the VIP COSMIC TOUR! 🛸 Time for the BIGGEST celebration! 🎭🎈",
  "⭐ {name} is now EXPLORING THE GALAXY! 🌌 Crew dance party ACTIVATED! 🕺💃",
  "🚀 {name} got YEETED to the MOON! 🌙 Time to PARTY HARD! 🎉🎵",
  "🎈 {name} won the SPACE ADVENTURE LOTTERY! 🎰 CELEBRATION MODE: MAXIMUM! 🎪✨"
];

const CELEBRATION_SOUNDS = ["🎵", "🎶", "🎼", "🎤", "🔊", "📯", "🎺", "🎸"];
const PARTY_EMOJIS = ["🎉", "🎊", "🥳", "🎈", "🎭", "🎪", "✨", "💫", "⭐", "🌟", "🎁", "🏆"];

export default function SpinWheel({
  members,
  open,
  onClose,
  onEliminate,
  wheelRounds = 8,
  spinDuration = 6,
  roastMode = true,
  roastLines = SUPER_FUN_MESSAGES,
}: SpinWheelProps) {
  const n = members.length;
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [showReveal, setShowReveal] = useState(false);
  const [roastLine, setRoastLine] = useState("");
  const [canConfirm, setCanConfirm] = useState(false);
  const [votePhase, setVotePhase] = useState<'voting' | 'celebrating' | 'ejecting' | 'floating'>('voting');
  const [celebrationCounter, setCelebrationCounter] = useState(15);
  const wheelRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const revealTimeoutRef = useRef<number | null>(null);
  const liveRegionRef = useRef<HTMLDivElement | null>(null);

  const angle = n > 0 ? 360 / n : 0;
  const remainingCrewmates = members.filter(member => member !== result);

  const announce = (message: string) => {
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = message;
    }
  };

  // Celebration countdown timer
  useEffect(() => {
    if (showReveal && votePhase === 'celebrating' && celebrationCounter > 0) {
      const timer = setTimeout(() => {
        setCelebrationCounter(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (celebrationCounter === 0 && votePhase === 'celebrating') {
      setCanConfirm(true);
    }
  }, [showReveal, votePhase, celebrationCounter]);

  useEffect(() => {
    if (!open) {
      setSpinning(false);
      setRotation(0);
      setResult(null);
      setShowReveal(false);
      setCanConfirm(false);
      setVotePhase('voting');
      setCelebrationCounter(15);
      window.clearTimeout(timeoutRef.current ?? 0);
      window.clearTimeout(revealTimeoutRef.current ?? 0);
    }
    return () => {
      window.clearTimeout(timeoutRef.current ?? 0);
      window.clearTimeout(revealTimeoutRef.current ?? 0);
    };
  }, [open]);

  const startSpin = () => {
    if (n === 0 || spinning) return;
    setSpinning(true);
    setResult(null);
    setShowReveal(false);
    setCanConfirm(false);
    setVotePhase('voting');
    setCelebrationCounter(15);
    
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
      const roast = roastLines[Math.floor(Math.random() * roastLines.length)].replace("{name}", chosen);
      
      setResult(chosen);
      setRoastLine(roast);
      setSpinning(false);
      setShowReveal(true);
      setVotePhase('celebrating');
      
      announce(`${chosen} has been selected for ejection`);
    }, totalMs);
  };

  const handleConfirmElimination = () => {
    if (result && canConfirm) {
      setVotePhase('ejecting');
      
      // Extended ejection sequence - 5 seconds
      setTimeout(() => {
        setVotePhase('floating');
        onEliminate(result);
      }, 5000);
      
      // Close after longer floating animation - 8 seconds total
      setTimeout(() => {
        handleClose();
      }, 13000);
    }
  };

  const handleUndo = () => {
    setShowReveal(false);
    setResult(null);
    setCanConfirm(false);
    setVotePhase('voting');
    setCelebrationCounter(15);
    announce("Vote cancelled");
  };

  const handleClose = () => {
    window.clearTimeout(timeoutRef.current ?? 0);
    window.clearTimeout(revealTimeoutRef.current ?? 0);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && !spinning && votePhase === 'voting') {
      handleClose();
    }
    if ((e.key === "Enter" || e.key === " ") && !spinning && !showReveal && n > 0) {
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
          background: 
            radial-gradient(ellipse at 30% 40%, #1a1a2e 0%, #16213e 30%, #0f3460 70%, #000000 100%);
        }
        
        .mega-party-backdrop {
          background: 
            radial-gradient(ellipse at 20% 30%, #ff1493 0%, transparent 40%),
            radial-gradient(ellipse at 80% 20%, #00ff00 0%, transparent 40%),
            radial-gradient(ellipse at 30% 80%, #ffff00 0%, transparent 40%),
            radial-gradient(ellipse at 70% 70%, #ff69b4 0%, transparent 40%),
            radial-gradient(ellipse at 50% 50%, #1a1a2e 0%, #16213e 30%, #0f3460 70%, #000000 100%);
          animation: megaPartyStrobe 1s ease-in-out infinite alternate;
        }
        
        @keyframes megaPartyStrobe {
          0% { filter: hue-rotate(0deg) brightness(1) saturate(1.5); }
          20% { filter: hue-rotate(72deg) brightness(1.2) saturate(2); }
          40% { filter: hue-rotate(144deg) brightness(0.9) saturate(1.8); }
          60% { filter: hue-rotate(216deg) brightness(1.1) saturate(2.2); }
          80% { filter: hue-rotate(288deg) brightness(1.3) saturate(1.6); }
          100% { filter: hue-rotate(360deg) brightness(1) saturate(2.5); }
        }
        
        .crewmate-bean-big {
          width: 140px;
          height: 175px;
          border-radius: 70px 70px 87px 87px;
          position: relative;
          display: inline-block;
          border: 4px solid rgba(0, 0, 0, 0.4);
          box-shadow: 
            0 15px 35px rgba(0, 0, 0, 0.6),
            inset 0 3px 6px rgba(255, 255, 255, 0.2),
            inset 0 -3px 6px rgba(0, 0, 0, 0.3);
        }
        
        .crewmate-bean-big::before {
          content: '';
          position: absolute;
          top: 28px;
          left: 50%;
          transform: translateX(-50%);
          width: 56px;
          height: 35px;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 28px;
          border: 3px solid rgba(0, 0, 0, 0.2);
        }
        
        .crewmate-mini {
          width: 35px;
          height: 43px;
          border-radius: 17px 17px 21px 21px;
          position: relative;
          display: inline-block;
          border: 2px solid rgba(0, 0, 0, 0.3);
        }
        
        .crewmate-mini::before {
          content: '';
          position: absolute;
          top: 7px;
          left: 50%;
          transform: translateX(-50%);
          width: 14px;
          height: 9px;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 7px;
          border: 1px solid rgba(0, 0, 0, 0.2);
        }
        
        .crazy-dancing-1 {
          animation: crazyDance1 0.4s ease-in-out infinite alternate;
        }
        
        .crazy-dancing-2 {
          animation: crazyDance2 0.5s ease-in-out infinite alternate;
        }
        
        .crazy-dancing-3 {
          animation: crazyDance3 0.3s ease-in-out infinite alternate;
        }
        
        .crazy-dancing-4 {
          animation: crazyDance4 0.6s ease-in-out infinite alternate;
        }
        
        .crazy-dancing-5 {
          animation: crazyDance5 0.35s ease-in-out infinite alternate;
        }
        
        .crazy-dancing-6 {
          animation: crazyDance6 0.45s ease-in-out infinite alternate;
        }
        
        @keyframes crazyDance1 {
          0% { transform: translateY(0) rotate(0deg) scale(1); }
          50% { transform: translateY(-12px) rotate(15deg) scale(1.15); }
          100% { transform: translateY(0) rotate(-15deg) scale(0.85); }
        }
        
        @keyframes crazyDance2 {
          0% { transform: translateX(0) rotate(0deg) scale(1); }
          50% { transform: translateX(8px) rotate(-20deg) scale(1.2); }
          100% { transform: translateX(-8px) rotate(20deg) scale(0.8); }
        }
        
        @keyframes crazyDance3 {
          0% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.3) rotate(25deg); }
          50% { transform: scale(0.7) rotate(-25deg); }
          75% { transform: scale(1.1) rotate(15deg); }
          100% { transform: scale(0.9) rotate(-10deg); }
        }
        
        @keyframes crazyDance4 {
          0% { transform: translateY(0) rotate(0deg) skewX(0deg); }
          20% { transform: translateY(-8px) rotate(30deg) skewX(15deg); }
          40% { transform: translateY(-15px) rotate(-20deg) skewX(-10deg); }
          60% { transform: translateY(-5px) rotate(25deg) skewX(8deg); }
          80% { transform: translateY(-10px) rotate(-15deg) skewX(-5deg); }
          100% { transform: translateY(0) rotate(0deg) skewX(0deg); }
        }
        
        @keyframes crazyDance5 {
          0% { transform: scale(1) rotate(0deg) translateY(0); }
          33% { transform: scale(1.4) rotate(45deg) translateY(-10px); }
          66% { transform: scale(0.6) rotate(-45deg) translateY(-15px); }
          100% { transform: scale(1.2) rotate(30deg) translateY(-5px); }
        }
        
        @keyframes crazyDance6 {
          0% { transform: translateX(0) translateY(0) rotate(0deg); }
          25% { transform: translateX(10px) translateY(-8px) rotate(40deg); }
          50% { transform: translateX(-10px) translateY(-12px) rotate(-40deg); }
          75% { transform: translateX(5px) translateY(-6px) rotate(20deg); }
          100% { transform: translateX(-5px) translateY(-3px) rotate(-20deg); }
        }
        
        .mega-party-confetti {
          position: absolute;
          border-radius: 50%;
          animation: megaConfettiParty 4s ease-out infinite;
        }
        
        @keyframes megaConfettiParty {
          0% { 
            transform: translateY(-50px) rotate(0deg) scale(0);
            opacity: 1;
          }
          5% {
            transform: translateY(-30px) rotate(180deg) scale(1.2);
            opacity: 1;
          }
          15% {
            transform: translateY(0px) rotate(360deg) scale(1);
            opacity: 1;
          }
          100% { 
            transform: translateY(120vh) rotate(1080deg) scale(0.3);
            opacity: 0;
          }
        }
        
        .mega-celebration-message {
          animation: megaCelebrationBounce 1s ease-in-out infinite alternate;
          text-shadow: 
            0 0 20px rgba(255, 215, 0, 0.8),
            0 0 40px rgba(255, 105, 180, 0.6),
            0 0 60px rgba(0, 255, 255, 0.4);
        }
        
        @keyframes megaCelebrationBounce {
          0% { 
            transform: scale(1) translateY(0) rotateZ(0deg);
            filter: hue-rotate(0deg);
          }
          100% { 
            transform: scale(1.08) translateY(-8px) rotateZ(2deg);
            filter: hue-rotate(180deg);
          }
        }
        
        .mega-party-booth {
          background: linear-gradient(135deg, 
            rgba(255, 20, 147, 0.15) 0%, 
            rgba(26, 32, 44, 0.95) 20%,
            rgba(0, 255, 255, 0.1) 40%,
            rgba(45, 55, 72, 0.95) 60%,
            rgba(255, 255, 0, 0.15) 80%,
            rgba(26, 32, 44, 0.95) 100%
          );
          border: 5px solid;
          border-image: linear-gradient(45deg, #ff1493, #00ffff, #ffff00, #ff69b4) 1;
          border-radius: 20px;
          box-shadow: 
            0 20px 40px -10px rgba(0, 0, 0, 0.8),
            inset 0 3px 0 rgba(255, 255, 255, 0.1),
            0 0 50px rgba(255, 20, 147, 0.3),
            0 0 100px rgba(0, 255, 255, 0.2);
        }
        
        .mega-party-light {
          animation: megaPartyBlink 0.2s ease-in-out infinite alternate;
          box-shadow: 0 0 25px rgba(255, 255, 255, 0.8);
          filter: saturate(2) brightness(1.5);
        }
        
        @keyframes megaPartyBlink {
          0% { 
            background: radial-gradient(circle, #ff0000, #cc0000);
            transform: scale(1) rotate(0deg);
          }
          12.5% { 
            background: radial-gradient(circle, #ff8000, #cc6600);
            transform: scale(1.3) rotate(45deg);
          }
          25% { 
            background: radial-gradient(circle, #ffff00, #cccc00);
            transform: scale(1) rotate(90deg);
          }
          37.5% { 
            background: radial-gradient(circle, #80ff00, #66cc00);
            transform: scale(1.2) rotate(135deg);
          }
          50% { 
            background: radial-gradient(circle, #00ff00, #00cc00);
            transform: scale(1) rotate(180deg);
          }
          62.5% { 
            background: radial-gradient(circle, #00ff80, #00cc66);
            transform: scale(1.4) rotate(225deg);
          }
          75% { 
            background: radial-gradient(circle, #00ffff, #00cccc);
            transform: scale(1) rotate(270deg);
          }
          87.5% { 
            background: radial-gradient(circle, #8000ff, #6600cc);
            transform: scale(1.1) rotate(315deg);
          }
          100% { 
            background: radial-gradient(circle, #ff00ff, #cc00cc);
            transform: scale(1) rotate(360deg);
          }
        }
        
        .countdown-timer {
          animation: countdownPulse 1s ease-in-out infinite alternate;
          font-size: 4rem;
          text-shadow: 
            0 0 20px rgba(255, 0, 0, 0.8),
            0 0 40px rgba(255, 255, 0, 0.6),
            0 0 60px rgba(0, 255, 255, 0.4);
        }
        
        @keyframes countdownPulse {
          0% { 
            transform: scale(1);
            filter: hue-rotate(0deg);
          }
          100% { 
            transform: scale(1.2);
            filter: hue-rotate(360deg);
          }
        }
        
        .mega-name-display {
          font-size: clamp(2.5rem, 8vw, 6rem);
          font-weight: 900;
          text-shadow: 
            0 0 30px rgba(255, 0, 0, 1),
            0 0 60px rgba(255, 255, 0, 0.8),
            0 0 90px rgba(0, 255, 255, 0.6),
            4px 4px 8px rgba(0, 0, 0, 0.8);
          animation: megaNamePulse 1.5s ease-in-out infinite alternate;
          letter-spacing: 0.1em;
        }
        
        @keyframes megaNamePulse {
          0% { 
            transform: scale(1) rotateZ(0deg);
            filter: hue-rotate(0deg) brightness(1);
          }
          50% {
            transform: scale(1.05) rotateZ(1deg);
            filter: hue-rotate(180deg) brightness(1.3);
          }
          100% { 
            transform: scale(1.1) rotateZ(-1deg);
            filter: hue-rotate(360deg) brightness(1.1);
          }
        }
        
        .ultimate-party-button {
          background: linear-gradient(45deg, 
            #ff0000 0%, 
            #ff8000 12.5%,
            #ffff00 25%, 
            #80ff00 37.5%,
            #00ff00 50%, 
            #00ff80 62.5%,
            #00ffff 75%,
            #8000ff 87.5%,
            #ff00ff 100%
          );
          background-size: 800% 800%;
          animation: ultimatePartyGlow 2s ease infinite;
          font-size: 1.5rem;
          font-weight: 900;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
          border: 3px solid rgba(255, 255, 255, 0.3);
          box-shadow: 
            0 0 30px rgba(255, 255, 255, 0.5),
            inset 0 2px 4px rgba(255, 255, 255, 0.2);
        }
        
        @keyframes ultimatePartyGlow {
          0% { 
            background-position: 0% 50%;
            transform: scale(1);
            box-shadow: 0 0 30px rgba(255, 255, 255, 0.5);
          }
          50% { 
            background-position: 100% 50%;
            transform: scale(1.05);
            box-shadow: 0 0 50px rgba(255, 255, 255, 0.8);
          }
          100% { 
            background-position: 0% 50%;
            transform: scale(1);
            box-shadow: 0 0 30px rgba(255, 255, 255, 0.5);
          }
        }
        
        .ejection-launch {
          animation: megaEjectLaunch 5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        
        @keyframes megaEjectLaunch {
          0% { 
            transform: translateY(0) rotate(0deg) scale(1);
            opacity: 1;
          }
          20% {
            transform: translateY(-80px) rotate(180deg) scale(1.3);
            opacity: 1;
          }
          60% {
            transform: translateY(-200px) rotate(540deg) scale(1.1);
            opacity: 0.8;
          }
          100% { 
            transform: translateY(-500px) rotate(1080deg) scale(0.2);
            opacity: 0;
          }
        }
        
        .space-float {
          animation: megaSpaceFloat 8s ease-out forwards;
        }
        
        @keyframes megaSpaceFloat {
          0% {
            transform: translateY(-500px) rotate(1080deg) scale(0.2);
            opacity: 0;
          }
          25% {
            opacity: 1;
          }
          100% {
            transform: translateY(-800px) rotate(1800deg) scale(0.05);
            opacity: 0;
          }
        }
        
        .floating-emoji {
          position: absolute;
          font-size: 2rem;
          animation: floatingEmoji 3s ease-in-out infinite;
        }
        
        @keyframes floatingEmoji {
          0% { 
            transform: translateY(0px) rotate(0deg) scale(1);
            opacity: 0.7;
          }
          50% { 
            transform: translateY(-20px) rotate(180deg) scale(1.2);
            opacity: 1;
          }
          100% { 
            transform: translateY(0px) rotate(360deg) scale(1);
            opacity: 0.7;
          }
        }
        
        .among-font {
          font-family: 'Orbitron', monospace;
          font-weight: 700;
        }
        
        .game-font {
          font-family: 'Roboto', sans-serif;
          font-weight: 500;
        }
        
        .impostor-text {
          color: #E53E3E;
          font-family: 'Orbitron', monospace;
          font-weight: 900;
          text-shadow: 
            0 0 15px rgba(229, 62, 62, 0.8),
            2px 2px 4px rgba(0, 0, 0, 0.8);
        }
      `}</style>

      <div ref={liveRegionRef} className="sr-only" role="status" aria-live="polite" aria-atomic="true" />

      {/* Mega Party Backdrop */}
      <div className={`${showReveal ? 'mega-party-backdrop' : 'space-backdrop'} absolute inset-0`} />

      {/* Floating Party Emojis */}
      {showReveal && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {PARTY_EMOJIS.map((emoji, i) => (
            <div
              key={i}
              className="floating-emoji"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            >
              {emoji}
            </div>
          ))}
          {CELEBRATION_SOUNDS.map((sound, i) => (
            <div
              key={`sound-${i}`}
              className="floating-emoji"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                fontSize: '1.5rem',
              }}
            >
              {sound}
            </div>
          ))}
        </div>
      )}

      {/* MEGA Party Celebration Phase */}
      {showReveal && result && votePhase === 'celebrating' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
          {/* MEGA Party Confetti */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(60)].map((_, i) => (
              <div
                key={i}
                className="mega-party-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  width: `${8 + Math.random() * 12}px`,
                  height: `${8 + Math.random() * 12}px`,
                  backgroundColor: CREWMATE_COLORS[Math.floor(Math.random() * CREWMATE_COLORS.length)],
                  animationDelay: `${Math.random() * 3}s`,
                }}
              />
            ))}
          </div>

          {/* MEGA Party Lights */}
          <div className="mega-party-light absolute top-4 left-4 w-6 h-6 rounded-full"></div>
          <div className="mega-party-light absolute top-4 right-4 w-6 h-6 rounded-full"></div>
          <div className="mega-party-light absolute bottom-4 left-4 w-6 h-6 rounded-full"></div>
          <div className="mega-party-light absolute bottom-4 right-4 w-6 h-6 rounded-full"></div>
          <div className="mega-party-light absolute top-1/4 left-1/4 w-4 h-4 rounded-full"></div>
          <div className="mega-party-light absolute top-1/4 right-1/4 w-4 h-4 rounded-full"></div>
          <div className="mega-party-light absolute bottom-1/4 left-1/4 w-4 h-4 rounded-full"></div>
          <div className="mega-party-light absolute bottom-1/4 right-1/4 w-4 h-4 rounded-full"></div>

          <div className="mega-party-booth w-full max-w-5xl mx-auto h-full max-h-screen overflow-y-auto">
            <div className="p-4 md:p-6">
              {/* MEGA Celebration Header */}
              <div className="text-center mb-6">
                <h1 className="mega-celebration-message among-font text-3xl md:text-5xl font-black text-yellow-400 mb-4">
                  🎉🎊 ULTIMATE SPACE PARTY! 🎊🎉
                </h1>
                
                {/* COUNTDOWN TIMER */}
                <div className="countdown-timer among-font text-center mb-4">
                  {celebrationCounter}
                </div>
                
                <div className="among-font text-xl md:text-2xl font-bold text-white mb-2">
                  GET READY TO CELEBRATE!
                </div>
                <div className="game-font text-base md:text-lg text-green-400 mb-4">
                  🎪 THE BIGGEST PARTY IN THE GALAXY! 🎪
                </div>
              </div>

              {/* MEGA Selected Victim Display */}
              <div className="text-center mb-6 p-6 bg-gradient-to-r from-red-900/30 via-pink-900/30 to-red-900/30 border-4 border-red-400/60 rounded-2xl">
                <div className="flex justify-center mb-4">
                  <div
                    className="crewmate-bean-big"
                    style={{
                      backgroundColor: CREWMATE_COLORS[members.indexOf(result) % CREWMATE_COLORS.length],
                      animation: 'crazyDance1 0.4s ease-in-out infinite alternate'
                    }}
                  ></div>
                </div>
                
                {/* MEGA NAME DISPLAY */}
                <div className="mega-name-display impostor-text mb-4">
                  {result.toUpperCase()}
                </div>
                
                <div className="among-font text-2xl md:text-3xl font-bold text-yellow-300 mb-3">
                  🚀 IS GOING ON THE ULTIMATE SPACE ADVENTURE! 🚀
                </div>
                
                <div className="game-font text-sm md:text-lg text-cyan-300 px-4 leading-relaxed">
                  {roastLine}
                </div>
              </div>

              {/* CRAZY Dancing Crewmates */}
              <div className="mb-6">
                <h3 className="among-font text-xl md:text-2xl font-bold text-center text-cyan-400 mb-4">
                  🕺💃 CREW GOING ABSOLUTELY WILD! 💃🕺
                </h3>
                <div className="flex flex-wrap justify-center gap-4 max-h-48 overflow-y-auto">
                  {remainingCrewmates.slice(0, 20).map((member, idx) => {
                    const danceClass = `crazy-dancing-${(idx % 6) + 1}`;
                    const crewmateColor = CREWMATE_COLORS[(members.indexOf(member)) % CREWMATE_COLORS.length];
                    
                    return (
                      <div key={member} className="text-center flex-shrink-0">
                        <div
                          className={`crewmate-mini ${danceClass}`}
                          style={{ backgroundColor: crewmateColor }}
                        ></div>
                        <div className="game-font text-sm text-white mt-1 font-bold max-w-[50px] truncate">
                          {member}
                        </div>
                        <div className="text-sm">
                          {PARTY_EMOJIS[Math.floor(Math.random() * PARTY_EMOJIS.length)]}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ULTIMATE Party Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={handleConfirmElimination}
                  disabled={!canConfirm}
                  className={`ultimate-party-button px-8 py-4 text-white rounded-2xl transition-all duration-300 among-font ${
                    canConfirm ? 'hover:scale-110' : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  {canConfirm ? '🚀🎊 LAUNCH THE ULTIMATE PARTY! 🎊🚀' : `PARTY PREP... ${celebrationCounter}s`}
                </button>
                
                <button
                  onClick={handleUndo}
                  className="px-6 py-4 bg-gray-700 hover:bg-gray-600 border-4 border-gray-500 text-white font-bold text-lg rounded-2xl transition-all duration-300 hover:scale-105 among-font"
                >
                  😅 CANCEL THE PARTY!
                </button>
              </div>

              <div className="text-center mt-6">
                <div className="game-font text-lg md:text-xl text-purple-300 leading-relaxed">
                  🎪✨ THE CREW IS HAVING THE TIME OF THEIR LIVES! ✨🎪
                  <br />
                  🌟 THIS IS THE BIGGEST CELEBRATION IN SPACE HISTORY! 🌟
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MEGA Ejection Sequence */}
      {showReveal && result && votePhase === 'ejecting' && (
        <div className="mega-party-backdrop absolute inset-0 z-50 flex items-center justify-center p-4">
          <div className="text-center w-full max-w-4xl mx-auto">
            {/* Crazy Dancing Crewmates Watching */}
            <div className="mb-8">
              <div className="flex justify-center gap-2 mb-4 flex-wrap">
                {remainingCrewmates.slice(0, 15).map((member, idx) => (
                  <div
                    key={member}
                    className={`crewmate-mini crazy-dancing-${(idx % 6) + 1}`}
                    style={{
                      backgroundColor: CREWMATE_COLORS[(members.indexOf(member)) % CREWMATE_COLORS.length],
                      transform: 'scale(1)'
                    }}
                  ></div>
                ))}
              </div>
              <div className="mega-celebration-message among-font text-3xl md:text-4xl font-bold text-orange-400 mb-2">
                🎉🚀 FAREWELL SPACE HERO! 🚀🎉
              </div>
              <div className="game-font text-xl md:text-2xl text-yellow-300">
                🌟 YOU'RE GOING TO BE THE BRIGHTEST STAR! 🌟
              </div>
            </div>

            {/* MEGA Ejecting Crewmate */}
            <div className="ejection-launch mb-8">
              <div
                className="crewmate-bean-big mx-auto"
                style={{
                  backgroundColor: CREWMATE_COLORS[members.indexOf(result) % CREWMATE_COLORS.length]
                }}
              ></div>
            </div>
            
            <div className="mega-name-display among-font text-white mb-4">
              {result.toUpperCase()}
            </div>
            <div className="among-font text-2xl md:text-3xl font-black text-red-400 mb-3">
              IS LAUNCHING INTO SPACE!
            </div>
            <div className="game-font text-xl text-gray-300">
              🚀✨ THE ULTIMATE SPACE ADVENTURE BEGINS! ✨🚀
            </div>
          </div>
        </div>
      )}

      {/* MEGA Floating in Space */}
      {showReveal && result && votePhase === 'floating' && (
        <div className="mega-party-backdrop absolute inset-0 z-50 flex items-center justify-center p-4">
          <div className="text-center w-full max-w-4xl mx-auto">
            {/* MEGA Final celebration */}
            <div className="mb-8">
              <div className="mega-celebration-message among-font text-4xl md:text-5xl font-bold text-green-400 mb-6">
                🎊🏆 MISSION ACCOMPLISHED! 🏆🎊
              </div>
              <div className="flex justify-center gap-2 flex-wrap mb-6">
                {remainingCrewmates.slice(0, 18).map((member, idx) => (
                  <div
                    key={member}
                    className={`crewmate-mini crazy-dancing-${(idx % 6) + 1}`}
                    style={{
                      backgroundColor: CREWMATE_COLORS[(members.indexOf(member)) % CREWMATE_COLORS.length],
                      transform: 'scale(0.8)'
                    }}
                  ></div>
                ))}
              </div>
            </div>

            {/* MEGA Floating Crewmate */}
            <div className="space-float mb-8">
              <div
                className="crewmate-bean-big mx-auto opacity-60"
                style={{
                  backgroundColor: CREWMATE_COLORS[members.indexOf(result) % CREWMATE_COLORS.length]
                }}
              ></div>
            </div>
            
            <div className="space-y-4">
              <div className="mega-name-display among-font text-red-400">
                {result.toUpperCase()}
              </div>
              <div className="mega-celebration-message game-font text-3xl md:text-4xl text-white">
                🌟⭐ IS NOW THE BRIGHTEST STAR IN THE GALAXY! ⭐🌟
              </div>
              <div className="game-font text-xl md:text-2xl text-purple-300 leading-relaxed max-w-3xl mx-auto">
                🎭🎪 THE ENTIRE CREW CELEBRATES THIS LEGENDARY SPACE ADVENTURE! 🎪🎭
                <br />
                🏆✨ THIS WILL BE REMEMBERED FOREVER IN SPACE HISTORY! ✨🏆
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Emergency Meeting Interface */}
      {!showReveal && (
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
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-red-800 border-2 border-red-400/50 shadow-lg flex items-center justify-center emergency-light">
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
                        <div className="emergency-light w-2 h-2 rounded-full"></div>
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
                  {spinning ? "VOTING..." : "🎪 CALL MEGA PARTY VOTE! 🎪"}
                </button>

                <div className="p-3 bg-red-900/20 border border-red-700/30 rounded-xl">
                  <p className="game-font text-xs text-red-200">
                    🎉 MEGA PARTY protocol will select a crewmate for the ULTIMATE SPACE ADVENTURE! 
                    Get ready for the BIGGEST celebration in galaxy history! 🎊
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
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
    </div>
  );
}
