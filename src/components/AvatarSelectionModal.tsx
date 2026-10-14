import React, { useState } from 'react';
import { X, Check, Lock, Edit3, Sparkles, Gem, Coins, Crown, RotateCcw } from 'lucide-react';
import { sounds } from '../audio';
import { ResponsiveModal } from './ResponsiveModal';

export interface AvatarItem {
  id: string;
  name: string;
  category: 'starter' | 'arena' | 'gems' | 'vip';
  svgType: string;
  unlocked: boolean;
  costGems?: number;
  costCoins?: number;
  requirementText?: string;
}

interface AvatarSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatarId: string;
  onSelectAvatar: (avatarId: string) => void;
  playerName: string;
  onUpdatePlayerName: (newName: string) => void;
  playerGems: number;
  playerCoins: number;
  onDeductGems: (amount: number) => boolean;
  onDeductCoins: (amount: number) => boolean;
  onCoinShortfall?: (itemTitle: string, requiredCoins: number, currentCoins: number) => void;
  isVip: boolean;
  isLiveInBattle?: boolean;
}

export const AVATAR_CATALOG: AvatarItem[] = [
  {
    id: 'kid_headphones',
    name: 'Cyan Kid',
    category: 'starter',
    svgType: 'kid_headphones',
    unlocked: true,
  },
  {
    id: 'cat_paw',
    name: 'Kitty Paw',
    category: 'starter',
    svgType: 'cat_paw',
    unlocked: true,
    requirementText: 'FREE',
  },
  {
    id: 'astronaut',
    name: 'Star Pilot',
    category: 'starter',
    svgType: 'astronaut',
    unlocked: true,
  },
  {
    id: 'robot_mech',
    name: 'Cyber Bot',
    category: 'arena',
    svgType: 'robot_mech',
    unlocked: true,
    requirementText: 'Reach Block #1',
  },
  {
    id: 'ninja_warrior',
    name: 'Shadow Ninja',
    category: 'arena',
    svgType: 'ninja_warrior',
    unlocked: false,
    costCoins: 300,
    requirementText: '300 Coins',
  },
  {
    id: 'horned_viking',
    name: 'Viking Chief',
    category: 'arena',
    svgType: 'horned_viking',
    unlocked: false,
    costCoins: 450,
    requirementText: '450 Coins',
  },
  {
    id: 'red_trainer',
    name: 'Red Champion',
    category: 'arena',
    svgType: 'red_trainer',
    unlocked: false,
    costGems: 120,
    requirementText: '120 Gems',
  },
  {
    id: 'purple_cowl',
    name: 'Void Mage',
    category: 'gems',
    svgType: 'purple_cowl',
    unlocked: false,
    costGems: 250,
    requirementText: '250 Gems',
  },
  {
    id: 'vip_king',
    name: 'Golden Sovereign',
    category: 'vip',
    svgType: 'vip_king',
    unlocked: false,
    requirementText: 'VIP Exclusive',
  },
];

