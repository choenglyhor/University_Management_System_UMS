import React, { useState } from 'react';
import { Server, Shield, Database, Lock, RefreshCw, CheckCircle2, AlertTriangle, Key } from 'lucide-react';
import { PageHeader } from '../layout/PageHeader';
import { useLayout } from '../../context/LayoutContext';

export const SystemSettingsView = () => {
  const { academicTerm } = useLayout();
  const [isTestingConn, setIsTestingConn] = useState(false);
  const [connStatus, setConnStatus] = useState('HEALTHY');

  const testConnection = () => {
    setIsTestingConn(true);
    setTimeout(() => {
      setIsTestingConn(false);
      setConnStatus('HEALTHY');
    }, 800);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Settings & Database Architecture"
        subtitle="Manage MSSQL Server connectivity, T-SQL concurrency locks, RBAC policies, and audit retention."
        onRefresh={testConnection}
        isRefreshing={isTestingConn}
      />

      {/* Database Cluster Status */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Microsoft SQL Server 2022 Enterprise</h3>
              <p className="text-xs text-slate-400 font-mono">Cluster: prod-ums-mssql-01.western.internal</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold">
              <CheckCircle2 className="w-4 h-4" />
              STATUS: {connStatus}
            </span>
            <button
              onClick={testConnection}
              disabled={isTestingConn}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingConn ? 'animate-spin' : ''}`} />
              <span>Ping Replica</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 text-[10px] block">CONCURRENCY HINT:</span>
            <span className="text-sky-400 font-bold text-sm">WITH (UPDLOCK, HOLDLOCK)</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 text-[10px] block">ISOLATION LEVEL:</span>
            <span className="text-emerald-400 font-bold text-sm">SNAPSHOT ISOLATION</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 text-[10px] block">ACTIVE TRANSACTIONS:</span>
            <span className="text-white font-bold text-sm">18 Concurrent Locks</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 text-[10px] block">DEADLOCKS (24H):</span>
            <span className="text-emerald-400 font-bold text-sm">0 Detected</span>
          </div>
        </div>
      </div>

      {/* Role-Based Access Control (RBAC) Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <Shield className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-white">Role-Based Access Control Matrix (RBAC)</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 font-mono text-[11px] text-slate-400">
              <tr>
                <th className="py-2.5 px-3">System Module</th>
                <th className="py-2.5 px-3 text-center">Administrator</th>
                <th className="py-2.5 px-3 text-center">Faculty</th>
                <th className="py-2.5 px-3 text-center">Student</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              <tr>
                <td className="py-2.5 px-3 font-semibold">Dashboard & Institutional Analytics</td>
                <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">Full Access</td>
                <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">Assigned Sections</td>
                <td className="py-2.5 px-3 text-center text-sky-400 font-bold">Personal Only</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold">Faculty Gradebook Matrix</td>
                <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">Audit & Finalize</td>
                <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">Read & Batch Write</td>
                <td className="py-2.5 px-3 text-center text-rose-400 font-bold">Restricted</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold">Course Registration & Prerequisite Overrides</td>
                <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">Full Override</td>
                <td className="py-2.5 px-3 text-center text-slate-500">Read Roster</td>
                <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">Self Enroll/Drop</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold">Financial Ledger & Billing</td>
                <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">Write Adjustments</td>
                <td className="py-2.5 px-3 text-center text-rose-400 font-bold">Restricted</td>
                <td className="py-2.5 px-3 text-center text-sky-400 font-bold">Read & Pay</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
