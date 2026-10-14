import React from 'react';
import { X, RefreshCw, Trophy, Shield, Zap, Flame, Award, Cpu } from 'lucide-react';
import { PlayerProfile, Card } from '../types';
import { deckStrengthCalculator } from '../services/deckStrengthCalculator';
import { playerProgressionService } from '../services/playerProgressionService';
import { matchmakingService } from '../services/matchmakingService';
import { sectorManager } from '../services/sectorManager';

interface MatchmakingDebugPanelProps {
  isOpen: boolean;
  onClose: () => void;
  playerProfile: PlayerProfile;
  activeDeck: Card[];
  selectedSectorIndex: number;
  onUpdateProfile: (updated: Partial<PlayerProfile>) => void;
}

export const MatchmakingDebugPanel: React.FC<MatchmakingDebugPanelProps> = ({
  isOpen,
  onClose,
  playerProfile,
  activeDeck,
  selectedSectorIndex,
  onUpdateProfile,
}) => {
  if (!isOpen) return null;

  const deckAnalysis = deckStrengthCalculator.calculate(activeDeck);
  const winRate = playerProgressionService.getRecentWinRate(playerProfile);
  const isBeginnerProtected = playerProgressionService.isBeginnerProtectionActive(playerProfile);
  const currentSector = sectorManager.getSectorByIndex(selectedSectorIndex);
  const matchup = matchmakingService.findMatchup(
    currentSector.sectorId,
    playerProfile,
    deckAnalysis.totalRating
  );

  const simulateWinStreak = () => {
    onUpdateProfile({
      recentResults: ['win', 'win', 'win'],
      difficultyAdjustment: 1,
      trophies: playerProfile.trophies + 90,
      matchesPlayed: (playerProfile.matchesPlayed || 0) + 3,
      wins: (playerProfile.wins || 0) + 3,
    });
  };

  const simulateLossStreak = () => {
    onUpdateProfile({
      recentResults: ['loss', 'loss', 'loss'],
      difficultyAdjustment: -1,
      matchesPlayed: (playerProfile.matchesPlayed || 0) + 3,
      losses: (playerProfile.losses || 0) + 3,
    });
  };

  const resetProgression = () => {
    onUpdateProfile({
      trophies: 0,
      matchesPlayed: 0,
      wins: 0,
      losses: 0,
      recentResults: [],
      skillRating: 350,
      highestSectorUnlocked: 1,
      difficultyAdjustment: 0,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 select-none font-mono text-xs text-sky-200">
      <div className="relative w-full max-w-sm bg-[#0c1f38] border-2 border-amber-400 rounded-2xl p-4 shadow-2xl flex flex-col gap-3 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#234d82] pb-2">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold">
            <Cpu className="w-4 h-4" />
            <span>MATCHMAKING TELEMETRY</span>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded bg-[#17345D] flex items-center justify-center text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Telemetry Metrics */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#122b4d] p-2 rounded border border-[#234d82]">
            <span className="text-[10px] text-gray-400 block">Trophies</span>
            <span className="text-sm font-bold text-amber-300">{playerProfile.trophies} 🏆</span>
          </div>

          <div className="bg-[#122b4d] p-2 rounded border border-[#234d82]">
            <span className="text-[10px] text-gray-400 block">Skill MMR</span>
            <span className="text-sm font-bold text-emerald-300">{playerProfile.skillRating || 350}</span>
          </div>

          <div className="bg-[#122b4d] p-2 rounded border border-[#234d82]">
            <span className="text-[10px] text-gray-400 block">Deck Power Rating</span>
            <span className="text-sm font-bold text-sky-300">{deckAnalysis.totalRating} ({deckAnalysis.tierLabel})</span>
          </div>

          <div className="bg-[#122b4d] p-2 rounded border border-[#234d82]">
            <span className="text-[10px] text-gray-400 block">Rolling Win Rate</span>
            <span className="text-sm font-bold text-yellow-300">{winRate}% ({playerProfile.recentResults?.length || 0} games)</span>
          </div>
        </div>

        {/* Matchup Diagnostics */}
        <div className="bg-[#122b4d] p-2.5 rounded border border-[#234d82] flex flex-col gap-1 text-[11px]">
          <span className="text-amber-300 font-bold">Current Sector: {currentSector.name} (Sec {currentSector.sectorId})</span>
          <div>Beginner Protection: <strong className={isBeginnerProtected ? 'text-emerald-400' : 'text-gray-400'}>{isBeginnerProtected ? 'ACTIVE (Safe Cadet)' : 'Inactive'}</strong></div>
          <div>Effective AI Tier: <strong className="text-amber-300 uppercase">{matchup.difficultyTier}</strong></div>
          <div>Decision Cadence: <strong className="text-white">{matchup.aiConfig.decisionIntervalMs}ms</strong></div>
          <div>AI Initial Energy: <strong className="text-white">{matchup.aiConfig.initialEnergy}</strong></div>
          <div>Lane Wipe Allowed: <strong className={matchup.aiConfig.canUseSawLanePierce ? 'text-rose-400' : 'text-emerald-400'}>{matchup.aiConfig.canUseSawLanePierce ? 'Yes' : 'No (Protected)'}</strong></div>
          <div>Adaptive Offset: <strong className="text-white">{playerProfile.difficultyAdjustment || 0}</strong></div>
        </div>

        {/* Simulation Controls */}
        <div className="flex flex-col gap-1.5 pt-1 border-t border-[#234d82]">
          <span className="text-[10px] text-gray-400">Simulate Performance Streaks:</span>
          <div className="flex gap-2">
            <button
              onClick={simulateWinStreak}
              className="flex-1 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded font-bold cursor-pointer"
            >
              +3 Win Streak
            </button>
            <button
              onClick={simulateLossStreak}
              className="flex-1 py-1.5 bg-rose-800 hover:bg-rose-700 text-white rounded font-bold cursor-pointer"
            >
              +3 Loss Streak
            </button>
          </div>
          <button
            onClick={resetProgression}
            className="py-1 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded font-bold cursor-pointer mt-1"
          >
            Reset to Fresh Beginner
          </button>
        </div>

      </div>
    </div>
  );
};
