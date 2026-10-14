import React from 'react';
import { ShoppingBag, Layers, Swords, Gift, Settings } from 'lucide-react';
import { NavTab } from '../types';
import { sounds } from '../audio';

interface BottomNavBarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  hasFreeSpin: boolean;
  upgradeableCardsCount: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  onSelectTab,
  hasFreeSpin,
  upgradeableCardsCount,
}) => {
  const handleTabClick = (tab: NavTab) => {
    sounds.playClick();
    onSelectTab(tab);
  };

  const navItems: Array<{
    id: NavTab;
    label: string;
    icon: React.ReactNode;
    badge?: string | number;
    badgeColor?: string;
  }> = [
    {
      id: 'shop',
      label: 'Shop',
      icon: <ShoppingBag className="w-5 h-5" />,
    },
    {
      id: 'cards',
      label: 'Cards',
      icon: <Layers className="w-5 h-5" />,
      badge: upgradeableCardsCount > 0 ? upgradeableCardsCount : undefined,
      badgeColor: 'bg-emerald-500 text-white',
    },
    {
      id: 'battle',
      label: 'Battle',
      icon: <Swords className="w-6 h-6" />,
    },
    {
      id: 'spin',
      label: 'Lucky Spin',
      icon: <Gift className="w-5 h-5" />,
      badge: hasFreeSpin ? 'FREE' : undefined,
      badgeColor: 'bg-amber-400 text-slate-950 font-black',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  return (
    <nav
      aria-label="Game navigation"
      className="w-full bg-gradient-to-t from-[#0e2444] via-[#17345D] to-[#1f4273] border-t-2 border-[#FFC83D]/70 px-2 pt-1.5 pb-2 flex items-center justify-around z-30 select-none shrink-0 shadow-[0_-4px_24px_rgba(23,52,93,0.6)] font-body"
    >
      {navItems.map((item) => {
        const isActive = currentTab === item.id;
        const isBattle = item.id === 'battle';

        if (isBattle) {
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`relative -top-2 flex flex-col items-center justify-center transition-transform active:scale-90 cursor-pointer min-w-[54px] min-h-[54px] touch-manipulation ${
                isActive ? 'scale-105' : 'hover:scale-102'
              }`}
            >
              <div
                className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
                  isActive
                    ? 'bg-gradient-to-tr from-[#ffe071] via-[#FFC83D] to-[#d49b10] text-[#4a2800] shadow-[0_0_26px_rgba(255,200,61,0.85)] border-2 border-white'
                    : 'bg-gradient-to-tr from-[#1769D2] to-[#17345D] text-white border-2 border-[#FFC83D]/60 shadow-[0_4px_12px_rgba(23,52,93,0.6)]'
                }`}
              >
                <Swords className="w-6 h-6 sm:w-7 sm:h-7 drop-shadow" />
              </div>
              <span
                className={`text-[10px] font-display uppercase mt-0.5 tracking-wider ${
                  isActive ? 'text-[#FFC83D] drop-shadow' : 'text-blue-100'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        }

        return (
          <button
            key={item.id}
            onClick={() => handleTabClick(item.id)}
            className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer min-h-[44px] min-w-[48px] touch-manipulation ${
              isActive
                ? 'text-[#FFC83D] scale-105'
                : 'text-blue-200 hover:text-white active:scale-95'
            }`}
          >
            <div className="relative">
              {item.icon}
              {item.badge && (
                <span
                  className={`absolute -top-1.5 -right-3 text-[9px] px-1.5 py-0.2 rounded-full font-display shadow ${item.badgeColor} animate-pulse`}
                >
                  {item.badge}
                </span>
              )}
            </div>
            <span
              className={`text-[10px] font-display mt-0.5 tracking-wide ${
                isActive ? 'text-[#FFC83D] drop-shadow' : 'text-blue-200'
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
