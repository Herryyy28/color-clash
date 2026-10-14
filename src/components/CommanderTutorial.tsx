import React, { useState } from 'react';

interface CommanderTutorialProps {
  message: string;
  onDismiss: () => void;
  showHandHint?: boolean;
}

export const CommanderTutorial: React.FC<CommanderTutorialProps> = ({
  message,
  onDismiss,
  showHandHint = true,
}) => {
  const [closed, setClosed] = useState(false);

  if (closed) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-40 flex flex-col justify-end pb-32 px-3">
      {/* Animated Cartoon Gloved Hand Dragging Hint (matching frames 39.5s, 142.1s, 150.0s) */}
      {showHandHint && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative animate-bounce">
            <svg viewBox="0 0 64 64" className="w-16 h-16 drop-shadow-[0_8px_16px_rgba(10,30,80,0.5)] filter">
              {/* White Cartoon Glove with Pointing Index Finger */}
              <path
                d="M32 10 C32 6, 38 6, 38 10 L38 28 C40 26, 44 26, 44 30 L44 33 C46 31, 50 31, 50 35 L50 38 C52 37, 55 38, 55 42 C55 52, 44 58, 36 58 C26 58, 22 50, 22 42 L22 36 C22 32, 28 32, 28 36 L28 26 C28 22, 32 22, 32 26 Z"
                fill="#ffffff"
                stroke="#133785"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              {/* Glove fold cuff lines */}
              <path d="M26 54 L46 54" stroke="#133785" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      )}

      {/* Mascot Robot & Speech Bubble matching frames 31.6s and 134.2s */}
      <div className="relative flex items-end justify-end gap-1 pointer-events-auto">
        {/* Large Rounded Comic Speech Bubble */}
        <div
          onClick={() => {
            setClosed(true);
            onDismiss();
          }}
          className="flex-1 max-w-[260px] bg-white text-blue-950 p-3 rounded-2xl rounded-br-none shadow-[0_10px_25px_rgba(10,30,80,0.35)] border-2 border-[#133785] cursor-pointer relative animate-in fade-in slide-in-from-bottom-3"
        >
          <div className="font-black text-sm leading-snug tracking-tight text-blue-950">
            {message}
          </div>
          <div className="flex justify-between items-center mt-2 pt-1 border-t border-blue-100 text-[9px] text-blue-400 font-black uppercase">
            <span>Tap to close</span>
            <span className="text-[#0284c7]">Got it! ➔</span>
          </div>

          {/* Speech bubble pointy tail pointing to Commander's head */}
          <div className="absolute -bottom-2 right-5 w-4 h-4 bg-white border-r-2 border-b-2 border-[#133785] transform rotate-45" />
        </div>

        {/* Stylized Fantasy Royal Paladin Commander Mascot */}
        <div className="relative w-20 h-20 flex-shrink-0 animate-in fade-in zoom-in-95">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_8px_16px_rgba(10,30,80,0.5)]">
            <defs>
              <linearGradient id="tutHelm" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e2e8f0" />
                <stop offset="50%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#475569" />
              </linearGradient>
              <linearGradient id="tutGold" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fde047" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
            </defs>
            {/* Blue Cape / Pauldrons */}
            <path d="M20 72 L80 72 L90 98 L10 98 Z" fill="#1e40af" stroke="#172554" strokeWidth="2.5" />
            <circle cx="28" cy="74" r="7" fill="url(#tutGold)" />
            <circle cx="72" cy="74" r="7" fill="url(#tutGold)" />
            {/* Plume / Feathers */}
            <path d="M50 8 C42 16 40 28 44 36 C48 30 54 28 50 8 Z" fill="#38bdf8" />
            <path d="M50 8 C58 16 60 28 56 36 C52 30 46 28 50 8 Z" fill="#2563eb" />
            {/* Paladin Helmet Shell */}
            <ellipse cx="50" cy="46" rx="34" ry="30" fill="url(#tutHelm)" stroke="#1e293b" strokeWidth="2.5" />
            {/* Gold Crown Rim */}
            <path d="M22 38 L78 38 L74 44 L26 44 Z" fill="url(#tutGold)" stroke="#b45309" strokeWidth="1" />
            {/* Visor Slit */}
            <path d="M28 50 L72 50 L68 60 L32 60 Z" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
            {/* Heroic Glowing Blue Eyes */}
            <line x1="34" y1="55" x2="46" y2="55" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
            <line x1="54" y1="55" x2="66" y2="55" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
            <line x1="50" y1="46" x2="50" y2="64" stroke="url(#tutGold)" strokeWidth="2" />
          </svg>
        </div>
      </div>
    </div>
  );
};
