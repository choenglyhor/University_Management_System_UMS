import React from 'react';
import { CreditCard, Download, ArrowUpRight, CheckCircle2, Clock, DollarSign, ShieldAlert } from 'lucide-react';
import { PageHeader } from '../layout/PageHeader';
import { useLayout, ROLES } from '../../context/LayoutContext';

export const FinancialLedgerView = () => {
  const { currentRole, academicTerm } = useLayout();

  const transactions = [
    {
      id: 'TXN-9021',
      date: 'Sep 15, 2026',
      description: 'Fall 2026 Tuition Installment (Direct Deposit)',
      amount: '$4,500.00',
      type: 'Payment',
      status: 'Settled',
      ref: 'ACH-889104',
    },
    {
      id: 'TXN-8842',
      date: 'Aug 28, 2026',
      description: 'Merit Academic Scholarship Credit',
      amount: '-$1,500.00',
      type: 'Credit',
      status: 'Settled',
      ref: 'SCHOL-2026',
    },
    {
      id: 'TXN-8721',
      date: 'Aug 10, 2026',
      description: 'Campus Laboratory & Computing Technology Fee',
      amount: '$350.00',
      type: 'Fee',
      status: 'Settled',
      ref: 'FEE-LAB-01',
    },
    {
      id: 'TXN-8650',
      date: 'Aug 05, 2026',
      description: 'Fall 2026 Base Tuition Assessment (16 Credits)',
      amount: '$5,650.00',
      type: 'Charge',
      status: 'Settled',
      ref: 'INV-2026-089',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Financial Ledger & Student Accounts"
        subtitle="Audited tuition transactions, institutional scholarship disbursements, and fee escrow ledger."
        onExportCsv={() => alert('Downloading official financial ledger CSV...')}
        onAddNew={currentRole === ROLES.ADMIN ? () => alert('Posting manual credit/debit adjustment...') : null}
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Charges (Term)</span>
          <div className="text-2xl font-extrabold text-white mt-2">$6,000.00</div>
          <span className="text-xs text-slate-400">16 enrolled credit hours</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Payments & Aid Applied</span>
          <div className="text-2xl font-extrabold text-emerald-400 mt-2">$6,000.00</div>
          <span className="text-xs text-emerald-400/80">100% fulfilled</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Account Balance</span>
          <div className="text-2xl font-extrabold text-white mt-2 font-mono">$0.00</div>
          <span className="text-xs text-emerald-400 flex items-center gap-1 mt-0.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Good Standing • No Holds
          </span>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Itemized Ledger Entries</h3>
            <p className="text-xs text-slate-400">All transactions are backed by cryptographic audit hashes</p>
          </div>
          <span className="text-xs font-mono px-2 py-1 rounded bg-slate-800 text-slate-300">
            Term: {academicTerm}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-sky-400">{tx.id}</td>
                  <td className="py-3.5 px-4 text-slate-300 font-sans">{tx.date}</td>
                  <td className="py-3.5 px-4 text-slate-100 font-sans font-medium">{tx.description}</td>
                  <td className="py-3.5 px-4 text-slate-400">{tx.ref}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-sans font-semibold">
                      <CheckCircle2 className="w-3 h-3" />
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-white text-sm">
                    {tx.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
