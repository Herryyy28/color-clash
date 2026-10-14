import React, { useState } from 'react';
import { History, ArrowDownLeft, ArrowUpRight, ShieldCheck, Download } from 'lucide-react';
import { currencyService, WalletTransaction } from '../services/currencyService';
import { sounds } from '../audio';
import { ResponsiveModal } from './ResponsiveModal';

interface TransactionLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TransactionLedgerModal: React.FC<TransactionLedgerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [filter, setFilter] = useState<'all' | 'coins' | 'gems'>('all');
  const [copiedNotice, setCopiedNotice] = useState(false);

  if (!isOpen) return null;

  const walletState = currencyService.getWalletState();
  const transactions = walletState.transactions.filter((tx) => {
    if (filter === 'all') return true;
    return tx.currency === filter;
  });

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(walletState, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `color_clash_wallet_ledger_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2000);
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title="Wallet Ledger"
      subtitle="Authoritative idempotent transaction log"
      icon={<History className="w-5 h-5 text-yellow-300" />}
      maxWidthClass="max-w-md"
    >

        {/* Wallet Overview Summary Bar */}
        <div className="px-4 py-2.5 bg-[#092257] border-b border-blue-400/30 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-3">
            <div>
              <span className="text-[9px] text-sky-300 font-bold uppercase block">Balance</span>
              <strong className="text-yellow-300 font-black">🪙 {walletState.coins}</strong> |{' '}
              <strong className="text-emerald-300 font-black">💎 {walletState.gems}</strong>
            </div>
            <div>
              <span className="text-[9px] text-sky-300 font-bold uppercase block">Earned / Spent</span>
              <span className="text-emerald-400 font-bold">+{walletState.totalCoinsEarned}</span> /{' '}
              <span className="text-rose-400 font-bold">-{walletState.totalCoinsSpent}</span>
            </div>
          </div>
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1 bg-[#133785] hover:bg-[#1a4db8] px-2.5 py-1 rounded-lg text-[10px] font-black text-white border border-sky-300/40 cursor-pointer active:scale-95"
          >
            <Download className="w-3 h-3 text-sky-300" />
            {copiedNotice ? 'Exported!' : 'Export JSON'}
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="px-4 py-2 bg-[#0c2a6b] flex gap-1.5 border-b border-blue-400/20 shrink-0">
          {(['all', 'coins', 'gems'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 rounded-lg text-[11px] font-black uppercase cursor-pointer transition ${
                filter === tab
                  ? 'bg-sky-400 text-blue-950 shadow'
                  : 'bg-[#123687] text-sky-200 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
          <span className="ml-auto text-[10px] text-blue-200 font-bold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> {transactions.length} Verified
          </span>
        </div>

        {/* Transaction History List */}
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-blue-200 text-xs font-bold">
              No transactions recorded yet.
            </div>
          ) : (
            transactions.map((tx) => {
              const isCredit = tx.amount > 0;
              return (
                <div
                  key={tx.id}
                  className="bg-[#0b245e] border border-blue-400/40 rounded-xl p-2.5 flex items-center justify-between text-xs shadow-sm hover:border-sky-300 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isCredit
                          ? 'bg-emerald-500/20 border border-emerald-400 text-emerald-300'
                          : 'bg-rose-500/20 border border-rose-400 text-rose-300'
                      }`}
                    >
                      {isCredit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-black text-white">{tx.description}</span>
                      <div className="flex items-center gap-2 text-[9px] text-blue-200 mt-0.5">
                        <span>{new Date(tx.timestamp).toLocaleTimeString()}</span>
                        <span>•</span>
                        <span className="font-mono text-sky-300 truncate max-w-[120px]">{tx.claimId}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end text-right">
                    <span
                      className={`font-black ${
                        isCredit ? 'text-emerald-300' : 'text-rose-300'
                      }`}
                    >
                      {isCredit ? `+${tx.amount}` : tx.amount}{' '}
                      {tx.currency === 'coins' ? '🪙' : '💎'}
                    </span>
                    <span className="text-[9px] text-sky-200 font-bold mt-0.5">
                      Bal: {tx.balanceAfter}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
    </ResponsiveModal>
  );
};
