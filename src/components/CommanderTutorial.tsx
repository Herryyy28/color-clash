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
    <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-end pb-28 px-4">
      {/* Animated Dragging Hand Hint */}
      {showHandHint && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative animate-bounce">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/60 animate-ping absolute -top-2 -left-2" />
            <div className="text-4xl filter drop-shadow-lg transform -rotate-12 translate-y-8">
              👆
            </div>
          </div>
        </div>
      )}

      {/* Comic Speech Bubble & Mascot Commander */}
      <div className="relative flex items-end justify-between gap-2 pointer-events-auto">
        {/* Speech Bubble */}
        <div
          onClick={() => {
            setClosed(true);
            onDismiss();
          }}
          className="flex-1 bg-white text-slate-900 p-3.5 rounded-2xl rounded-br-none shadow-2xl border-2 border-slate-900 cursor-pointer relative animate-in fade-in slide-in-from-bottom-2"
        >
          <div className="font-black text-sm leading-snug tracking-tight">
            {message.split(' ').map((word, i) => {
              if (word.includes('RED')) {
                return <span key={i} className="text-rose-600 font-extrabold">{word} </span>;
              }
              if (word.includes('BLUE')) {
                return <span key={i} className="text-blue-600 font-extrabold">{word} </span>;
              }
              if (word.includes('SAW')) {
                return <span key={i} className="text-amber-500 font-extrabold">{word} </span>;
              }
              return <span key={i}>{word} </span>;
            })}
          </div>
          <div className="flex justify-between items-center mt-2 pt-1 border-t border-slate-200 text-[10px] text-slate-400 font-bold uppercase">
            <span>Tap to continue</span>
            <span className="text-blue-600 font-black">Got it! ➔</span>
          </div>

          {/* Speech bubble tail pointing to commander */}
          <div className="absolute -bottom-2 right-4 w-4 h-4 bg-white border-r-2 border-b-2 border-slate-900 transform rotate-45" />
        </div>

        {/* Commander Character Icon (Matching the robot with red cannon snout from video) */}
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl border-2 border-sky-400 p-1 flex items-center justify-center shadow-2xl relative">
            {/* Robot Head Artwork */}
            <div className="relative w-full h-full bg-indigo-950 rounded-xl flex items-center justify-center overflow-hidden">
              {/* Knight Helmet Visor */}
              <div className="absolute top-1 inset-x-2 h-4 bg-slate-800 rounded-md border border-slate-600 flex items-center justify-around px-1">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
              </div>

              {/* Red Cannon Snout */}
              <div className="absolute bottom-1 w-7 h-7 bg-red-600 rounded-full border-2 border-red-400 flex items-center justify-center shadow-inner">
                <div className="w-3.5 h-3.5 bg-red-950 rounded-full" />
              </div>
            </div>
          </div>
          <span className="text-[10px] font-black text-sky-400 bg-slate-950 px-1.5 py-0.5 rounded-md mt-0.5 border border-slate-800">
            COMMANDER
          </span>
        </div>
      </div>
    </div>
  );
};
