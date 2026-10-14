import React, { useState } from 'react';
import { BattleEvent } from '../types';
import { ShieldAlert, Swords, ChevronDown, ChevronUp, Bell } from 'lucide-react';

interface BattleLogProps {
  events: BattleEvent[];
  maxEvents?: number;
  className?: string;
}

export const BattleLog: React.FC<BattleLogProps> = ({
  events,
  maxEvents = 5,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Take the last 5 major combat events
  const displayedEvents = events.slice(0, maxEvents);
  const latestEvent = displayedEvents[0];

  return (
    <div
      className={`absolute top-2 left-2 z-20 pointer-events-auto max-w-[210px] sm:max-w-[240px] select-none transition-all duration-300 ${className}`}
    >
      {/* Header / Toggle Pill with Responsive Flexbox and Light-Blue Gradient */}
      <button
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-[#1e5ecc]/95 via-[#2b72f5]/90 to-[#1e5ecc]/95 hover:from-[#256cf0] hover:to-[#387bf8] active:scale-[0.98] border border-sky-300/80 shadow-[0_4px_14px_rgba(30,95,220,0.4)] backdrop-blur-md cursor-pointer transition text-left"
        title="Toggle Battle Log"
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-5 h-5 rounded-lg bg-gradient-to-tr from-[#0284c7] to-[#38bdf8] border border-white/80 flex items-center justify-center shrink-0 shadow-sm">
            <Swords className="w-3 h-3 text-white drop-shadow" />
          </div>
          <span className="text-[11px] font-black text-white tracking-wide truncate drop-shadow-sm">
            Battle Log
          </span>
          {displayedEvents.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-gradient-to-r from-yellow-300 to-amber-400 text-amber-950 border border-white/60 shadow-xs">
              {displayedEvents.length}
            </span>
          )}
        </div>

        <div className="text-sky-200 hover:text-white shrink-0">
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </div>
      </button>

      {/* Collapsed Compact Preview Pill */}
      {!isExpanded && latestEvent && (
        <div className="mt-1 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gradient-to-r from-[#174eb6]/90 to-[#2263e6]/90 border border-sky-300/60 shadow-md backdrop-blur-md animate-in fade-in slide-in-from-top-1 duration-200">
          <span className="text-xs shrink-0 select-none">{latestEvent.icon || '⚔️'}</span>
          <span className="text-[10px] font-extrabold text-white truncate leading-tight">
            {latestEvent.text}
          </span>
        </div>
      )}

      {/* Expanded Combat Events List - Light-Blue Gradient Container, No Dark Gray or Black */}
      {isExpanded && (
        <div className="mt-1.5 flex flex-col gap-1 p-1.5 rounded-xl bg-gradient-to-b from-[#1b5bd6]/92 via-[#2167ec]/88 to-[#174eb6]/92 border border-sky-300/80 shadow-[0_6px_20px_rgba(27,91,214,0.45)] backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200">
          {displayedEvents.length === 0 ? (
            <div className="flex items-center gap-1.5 p-2 rounded-lg bg-gradient-to-r from-[#205cd4]/50 to-[#184bb2]/50 border border-sky-200/30 text-sky-100 text-[10px] font-bold">
              <Bell className="w-3.5 h-3.5 text-sky-200 shrink-0 animate-pulse" />
              <span>Awaiting combat events...</span>
            </div>
          ) : (
            displayedEvents.map((event, idx) => {
              const isBlue = event.team === 'blue';
              const isRed = event.team === 'red';

              // Visual styling per team & event type using vibrant light-blue gradient theme
              const rowBorder = isBlue
                ? 'border-l-4 border-l-sky-300 border-sky-300/40 bg-gradient-to-r from-[#2a75f8]/70 via-[#205ece]/60 to-[#1b50be]/60'
                : isRed
                ? 'border-l-4 border-l-rose-400 border-rose-300/40 bg-gradient-to-r from-[#be185d]/45 via-[#2563eb]/50 to-[#1e52c2]/60'
                : 'border-l-4 border-l-amber-300 border-amber-300/40 bg-gradient-to-r from-[#d97706]/40 via-[#2563eb]/50 to-[#1e52c2]/60';

              const teamBadge = isBlue
                ? 'bg-sky-400/30 text-sky-100 border-sky-300/50'
                : isRed
                ? 'bg-rose-400/30 text-rose-100 border-rose-300/50'
                : 'bg-amber-400/30 text-amber-100 border-amber-300/50';

              return (
                <div
                  key={event.id || `${event.timestamp}-${idx}`}
                  className={`flex items-start gap-1.5 p-1.5 rounded-lg border text-white shadow-xs transition-all ${rowBorder} ${
                    idx === 0 ? 'ring-1 ring-white/50 animate-in fade-in zoom-in-95' : ''
                  }`}
                >
                  {/* Event Icon */}
                  <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center shrink-0 text-xs shadow-xs">
                    {event.icon || (event.type === 'turret_destroyed' ? '💥' : '🚩')}
                  </div>

                  {/* Event Description */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-black leading-tight truncate drop-shadow-sm">
                        {event.text}
                      </span>
                      {idx === 0 && (
                        <span className="text-[8px] font-black text-yellow-300 bg-yellow-500/30 px-1 rounded-sm leading-tight uppercase shrink-0">
                          New
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 mt-0.5">
                      <span
                        className={`text-[8px] font-bold px-1 rounded-sm border uppercase leading-tight ${teamBadge}`}
                      >
                        {isBlue ? 'Blue' : isRed ? 'Red' : 'Arena'}
                      </span>
                      {event.subtext && (
                        <span className="text-[8px] text-sky-200/90 truncate leading-tight font-medium">
                          {event.subtext}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
