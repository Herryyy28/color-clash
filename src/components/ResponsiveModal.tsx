import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { sounds } from '../audio';

export interface ResponsiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: string;
  icon?: React.ReactNode;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  maxWidthClass?: string;
  className?: string;
  closeOnBackdrop?: boolean;
  showCloseButton?: boolean;
  headerGradient?: string;
  borderGlowColor?: string;
}

export const ResponsiveModal: React.FC<ResponsiveModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  headerRight,
  children,
  maxWidthClass = 'max-w-sm',
  className = '',
  closeOnBackdrop = true,
  showCloseButton = true,
  headerGradient = 'bg-gradient-to-r from-[#1769D2] via-[#124d9c] to-[#1769D2]',
  borderGlowColor = 'border-2 border-b-4 border-[#FFC83D] border-b-[#b38615] shadow-[0_0_40px_rgba(255,200,61,0.45)]',
}) => {
  const modalContentRef = useRef<HTMLDivElement>(null);

  // Close on Android back / Esc key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        sounds.playClick();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#17345D]/85 backdrop-blur-md select-none animate-in fade-in duration-200 overflow-y-auto safe-pt safe-pb safe-pl safe-pr"
      onClick={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) {
          sounds.playClick();
          onClose();
        }
      }}
    >
      <div
        ref={modalContentRef}
        className={`relative w-full ${maxWidthClass} rounded-3xl bg-gradient-to-b from-[#1769D2] via-[#124d9c] to-[#17345D] border-2 ${borderGlowColor} flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 max-h-[calc(100dvh-var(--safe-top)-var(--safe-bottom)-24px)] ${className}`}
      >
        {/* Optional Modal Header */}
        {(title || showCloseButton) && (
          <div
            className={`w-full px-4 py-3 flex items-center justify-between border-b-2 border-[#FFC83D]/40 shrink-0 ${headerGradient}`}
          >
            <div className="flex items-center gap-2 min-w-0 pr-2">
              {icon && <div className="shrink-0 text-xl">{icon}</div>}
              <div className="flex flex-col min-w-0">
                {title && (
                  <h3 className="text-base sm:text-lg font-display text-white uppercase tracking-wider leading-tight drop-shadow truncate">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <span className="text-[11px] text-[#F7E7BE] font-body font-bold truncate leading-tight mt-0.5">
                    {subtitle}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {headerRight}
              {showCloseButton && (
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    onClose();
                  }}
                  className="w-8 h-8 rounded-full bg-gradient-to-b from-[#FFC83D] to-[#b38615] text-[#17345D] flex items-center justify-center border-2 border-white shadow cursor-pointer active:scale-95 transition"
                  aria-label="Close"
                >
                  <X className="w-4 h-4 stroke-[3]" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto scroll-touch p-3.5 sm:p-4 text-white font-body font-normal">
          {children}
        </div>
      </div>
    </div>
  );
};