export const renderAvatarSvg = (svgType: string, className = 'w-full h-full') => {
  switch (svgType) {
    case 'kid_headphones':
      return (
        <svg viewBox="0 0 64 64" className={className}>
          {/* Headphones */}
          <path d="M12 28 C12 12, 52 12, 52 28" fill="none" stroke="#374151" strokeWidth="4" />
          <rect x="8" y="24" width="8" height="14" rx="3" fill="#0284c7" />
          <rect x="48" y="24" width="8" height="14" rx="3" fill="#0284c7" />
          {/* Face */}
          <circle cx="32" cy="32" r="16" fill="#fed7aa" />
          {/* Cyan hair */}
          <path d="M18 26 C20 18, 44 18, 46 26 C44 22, 38 20, 32 21 C26 20, 20 22, 18 26 Z" fill="#06b6d4" />
          {/* Blue backwards cap */}
          <ellipse cx="32" cy="22" rx="14" ry="7" fill="#2563eb" />
          <path d="M30 15 L44 14" stroke="#1d4ed8" strokeWidth="3" strokeLinecap="round" />
          {/* Eyes & Smile */}
          <circle cx="26" cy="32" r="2" fill="#1e293b" />
          <circle cx="38" cy="32" r="2" fill="#1e293b" />
          <path d="M28 38 Q32 41 36 38" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'cat_paw':
      return (
        <svg viewBox="0 0 64 64" className={className}>
          <circle cx="32" cy="34" r="16" fill="#fde047" />
          {/* Cat Ears */}
          <polygon points="18,24 24,12 30,22" fill="#f59e0b" />
          <polygon points="46,24 40,12 34,22" fill="#f59e0b" />
          {/* Eyes */}
          <ellipse cx="26" cy="33" rx="2.5" ry="3.5" fill="#1e293b" />
          <ellipse cx="38" cy="33" rx="2.5" ry="3.5" fill="#1e293b" />
          <circle cx="25" cy="32" r="1" fill="#ffffff" />
          <circle cx="37" cy="32" r="1" fill="#ffffff" />
          {/* Nose & Whiskers */}
          <polygon points="32,38 30,36 34,36" fill="#f43f5e" />
          <path d="M18 36 L26 37 M18 40 L26 39 M46 36 L38 37 M46 40 L38 39" stroke="#b45309" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'astronaut':
      return (
        <svg viewBox="0 0 64 64" className={className}>
          <circle cx="32" cy="32" r="17" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" />
          <rect x="20" y="24" width="24" height="15" rx="6" fill="#0284c7" />
          <ellipse cx="32" cy="31" rx="9" ry="5" fill="#38bdf8" />
          <ellipse cx="28" cy="29" rx="3" ry="1.5" fill="#ffffff" />
        </svg>
      );
    case 'robot_mech':
      return (
        <svg viewBox="0 0 64 64" className={className}>
          <rect x="18" y="18" width="28" height="28" rx="6" fill="#334155" stroke="#06b6d4" strokeWidth="2" />
          <rect x="22" y="26" width="20" height="7" rx="3" fill="#22d3ee" />
          <circle cx="20" cy="32" r="3" fill="#f59e0b" />
          <circle cx="44" cy="32" r="3" fill="#f59e0b" />
          <line x1="32" y1="18" x2="32" y2="12" stroke="#06b6d4" strokeWidth="3" />
          <circle cx="32" cy="10" r="3" fill="#06b6d4" />
        </svg>
      );
    case 'ninja_warrior':
      return (
        <svg viewBox="0 0 64 64" className={className}>
          <circle cx="32" cy="32" r="16" fill="#0f172a" />
          <rect x="16" y="25" width="32" height="10" fill="#dc2626" />
          <rect x="22" y="27" width="20" height="6" fill="#fed7aa" />
          <circle cx="27" cy="30" r="1.5" fill="#0f172a" />
          <circle cx="37" cy="30" r="1.5" fill="#0f172a" />
        </svg>
      );
    case 'horned_viking':
      return (
        <svg viewBox="0 0 64 64" className={className}>
          <circle cx="32" cy="36" r="15" fill="#fed7aa" />
          {/* Helmet */}
          <path d="M18 30 C18 18, 46 18, 46 30 Z" fill="#64748b" />
          <path d="M14 26 C12 18, 16 10, 22 14" stroke="#f1f5f9" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M50 26 C52 18, 48 10, 42 14" stroke="#f1f5f9" strokeWidth="4" fill="none" strokeLinecap="round" />
          <circle cx="26" cy="36" r="2" fill="#1e293b" />
          <circle cx="38" cy="36" r="2" fill="#1e293b" />
          {/* Beard */}
          <path d="M22 42 Q32 54 42 42 Z" fill="#d97706" />
        </svg>
      );
    case 'red_trainer':
      return (
        <svg viewBox="0 0 64 64" className={className}>
          <path d="M16 26 C16 14, 48 14, 48 26 L52 30 L12 30 Z" fill="#991b1b" />
          <path d="M32 10 L30 18 L34 18 Z" fill="#facc15" />
          <circle cx="32" cy="34" r="15" fill="#86efac" />
          <circle cx="26" cy="32" r="2.5" fill="#dc2626" />
          <circle cx="38" cy="32" r="2.5" fill="#dc2626" />
          <path d="M26 40 L38 40" stroke="#14532d" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'purple_cowl':
      return (
        <svg viewBox="0 0 64 64" className={className}>
          <path d="M16 46 C14 24, 24 12, 32 8 C40 12, 50 24, 48 46 Z" fill="#6b21a8" />
          <circle cx="32" cy="32" r="10" fill="#0f172a" />
          <ellipse cx="28" cy="31" rx="2" ry="1.5" fill="#c084fc" />
          <ellipse cx="36" cy="31" rx="2" ry="1.5" fill="#c084fc" />
        </svg>
      );
    case 'vip_king':
      return (
        <svg viewBox="0 0 64 64" className={className}>
          <circle cx="32" cy="36" r="16" fill="#fed7aa" />
          {/* Gold Crown */}
          <path d="M18 24 L22 14 L32 20 L42 14 L46 24 Z" fill="#eab308" stroke="#ca8a04" strokeWidth="1.5" />
          <circle cx="22" cy="14" r="2" fill="#ef4444" />
          <circle cx="32" cy="20" r="2" fill="#3b82f6" />
          <circle cx="42" cy="14" r="2" fill="#10b981" />
          <circle cx="26" cy="34" r="2" fill="#1e293b" />
          <circle cx="38" cy="34" r="2" fill="#1e293b" />
          <path d="M28 40 Q32 43 36 40" stroke="#b45309" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      );
    default:
      return <div className="text-2xl">👤</div>;
  }
};

export const AvatarSelectionModal: React.FC<AvatarSelectionModalProps> = ({
  isOpen,
  onClose,
  currentAvatarId,
  onSelectAvatar,
  playerName,
  onUpdatePlayerName,
  playerGems,
  playerCoins,
  onDeductGems,
  onDeductCoins,
  onCoinShortfall,
  isVip,
  isLiveInBattle = false,
}) => {
  const [avatars, setAvatars] = useState<AvatarItem[]>(AVATAR_CATALOG);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(playerName);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveName = () => {
    const trimmed = nameInput.trim();
    if (trimmed.length > 0) {
      sounds.playClick();
      onUpdatePlayerName(trimmed);
      setEditingName(false);
      setFeedbackMsg('Name updated!');
      setTimeout(() => setFeedbackMsg(null), 1500);
    }
  };

  const handleSelectOrUnlock = (item: AvatarItem) => {
    sounds.playClick();
    // Check if unlocked or user has VIP for VIP king
    const isUnlocked =
      item.unlocked ||
      (item.id === 'vip_king' && isVip);

    if (isUnlocked) {
      onSelectAvatar(item.id);
      setFeedbackMsg(`Equipped ${item.name}!`);
      setTimeout(() => setFeedbackMsg(null), 1200);
      return;
    }

    // Try unlocking with coins
    if (item.costCoins) {
      if (playerCoins >= item.costCoins) {
        if (onDeductCoins(item.costCoins)) {
          setAvatars((prev) =>
            prev.map((a) => (a.id === item.id ? { ...a, unlocked: true } : a))
          );
          onSelectAvatar(item.id);
          setFeedbackMsg(`Unlocked ${item.name}!`);
          setTimeout(() => setFeedbackMsg(null), 1500);
        }
      } else {
        if (onCoinShortfall) {
          onCoinShortfall(`${item.name} Avatar`, item.costCoins, playerCoins);
        } else {
          setFeedbackMsg(`Need ${item.costCoins} coins to unlock!`);
          setTimeout(() => setFeedbackMsg(null), 1500);
        }
      }
      return;
    }

    // Try unlocking with gems
    if (item.costGems) {
      if (playerGems >= item.costGems) {
        if (onDeductGems(item.costGems)) {
          setAvatars((prev) =>
            prev.map((a) => (a.id === item.id ? { ...a, unlocked: true } : a))
          );
          onSelectAvatar(item.id);
          setFeedbackMsg(`Unlocked ${item.name}!`);
          setTimeout(() => setFeedbackMsg(null), 1500);
        }
      } else {
        setFeedbackMsg(`Need ${item.costGems} gems to unlock!`);
        setTimeout(() => setFeedbackMsg(null), 1500);
      }
      return;
    }

    if (item.id === 'vip_king') {
      setFeedbackMsg('Activate VIP membership to unlock!');
      setTimeout(() => setFeedbackMsg(null), 1800);
    } else {
      setFeedbackMsg(item.requirementText || 'Locked avatar');
      setTimeout(() => setFeedbackMsg(null), 1500);
    }
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title="ROYAL ARMOURY"
      subtitle={isLiveInBattle ? 'Live Battle Paused in Background' : 'Select your Champion Knight avatar'}
      icon={<span className="text-xl">👑</span>}
      maxWidthClass="max-w-sm"
      headerGradient="bg-gradient-to-r from-[#1769D2] via-[#124d9c] to-[#17345D]"
      borderGlowColor="border-[#FFC83D] shadow-[0_0_50px_rgba(255,200,61,0.5)]"
    >
      <div className="flex flex-col gap-3">
        {/* Name Editor Bar */}
        <div className="w-full bg-[#17345D] border-2 border-[#FFC83D]/60 rounded-2xl p-2.5 flex items-center justify-between gap-2 shadow-lg">
          {editingName ? (
            <div className="flex-1 flex items-center gap-1.5">
              <input
                type="text"
                maxLength={16}
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName();
                  if (e.key === 'Escape') setEditingName(false);
                }}
                className="flex-1 bg-[#1769D2]/30 text-white text-xs font-bold px-2 py-1.5 rounded-lg border-2 border-[#FFC83D] focus:outline-none focus:ring-1 focus:ring-[#FFC83D] min-w-0"
                autoFocus
                placeholder="Enter Champion name..."
              />
              <button
                type="button"
                onClick={handleSaveName}
                className="px-3 py-1.5 btn-royal-gold text-[#17345D] font-black text-xs rounded-lg shadow cursor-pointer active:scale-95 shrink-0"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditingName(false)}
                className="px-2.5 py-1.5 bg-[#17345D] hover:bg-slate-700 text-[#F7E7BE] text-xs font-bold rounded-lg border border-white/20 cursor-pointer active:scale-95 shrink-0"
              >
                ✕
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#1769D2] border-2 border-[#FFC83D] flex items-center justify-center shadow shrink-0">
                  {renderAvatarSvg(
                    avatars.find((a) => a.id === currentAvatarId)?.svgType || 'kid_headphones',
                    'w-6 h-6'
                  )}
                </div>
                <div className="flex flex-col leading-tight min-w-0">
                  <span className="text-[10px] text-[#FFC83D] font-bold uppercase tracking-wide">Champion Name</span>
                  <span className="text-xs font-black text-white truncate drop-shadow">{playerName}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setNameInput(playerName);
                  setEditingName(true);
                }}
                className="flex items-center gap-1 text-[11px] font-bold text-[#17345D] btn-royal-gold px-2.5 py-1.5 rounded-lg cursor-pointer shadow shrink-0"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </button>
            </>
          )}
        </div>

        {/* Feedback banner */}
        {feedbackMsg && (
          <div className="text-[11px] font-bold text-center py-1.5 px-2 rounded-lg bg-[#FFC83D] border-2 border-white text-[#17345D] animate-in fade-in shadow-md">
            {feedbackMsg}
          </div>
        )}

        {/* Avatar Grid (3 columns) */}
        <div className="grid grid-cols-3 gap-2 sm:gap-2.5 max-h-[46vh] overflow-y-auto scroll-touch pr-1">
          {avatars.map((item) => {
            const isSelected = currentAvatarId === item.id;
            const isItemUnlocked = item.unlocked || (item.id === 'vip_king' && isVip);

            return (
              <div
                key={item.id}
                onClick={() => handleSelectOrUnlock(item)}
                className={`relative rounded-2xl p-2 flex flex-col items-center justify-between border-2 transition-all cursor-pointer active:scale-95 ${
                  isSelected
                    ? 'bg-gradient-to-b from-[#1769D2] to-[#17345D] border-2 border-b-4 border-[#FFC83D] border-b-[#b38615] shadow-[0_0_20px_rgba(255,200,61,0.6)] scale-102'
                    : isItemUnlocked
                    ? 'bg-[#17345D] border-white/20 hover:border-[#FFC83D] shadow'
                    : 'bg-[#17345D]/60 border-white/10 opacity-70'
                }`}
              >
                {/* Selected Tick Indicator */}
                {isSelected && (
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#79B957] text-white flex items-center justify-center border-2 border-white shadow">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}

                {/* VIP Badge */}
                {item.category === 'vip' && (
                  <div className="absolute top-1 left-1 bg-[#FFC83D] text-[#17345D] text-[8px] font-black px-1 rounded-sm flex items-center gap-0.5 border border-white shadow">
                    <Crown className="w-2.5 h-2.5 fill-current" /> VIP
                  </div>
                )}

                {/* Avatar SVG Portrait */}
                <div className="w-12 h-12 rounded-xl bg-[#17345D] border border-[#FFC83D]/40 p-1 flex items-center justify-center my-1 shadow-inner">
                  {renderAvatarSvg(item.svgType, 'w-10 h-10')}
                </div>

                {/* Name */}
                <span className="text-[11px] font-display text-white truncate max-w-full text-center">
                  {item.name}
                </span>

                {/* Status / Cost Pill */}
                <div className="mt-1">
                  {isSelected ? (
                    <span className="text-[8px] font-display bg-[#FFC83D] text-[#17345D] px-2 py-0.5 rounded-full shadow font-black">
                      EQUIPPED
                    </span>
                  ) : isItemUnlocked ? (
                    <span className="text-[8px] font-display text-[#79B957] bg-[#79B957]/20 border border-[#79B957] px-2 py-0.5 rounded-full shadow font-bold">
                      SELECT
                    </span>
                  ) : item.costCoins ? (
                    <span className="text-[8px] game-counter font-black text-[#FFC83D] bg-[#17345D] border border-[#FFC83D]/60 px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow">
                      <Coins className="w-2.5 h-2.5 text-[#FFC83D]" /> {item.costCoins}
                    </span>
                  ) : item.costGems ? (
                    <span className="text-[8px] game-counter font-black text-[#79B957] bg-[#17345D] border border-[#79B957]/60 px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow">
                      <Gem className="w-2.5 h-2.5 text-[#79B957]" /> {item.costGems}
                    </span>
                  ) : (
                    <span className="text-[8px] font-display text-[#F7E7BE]/80 flex items-center gap-0.5 bg-[#17345D] px-2 py-0.5 rounded-full border border-white/20">
                      <Lock className="w-2.5 h-2.5" /> {item.requirementText || 'Locked'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Done Button */}
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="w-full py-3 rounded-2xl btn-royal-gold text-[#17345D] font-display text-xs uppercase tracking-wider shadow-lg cursor-pointer transition"
        >
          DONE
        </button>
      </div>
    </ResponsiveModal>
  );
};
