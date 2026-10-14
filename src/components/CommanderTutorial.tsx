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

        {/* Purple/Indigo Robot Commander with prominent Red Cannon Snout */}
        <div className="relative w-20 h-20 flex-shrink-0 animate-in fade-in zoom-in-95">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_8px_16px_rgba(10,30,80,0.5)]">
            {/* Robot Body / Armor */}
            <path d="M25 70 L75 70 L85 95 L15 95 Z" fill="#4338ca" stroke="#1e1b4b" strokeWidth="2.5" />
            {/* Dark Knight Visor Helmet */}
            <ellipse cx="50" cy="45" rx="36" ry="32" fill="#312e81" stroke="#1e1b4b" strokeWidth="3" />
            {/* Helmet Visor rim */}
            <path d="M18 42 C18 28, 82 28, 82 42 L84 52 L16 52 Z" fill="#1e1b4b" />
            {/* Visor Cyan Goggles / Eye Slits */}
            <rect x="26" y="38" width="16" height="5" rx="2" fill="#22d3ee" className="animate-pulse" />
            <rect x="58" y="38" width="16" height="5" rx="2" fill="#22d3ee" className="animate-pulse" />
            {/* Large Red Cylindrical Cannon Snout (Signature element from video) */}
            <ellipse cx="50" cy="58" rx="16" ry="12" fill="#dc2626" stroke="#991b1b" strokeWidth="2.5" />
            <ellipse cx="50" cy="58" rx="11" ry="8" fill="#7f1d1d" stroke="#540c17" strokeWidth="2" />
            <ellipse cx="50" cy="58" rx="6" ry="4" fill="#991b1b" />
          </svg>
        </div>
      </div>
    </div>
  );
};
