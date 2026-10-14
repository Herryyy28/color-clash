import React, { useState, useEffect, useRef } from 'react';
import {
  Trophy,
  Shield,
  Lock,
  Swords,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  X,
  Sparkles,
  Zap,
  Gift,
  Coins,
  Crown,
  Info,
  Scale,
  Flame,
  Check,
} from 'lucide-react';
import { PlayerProfile, SectorConfig, Card } from '../types';
import { sectorManager } from '../services/sectorManager';
import { deckStrengthCalculator } from '../services/deckStrengthCalculator';
import { matchmakingService, OpponentMatchup } from '../services/matchmakingService';
import { renderAvatarSvg } from './AvatarSelectionModal';
import { sounds } from '../audio';

interface SectorSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerProfile: PlayerProfile;
  activeDeck: Card[];
  selectedSectorIndex: number;
  onSelectSector: (sectorIndex: number) => void;
  onStartBattleWithSector: (sectorIndex: number, exactMatchup: OpponentMatchup) => void;
}

export const SectorSelectionModal: React.FC<SectorSelectionModalProps> = ({
  isOpen,
  onClose,
  playerProfile,
  activeDeck,
  selectedSectorIndex,
  onSelectSector,
  onStartBattleWithSector,
}) => {
  const [activeViewingIndex, setActiveViewingIndex] = useState(selectedSectorIndex);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Synchronize viewing index when opened
  useEffect(() => {
    if (isOpen) {
      setActiveViewingIndex(selectedSectorIndex);
      setIsSubmitting(false);
    }
  }, [isOpen, selectedSectorIndex]);

  // Compute deck analysis
  const deckAnalysis = deckStrengthCalculator.calculate(activeDeck);
  const allSectors = sectorManager.getAllSectors();
  const recommendedSector = sectorManager.getRecommendedSector(
    playerProfile.trophies,
    deckAnalysis.totalRating
  );

  const viewingSector = allSectors[activeViewingIndex] || allSectors[0];
  const isUnlocked = sectorManager.isSectorUnlocked(viewingSector.sectorId, playerProfile.trophies);
  const isRecommended = viewingSector.sectorId === recommendedSector.sectorId;
  const isCleared = playerProfile.clearedSectors?.includes(viewingSector.sectorId) ?? false;

  // Authoritative Matchmaking Preview - Evaluated for currently viewed sector
  const [previewMatchup, setPreviewMatchup] = useState<OpponentMatchup>(() =>
    matchmakingService.findMatchup(viewingSector.sectorId, playerProfile, deckAnalysis.totalRating)
  );

  // Invalidate and recalculate preview whenever viewed sector, deck power, or profile changes
  useEffect(() => {
    if (!isOpen) return;
    const matchup = matchmakingService.findMatchup(
      viewingSector.sectorId,
      playerProfile,
      deckAnalysis.totalRating
    );
    setPreviewMatchup(matchup);
  }, [viewingSector.sectorId, playerProfile.trophies, playerProfile.skillRating, deckAnalysis.totalRating, isOpen]);

  // Scroll active card into view in horizontal carousel
  const scrollCarousel = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    const scrollAmount = direction === 'left' ? -120 : 120;
    carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  if (!isOpen) return null;

  const unlockedCount = allSectors.filter((s) => playerProfile.trophies >= s.requiredTrophies).length;

  const handleSectorCardClick = (idx: number) => {
    sounds.playClick();
    setActiveViewingIndex(idx);
    if (sectorManager.isSectorUnlocked(allSectors[idx].sectorId, playerProfile.trophies)) {
      onSelectSector(idx);
    }
  };

  const handleStartBattle = () => {
    if (!isUnlocked || isSubmitting) {
      sounds.playCardDrop();
      return;
    }
    // Prevent duplicate clicks
    setIsSubmitting(true);
    sounds.playBattleHorns();
    onSelectSector(activeViewingIndex);
    onClose();
    // Pass the EXACT previewed matchup directly into battle initialization
    onStartBattleWithSector(activeViewingIndex, previewMatchup);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-[#071940]/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none animate-in fade-in duration-200 safe-pt safe-pb safe-pl safe-pr"
    >
      <div className="relative w-full max-w-md h-[96dvh] max-h-[840px] bg-gradient-to-b from-[#17345D] via-[#122847] to-[#0a182d] border-2 border-[#FFC83D] rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden font-body">
        
        {/* ======================================================== */}
        {/* 1. ROYAL HEADER & PLAYER STATS BADGE                      */}
        {/* ======================================================== */}
        <div className="w-full bg-gradient-to-r from-[#17345D] via-[#1769D2] to-[#17345D] border-b-2 border-[#FFC83D] px-4 py-2.5 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#FFC83D] flex items-center justify-center text-[#17345D] font-black shadow border border-white">
              <Swords className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-display text-white tracking-wide leading-tight drop-shadow">
                BATTLE REALMS
              </h2>
              <span className="text-[10px] font-display text-[#F7E7BE] tracking-widest uppercase">
                Sector Matchmaking Map
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Player Trophies Badge */}
            <div className="flex items-center gap-1.5 bg-[#17345D] border border-[#FFC83D]/80 px-2.5 py-1 rounded-full shadow">
              <Trophy className="w-3.5 h-3.5 text-[#FFC83D] fill-[#FFC83D]" />
              <span className="text-xs font-extrabold text-[#FFC83D] game-counter">
                {playerProfile.trophies}
              </span>
            </div>

            {/* Close Button */}
            <button
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-[#17345D] hover:bg-[#1f457a] border border-[#FFC83D] flex items-center justify-center text-sky-200 hover:text-white cursor-pointer active:scale-95 transition"
              title="Close Map"
              aria-label="Close Battle Realms Map"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Deck Power & Skill Rating Information Row */}
        <div className="bg-[#0f2444] border-b border-[#3b68a8]/60 px-4 py-1.5 flex items-center justify-between text-[11px] shrink-0 text-sky-200">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#FFC83D]" />
            <span>
              Deck Power: <strong className="text-white game-counter font-extrabold">{deckAnalysis.totalRating}</strong> ({deckAnalysis.tierLabel})
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>
              Skill MMR: <strong className="text-[#FFC83D] game-counter font-extrabold">{playerProfile.skillRating || 350}</strong>
            </span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. SCROLLABLE HORIZONTAL SECTOR CAROUSEL TRACK            */}
        {/* ======================================================== */}
        <div className="w-full px-3 py-2 shrink-0 bg-[#0c1f38] border-b border-[#204575]">
          <div className="text-[10px] font-display text-[#F7E7BE] uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Select Battle Sector:</span>
            <span className="text-[#FFC83D] font-extrabold">
              {unlockedCount} / {allSectors.length} UNLOCKED
            </span>
          </div>

          <div className="relative flex items-center">
            {/* Left Carousel Navigation Arrow */}
            <button
              onClick={() => scrollCarousel('left')}
              className="absolute left-0 z-10 w-6 h-12 bg-black/40 hover:bg-black/70 text-white rounded-r flex items-center justify-center cursor-pointer opacity-75 hover:opacity-100 transition"
              title="Scroll Left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Horizontal Track */}
            <div
              ref={carouselRef}
              className="flex items-center gap-2 overflow-x-auto px-4 pb-1 scroll-touch scrollbar-none snap-x"
            >
              {allSectors.map((sector, index) => {
                const unlocked = playerProfile.trophies >= sector.requiredTrophies;
                const isSelected = activeViewingIndex === index;
                const isRec = sector.sectorId === recommendedSector.sectorId;

                return (
                  <button
                    key={sector.sectorId}
                    onClick={() => handleSectorCardClick(index)}
                    className={`relative flex-shrink-0 w-24 sm:w-28 py-2 px-2 rounded-2xl flex flex-col items-center text-center transition-all cursor-pointer border-2 snap-center ${
                      isSelected
                        ? 'bg-gradient-to-b from-[#1c75e8] to-[#17345D] border-[#FFC83D] shadow-[0_4px_16px_rgba(255,200,61,0.5)] scale-105 z-10'
                        : unlocked
                        ? 'bg-[#17345D] border-[#3b68a8] hover:border-[#FFC83D]/60 opacity-90'
                        : 'bg-[#0f213a] border-gray-700 opacity-60'
                    }`}
                  >
                    {/* Recommended Ribbon */}
                    {isRec && (
                      <span className="absolute -top-2 bg-[#79B957] text-[#0f2d04] text-[8px] font-display px-1.5 py-0.2 rounded-full border border-white font-black shadow">
                        RECOMMENDED
                      </span>
                    )}

                    {/* Icon Emblem */}
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-white/10 to-transparent flex items-center justify-center text-lg mb-1">
                      {unlocked ? sector.arenaTheme.icon : <Lock className="w-4 h-4 text-gray-400" />}
                    </div>

                    {/* Sector Title */}
                    <span className="text-[10px] font-display text-white truncate w-full leading-tight">
                      Sector {sector.sectorId}
                    </span>
                    <span className="text-[9px] text-[#F7E7BE] truncate w-full">
                      {sector.name}
                    </span>

                    {/* Difficulty Tag */}
                    <span
                      className="text-[8px] font-display uppercase px-1.5 py-0.2 rounded mt-1 font-black"
                      style={{
                        backgroundColor: `${sector.difficultyColor}25`,
                        color: sector.difficultyColor,
                        border: `1px solid ${sector.difficultyColor}60`,
                      }}
                    >
                      {sector.difficultyLabel}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right Carousel Navigation Arrow */}
            <button
              onClick={() => scrollCarousel('right')}
              className="absolute right-0 z-10 w-6 h-12 bg-black/40 hover:bg-black/70 text-white rounded-l flex items-center justify-center cursor-pointer opacity-75 hover:opacity-100 transition"
              title="Scroll Right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. VERTICALLY SCROLLABLE SECTOR DETAIL & PREVIEW AREA     */}
        {/* ======================================================== */}
        <div className="flex-1 w-full p-3 sm:p-4 overflow-y-auto scroll-touch flex flex-col gap-3">
          
          {/* Main Realm Hero Banner */}
          <div
            className="relative w-full rounded-2xl p-3.5 border-2 border-[#FFC83D] shadow-lg flex flex-col justify-between overflow-hidden"
            style={{
              background: `linear-gradient(135deg, #17345D 0%, #1769D2 50%, #0d213d 100%)`,
            }}
          >
            {/* Background Texture & Icon Overlay */}
            <div className="absolute -right-4 -bottom-4 text-7xl opacity-15 pointer-events-none select-none">
              {viewingSector.arenaTheme.icon}
            </div>

            <div className="flex items-start justify-between z-10">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-display text-[#FFC83D] uppercase tracking-wider">
                    Sector {viewingSector.sectorId} Realm
                  </span>
                  {isRecommended && (
                    <span className="bg-[#79B957] text-white text-[9px] font-display px-2 py-0.5 rounded-full border border-white font-extrabold shadow">
                      ⭐ RECOMMENDED FOR YOUR RANK
                    </span>
                  )}
                </div>
                <h3 className="text-xl sm:text-2xl font-display text-white drop-shadow tracking-wide mt-0.5">
                  {viewingSector.name}
                </h3>
                <span className="text-xs text-sky-200 italic font-body">
                  "{viewingSector.subtitle}"
                </span>
              </div>

              {/* Status Badge */}
              <div className="shrink-0">
                {isUnlocked ? (
                  <div className="flex items-center gap-1 bg-[#79B957]/30 border border-[#79B957] text-[#9ae275] text-[10px] font-display px-2.5 py-1 rounded-full font-bold">
                    <CheckCircle2 className="w-3 h-3 text-[#9ae275]" /> Unlocked
                  </div>
                ) : (
                  <div className="flex items-center gap-1 bg-red-950/60 border border-red-500 text-rose-300 text-[10px] font-display px-2.5 py-1 rounded-full font-bold">
                    <Lock className="w-3 h-3 text-rose-400" /> Locked
                  </div>
                )}
              </div>
            </div>

            <p className="text-xs text-sky-100/90 font-body leading-relaxed mt-2 z-10 max-w-sm">
              {viewingSector.description}
            </p>

            {/* Requirement / Progress Bar if locked */}
            {!isUnlocked && (
              <div className="mt-3 bg-[#0a1b33]/90 border border-rose-500/60 rounded-xl p-2.5 z-10">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-rose-200 font-display flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-rose-400" /> Unlock Requirement:
                  </span>
                  <span className="text-[#FFC83D] game-counter font-extrabold">
                    {playerProfile.trophies} / {viewingSector.requiredTrophies} 🏆
                  </span>
                </div>
                <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden p-0.5 border border-rose-400/40">
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 to-amber-400 rounded-full"
                    style={{
                      width: `${Math.min(100, Math.round((playerProfile.trophies / viewingSector.requiredTrophies) * 100))}%`,
                    }}
                  />
                </div>
                <span className="text-[10px] text-rose-200/90 mt-1 block font-body">
                  Earn {viewingSector.requiredTrophies - playerProfile.trophies} more trophies in earlier sectors to challenge this realm!
                </span>
              </div>
            )}
          </div>

          {/* Matched Opponent Preview Card */}
          <div className="bg-[#17345D] border border-[#3b68a8] rounded-2xl p-3 shadow flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-display text-[#FFC83D] flex items-center gap-1 uppercase tracking-wider">
                <Swords className="w-3.5 h-3.5 text-[#FFC83D]" /> Matched Opponent Preview
              </span>
              <span
                className="text-[10px] font-display uppercase px-2 py-0.5 rounded-full font-black"
                style={{
                  backgroundColor: `${viewingSector.difficultyColor}25`,
                  color: viewingSector.difficultyColor,
                  border: `1px solid ${viewingSector.difficultyColor}`,
                }}
              >
                {previewMatchup.difficultyLabel} AI
              </span>
            </div>

            <div className="flex items-center justify-between bg-[#0f2444] rounded-xl p-2.5 border border-[#204575]">
              <div className="flex items-center gap-2.5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-b from-[#F04452] to-[#7f1d1d] border-2 border-[#FFC83D] flex items-center justify-center p-0.5 shrink-0 shadow">
                  {renderAvatarSvg(previewMatchup.avatarId, 'w-9 h-9')}
                </div>
                <div>
                  <h4 className="text-sm font-display text-white leading-tight">
                    {previewMatchup.name}
                  </h4>
                  <span className="text-[10px] text-sky-200 block">
                    {previewMatchup.title} • Card Lvl {previewMatchup.cardLevel}
                  </span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Trophy className="w-3 h-3 text-[#FFC83D] fill-[#FFC83D]" />
                    <span className="text-xs font-extrabold text-[#FFC83D] game-counter">
                      ~{previewMatchup.trophies} 🏆
                    </span>
                    <span className="text-[9px] text-sky-300 ml-1">
                      (Reward: +{previewMatchup.potentialTrophyGain} | Risk: {previewMatchup.potentialTrophyLoss === 0 ? '0 🏆' : `-${previewMatchup.potentialTrophyLoss} 🏆`})
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col text-right shrink-0">
                <span className="text-[9px] text-sky-300 uppercase">Rec. Power</span>
                <span className="text-xs font-extrabold text-white game-counter">
                  {viewingSector.recommendedStrength}
                </span>
                <span className="text-[9px] text-[#79B957] font-display mt-0.5">
                  {previewMatchup.isFairMatch ? '✅ Fair Match' : '⚠️ Challenging'}
                </span>
              </div>
            </div>

            {/* Beginner Protection / Matchmaking Explanation Banner */}
            <div className="flex items-center gap-1.5 text-[10px] text-sky-200 bg-[#122847] px-2.5 py-1.5 rounded-lg border border-[#234d82]">
              <Info className="w-3.5 h-3.5 text-[#FFC83D] shrink-0" />
              <span className="leading-tight">{previewMatchup.matchmakingReason}</span>
            </div>
          </div>

          {/* Sector Victory Rewards Card */}
          <div className="bg-[#17345D] border border-[#3b68a8] rounded-2xl p-3 shadow flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-display text-[#FFC83D] flex items-center gap-1 uppercase tracking-wider">
                <Gift className="w-3.5 h-3.5 text-[#FFC83D]" /> Sector Victory Loot
              </span>
              {viewingSector.rewards.firstClearBonus && (
                <span className={`text-[9px] font-display px-2 py-0.5 rounded-full ${isCleared ? 'bg-sky-900/60 text-sky-300 border border-sky-600' : 'bg-amber-400/20 text-[#FFC83D] border border-[#FFC83D]'}`}>
                  {isCleared ? '✓ First Clear Claimed' : '⭐ First Clear Bonus!'}
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="bg-[#0f2444] border border-[#204575] rounded-xl p-2 flex flex-col items-center text-center">
                <span className="text-base">🪙</span>
                <span className="text-xs font-extrabold text-[#FFC83D] game-counter mt-0.5">
                  +{viewingSector.rewards.coins}
                </span>
                <span className="text-[8px] text-sky-300 font-display uppercase">Coins</span>
              </div>

              <div className="bg-[#0f2444] border border-[#204575] rounded-xl p-2 flex flex-col items-center text-center">
                <span className="text-base">📦</span>
                <span className="text-xs font-extrabold text-[#9ae275] game-counter mt-0.5">
                  +{viewingSector.rewards.cubes}
                </span>
                <span className="text-[8px] text-sky-300 font-display uppercase">Cubes</span>
              </div>

              <div className="bg-[#0f2444] border border-[#204575] rounded-xl p-2 flex flex-col items-center text-center">
                <span className="text-base">🎁</span>
                <span className="text-xs font-display text-white mt-0.5 truncate w-full">
                  {viewingSector.rewards.chestName || viewingSector.rewards.chestTier}
                </span>
                <span className="text-[8px] text-sky-300 font-display uppercase">Chest Vault</span>
              </div>
            </div>

            {/* First-Clear Bonus Highlight if not yet claimed */}
            {!isCleared && viewingSector.rewards.firstClearBonus && (
              <div className="bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border border-[#FFC83D]/60 rounded-xl px-2.5 py-1.5 flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1.5 text-amber-200">
                  <Sparkles className="w-3.5 h-3.5 text-[#FFC83D] shrink-0" />
                  <span className="font-display">First Clear Realm Reward:</span>
                </div>
                <div className="flex items-center gap-2 font-extrabold text-[#FFC83D]">
                  <span>+{viewingSector.rewards.firstClearBonus.coins} 🪙</span>
                  <span>+{viewingSector.rewards.firstClearBonus.gems} 💎</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* 4. FIXED BOTTOM ACTION AREA (GOLD BATTLE BUTTON)          */}
        {/* ======================================================== */}
        <div className="w-full bg-[#0d213d] border-t-2 border-[#FFC83D]/80 p-3 sm:p-4 shrink-0 shadow-[0_-6px_20px_rgba(0,0,0,0.5)] pb-[max(env(safe-area-inset-bottom),14px)]">
          {isUnlocked ? (
            <button
              onClick={handleStartBattle}
              disabled={isSubmitting}
              className={`btn-royal-gold w-full py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(255,200,61,0.5)] active:scale-98 transition group cursor-pointer ${
                isSubmitting ? 'opacity-70 cursor-wait' : ''
              }`}
            >
              <Swords className="w-5 h-5 text-[#4a2800] fill-current group-hover:rotate-12 transition-transform" />
              <span className="text-base sm:text-lg font-display text-[#4a2800] uppercase tracking-wider drop-shadow-sm">
                {isSubmitting ? 'INITIALIZING BATTLE...' : `ENTER SECTOR ${viewingSector.sectorId} BATTLE`}
              </span>
            </button>
          ) : (
            <button
              disabled
              className="w-full py-3.5 px-4 rounded-2xl bg-[#1b263b] border-2 border-gray-600 text-gray-400 flex items-center justify-center gap-2 cursor-not-allowed opacity-75"
            >
              <Lock className="w-4 h-4 text-rose-400" />
              <span className="text-xs sm:text-sm font-display uppercase tracking-wider text-rose-200">
                LOCKED — REQUIRES {viewingSector.requiredTrophies} TROPHIES
              </span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
