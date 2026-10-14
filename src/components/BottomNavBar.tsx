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
      className="w-full bg-[#0a101f] border-t border-slate-800/80 px-2 py-1.5 flex items-center justify-around z-30 select-none shrink-0"
    >
      {navItems.map((item) => {
        const isActive = currentTab === item.id;
        const isBattle = item.id === 'battle';

        if (isBattle) {
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`relative -top-3 flex flex-col items-center justify-center transition-transform active:scale-90 cursor-pointer ${
                isActive ? 'scale-105' : 'hover:scale-102'
              }`}
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
                  isActive
                    ? 'bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(56,189,248,0.7)] border-2 border-white'
                    : 'bg-gradient-to-tr from-slate-800 to-slate-700 text-slate-300 border border-slate-600'
                }`}
              >
                <Swords className="w-7 h-7 drop-shadow" />
              </div>
              <span
                className={`text-[10px] font-black uppercase mt-1 tracking-wider ${
                  isActive ? 'text-sky-400' : 'text-slate-400'
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
            className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
              isActive
                ? 'text-sky-400 scale-105'
                : 'text-slate-400 hover:text-slate-200 active:scale-95'
            }`}
          >
            <div className="relative">
              {item.icon}
              {item.badge && (
                <span
                  className={`absolute -top-1.5 -right-3 text-[9px] px-1.5 py-0.2 rounded-full font-bold shadow ${item.badgeColor} animate-pulse`}
                >
                  {item.badge}
                </span>
              )}
            </div>
            <span
              className={`text-[10px] font-bold mt-1 tracking-tight ${
                isActive ? 'text-sky-400 font-black' : 'text-slate-400'
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
