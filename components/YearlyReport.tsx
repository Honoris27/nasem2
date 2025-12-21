import React, { useMemo, useState } from 'react';
import { 
  Team, Project, Budget, ProductionEntry, 
  MONTHS, YEARS, DAILY_WORKING_HOURS
} from '../types';
import { 
  Printer, LayoutGrid, Users, FileText, ChevronDown, Activity, Calendar
} from 'lucide-react';

interface YearlyReportProps {
  entries: ProductionEntry[];
  budgets: Budget[];
  teams: Team[];
  projects: Project[];
}

const YearlyReport: React.FC<YearlyReportProps> = ({ entries, budgets, teams, projects }) => {
  const [filterYear, setFilterYear] = useState(2025);

  const yearlyEntries = useMemo(() => entries.filter(e => e.year === filterYear), [entries, filterYear]);
  const yearlyBudgets = useMemo(() => budgets.filter(b => b.year === filterYear), [budgets, filterYear]);

  const summary = useMemo(() => {
    const totalKg = yearlyEntries.reduce((acc, curr) => acc + curr.quantityKg, 0);
    const totalCost = yearlyBudgets.reduce((acc, curr) => acc + curr.amountTL, 0);
    const totalHours = yearlyBudgets.reduce((acc, curr) => {
      const days = curr.workingDays?.length || 0;
      return acc + (curr.personnelCount * days * DAILY_WORKING_HOURS);
    }, 0);
    const avgEfficiency = totalHours > 0 ? (totalKg / totalHours) : 0;

    return { totalKg, totalCost, totalHours, avgEfficiency };
  }, [yearlyEntries, yearlyBudgets]);

  const teamMatrix = useMemo(() => {
    return teams.map(team => {
      const tEntries = yearlyEntries.filter(e => e.teamId === team.id);
      const tBudgets = yearlyBudgets.filter(b => b.teamId === team.id);
      
      const annualKg = tEntries.reduce((a, c) => a + c.quantityKg, 0);
      const annualHours = tBudgets.reduce((a, c) => a + (c.personnelCount * (c.workingDays?.length || 0) * DAILY_WORKING_HOURS), 0);
      const annualCost = tBudgets.reduce((a, c) => a + c.amountTL, 0);
      
      const efficiency = annualHours > 0 ? (annualKg / annualHours) : 0;
      const unitCost = annualKg > 0 ? (annualCost / annualKg) : 0;

      const monthlyData = MONTHS.map(month => {
        const mEntries = tEntries.filter(e => e.month === month);
        const mBudget = tBudgets.find(b => b.month === month);
        const mKg = mEntries.reduce((a, c) => a + c.quantityKg, 0);
        const mCost = mBudget?.amountTL || 0;
        const mPersonnel = mBudget?.personnelCount || 0;
        const mHours = mBudget ? (mBudget.personnelCount * (mBudget.workingDays?.length || 0) * DAILY_WORKING_HOURS) : 0;
        const mUnitCost = mKg > 0 ? (mCost / mKg) : 0;
        
        return {
          month,
          kg: mKg,
          cost: mCost,
          personnel: mPersonnel,
          hours: mHours,
          unitCost: mUnitCost,
          hasData: mKg > 0 || mCost > 0 || mPersonnel > 0
        };
      });

      return {
        id: team.id,
        name: team.name,
        annualKg,
        annualHours,
        efficiency,
        unitCost,
        monthlyData
      };
    }).filter(t => t.annualKg > 0 || t.annualHours > 0);
  }, [teams, yearlyEntries, yearlyBudgets]);

  return (
    <div className="space-y-4">
      {/* FILTER PANEL */}
      <div className="bg-white border border-slate-200 p-3 flex items-center justify-between no-print rounded">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase">YIL SEÇİMİ:</span>
            <select className="bg-slate-50 border border-slate-200 text-[11px] font-bold px-2 py-1 outline-none" value={filterYear} onChange={e => setFilterYear(Number(e.target.value))}>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        <button onClick={() => window.print()} className="bg-slate-900 text-white px-5 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 rounded">
          <Printer size={14} /> YILLIK RAPORU YAZDIR
        </button>
      </div>

      {/* REPORT AREA */}
      <div className="bg-white p-6 border border-slate-300 report-card print:p-2 print:border-none print:shadow-none">
        {/* Header */}
        <div className="flex justify-between items-end border-b-2 border-slate-900 pb-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-600 text-white rounded">
              <Activity size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none">PROANALİZ ENTERPRISE</h1>
              <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">Yıllık Faaliyet Konsolide Veritabanı</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-sm font-black text-slate-900 uppercase">{filterYear} YILLIK PERFORMANS ÖZETİ</h2>
            <div className="text-[9px] font-bold text-slate-400 mt-1 uppercase italic tracking-widest tracking-tighter">KURUMSAL VERİ MERKEZİ ANALİZİ</div>
          </div>
        </div>

        {/* STATS TILES */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <CompactStat label="YILLIK TOP. ÜRETİM" value={summary.totalKg.toLocaleString()} unit="KG" />
          <CompactStat label="YILLIK TOP. MALİYET" value={summary.totalCost.toLocaleString()} unit="₺" />
          <CompactStat label="YILLIK TOP. SAAT" value={Math.round(summary.totalHours).toLocaleString()} unit="Sa" />
          <CompactStat label="ORTALAMA VERİM" value={summary.avgEfficiency.toFixed(2)} unit="KG/Sa" />
        </div>

        {/* MAIN TABLE */}
        <div className="border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse erp-table">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="w-[180px]">EKİP PERFORMANS</th>
                <th className="text-center">YILLIK ÜRETİM</th>
                <th className="text-center">YILLIK SAAT</th>
                <th className="text-center">VERİM (KG/SA)</th>
                <th className="text-right">BİRİM MALİYET</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {teamMatrix.map((team) => (
                <React.Fragment key={team.id}>
                  <tr className="bg-slate-50 font-bold">
                    <td className="px-3 py-1.5 text-[10px] text-slate-900">{team.name.toUpperCase()}</td>
                    <td className="text-center text-slate-700">{team.annualKg.toLocaleString()}</td>
                    <td className="text-center text-slate-500">{Math.round(team.annualHours).toLocaleString()}</td>
                    <td className="text-center text-blue-700">{team.efficiency.toFixed(2)}</td>
                    <td className="text-right text-emerald-700">₺{team.unitCost.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colSpan={5} className="p-2 bg-white">
                      <div className="grid grid-cols-6 gap-2">
                        {team.monthlyData.map((m) => m.hasData && (
                          <div key={m.month} className="bg-slate-50 border border-slate-100 p-2 rounded flex flex-col gap-1">
                            <div className="flex justify-between items-center border-b border-slate-200 pb-1 mb-1">
                              <span className="text-[8px] font-black text-slate-400 uppercase">{m.month.substr(0,3)}</span>
                              <span className="text-[8px] font-bold text-blue-600 bg-blue-50 px-1 rounded">{m.personnel} P.</span>
                            </div>
                            <div className="flex justify-between text-[8px]">
                              <span className="text-slate-400">KG:</span>
                              <span className="font-bold text-slate-700">{m.kg.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-[8px]">
                              <span className="text-slate-400">SAAT:</span>
                              <span className="font-bold text-slate-700">{Math.round(m.hours)}</span>
                            </div>
                            <div className="flex justify-between text-[8px]">
                              <span className="text-slate-400">B.MLY:</span>
                              <span className="font-bold text-emerald-600">₺{m.unitCost.toFixed(2)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between text-[7px] font-black text-slate-300 uppercase tracking-widest italic">
           <span>YILLIK KONSOLİDE RAPORLAMA ÜNİTESİ - PA-ERP-CORE</span>
           <span>ÇIKTI TARİHİ: {new Date().toLocaleString('tr-TR')}</span>
        </div>
      </div>
    </div>
  );
};

const CompactStat = ({ label, value, unit }: any) => (
  <div className="bg-white border border-slate-200 p-3 rounded flex flex-col items-center text-center">
    <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</span>
    <div className="flex items-baseline gap-1">
      <span className="text-sm font-black text-slate-900 tracking-tighter">{value}</span>
      <span className="text-[8px] font-bold text-slate-400">{unit}</span>
    </div>
  </div>
);

export default YearlyReport;