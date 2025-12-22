import React, { useMemo, useState } from 'react';
import { 
  Team, Project, Budget, ProductionEntry, 
  MONTHS, YEARS, DAILY_WORKING_HOURS, ReportTheme
} from '../types';
import { 
  Printer, Activity, Loader2, PlayCircle
} from 'lucide-react';

interface YearlyReportProps {
  entries: ProductionEntry[];
  budgets: Budget[];
  teams: Team[];
  projects: Project[];
  theme: ReportTheme;
}

const YearlyReport: React.FC<YearlyReportProps> = ({ entries, budgets, teams, projects, theme }) => {
  const [filterYear, setFilterYear] = useState(2025);
  const [reportReady, setReportReady] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setReportReady(true);
    }, 1200);
  };

  const yearlyEntries = useMemo(() => entries.filter(e => e.year === filterYear), [entries, filterYear]);
  const yearlyBudgets = useMemo(() => budgets.filter(b => b.year === filterYear), [budgets, filterYear]);

  const summary = useMemo(() => {
    const totalKg = yearlyEntries.reduce((acc, curr) => acc + curr.quantityKg, 0);
    const totalCost = yearlyBudgets.reduce((acc, curr) => acc + curr.amountTL, 0);
    const totalHours = yearlyBudgets.reduce((acc, curr) => {
      const days = curr.workingDays?.length || 30;
      return acc + (curr.personnelCount * days * DAILY_WORKING_HOURS);
    }, 0);
    return { totalKg, totalCost, totalHours, avgEfficiency: totalHours > 0 ? (totalKg / totalHours) : 0 };
  }, [yearlyEntries, yearlyBudgets]);

  const teamMatrix = useMemo(() => {
    if (!reportReady) return [];
    return teams.map(team => {
      const tEntries = yearlyEntries.filter(e => e.teamId === team.id);
      const tBudgets = yearlyBudgets.filter(b => b.teamId === team.id);
      
      const annualKg = tEntries.reduce((a, c) => a + c.quantityKg, 0);
      const annualHours = tBudgets.reduce((a, c) => a + (c.personnelCount * (c.workingDays?.length || 30) * DAILY_WORKING_HOURS), 0);
      const annualCost = tBudgets.reduce((a, c) => a + c.amountTL, 0);

      const monthlyData = MONTHS.map(month => {
        const mEntries = tEntries.filter(e => e.month === month);
        const mBudget = tBudgets.find(b => b.month === month);
        const mKg = mEntries.reduce((a, c) => a + c.quantityKg, 0);
        const mCost = mBudget?.amountTL || 0;
        const mPersonnel = mBudget?.personnelCount || 0;
        const mHours = mBudget ? (mBudget.personnelCount * (mBudget.workingDays?.length || 30) * DAILY_WORKING_HOURS) : 0;
        
        return {
          month,
          kg: mKg,
          personnel: mPersonnel,
          hours: mHours,
          unitCost: mKg > 0 ? (mCost / mKg) : 0,
          hasData: mKg > 0 || mCost > 0 || mPersonnel > 0
        };
      });

      return {
        id: team.id,
        name: team.name,
        annualKg,
        annualHours,
        efficiency: annualHours > 0 ? (annualKg / annualHours) : 0,
        unitCost: annualKg > 0 ? (annualCost / annualKg) : 0,
        monthlyData
      };
    }).filter(t => t.annualKg > 0 || t.annualHours > 0);
  }, [teams, yearlyEntries, yearlyBudgets, reportReady]);

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 p-3 flex items-center justify-between no-print rounded">
        <div className="flex items-center gap-4">
          <select className="bg-slate-50 border border-slate-200 text-[11px] font-bold px-2 py-1 outline-none" value={filterYear} onChange={e => {setFilterYear(Number(e.target.value)); setReportReady(false);}}>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button 
            onClick={handleAnalyze} 
            disabled={isAnalyzing} 
            className="text-white px-6 py-2 rounded text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
            style={{ backgroundColor: theme.secondary }}
          >
            {isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <PlayCircle size={14} />}
            {reportReady ? 'ANALİZİ YENİLE' : 'YILLIK ANALİZİ BAŞLAT'}
          </button>
        </div>
        {reportReady && (
          <button 
            onClick={() => window.print()} 
            className="text-white px-5 py-2 text-[10px] font-black uppercase rounded flex items-center gap-2"
            style={{ backgroundColor: theme.primary }}
          >
            <Printer size={14} /> YAZDIR
          </button>
        )}
      </div>

      {isAnalyzing && (
        <div className="bg-white p-20 rounded border border-slate-200 flex flex-col items-center justify-center">
           <Loader2 size={32} className="animate-spin mb-4" style={{ color: theme.secondary }} />
           <p className="text-xs font-black text-slate-900 uppercase tracking-[0.3em]">Yıllık Projeksiyon Oluşturuluyor...</p>
        </div>
      )}

      {reportReady && (
        <div className="bg-white p-6 border border-slate-300 report-card print:p-0">
          <div className="flex justify-between items-end pb-4 mb-6" style={{ borderBottom: `2px solid ${theme.primary}` }}>
            <div className="flex items-center gap-4">
              <div className="p-2 text-white rounded" style={{ backgroundColor: theme.secondary }}><Activity size={24} /></div>
              <h1 className="text-xl font-black text-slate-900 uppercase leading-none">{filterYear} YILLIK KONSOLİDE ANALİZ</h1>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-6">
            <CompactStat label="YILLIK KG" value={summary.totalKg.toLocaleString()} unit="KG" theme={theme} />
            <CompactStat label="YILLIK MLY" value={summary.totalCost.toLocaleString()} unit="₺" theme={theme} />
            <CompactStat label="YILLIK SAAT" value={Math.round(summary.totalHours).toLocaleString()} unit="Sa" theme={theme} />
            <CompactStat label="VERİM" value={summary.avgEfficiency.toFixed(2)} unit="KG/Sa" theme={theme} />
          </div>

          <div className="border border-slate-200 overflow-hidden rounded shadow-sm">
            <table className="w-full text-left border-collapse erp-table">
              <thead>
                <tr className="text-white" style={{ backgroundColor: theme.primary }}>
                  <th className="w-[180px]">EKİP PERFORMANS</th>
                  <th className="text-center">YILLIK ÜRETİM</th>
                  <th className="text-center">YILLIK SAAT</th>
                  <th className="text-center">VERİM (KG/SA)</th>
                  <th className="text-right">BİRİM MALİYET</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teamMatrix.map((team: any) => (
                  <React.Fragment key={team.id}>
                    <tr className="bg-slate-50 font-bold">
                      <td className="px-3 py-1.5 text-[10px] text-slate-900 uppercase">{team.name}</td>
                      <td className="text-center text-slate-700">{team.annualKg.toLocaleString()}</td>
                      <td className="text-center text-slate-500">{Math.round(team.annualHours).toLocaleString()}</td>
                      <td className="text-center font-bold" style={{ color: theme.secondary }}>{team.efficiency.toFixed(2)}</td>
                      <td className="text-right font-bold" style={{ color: theme.accent }}>₺{team.unitCost.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td colSpan={5} className="p-2 bg-white">
                        <div className="grid grid-cols-6 gap-2">
                          {team.monthlyData.map((m: any) => m.hasData && (
                            <div key={m.month} className="bg-slate-50 border border-slate-100 p-2 rounded flex flex-col gap-1">
                              <div className="flex justify-between items-center border-b border-slate-200 pb-1 mb-1">
                                <span className="text-[8px] font-black text-slate-400 uppercase">{m.month.substr(0,3)}</span>
                                <span className="text-[8px] font-bold px-1 rounded" style={{ backgroundColor: `${theme.secondary}15`, color: theme.secondary }}>{m.personnel} P.</span>
                              </div>
                              <div className="flex justify-between text-[8px]">
                                <span className="text-slate-400">KG:</span>
                                <span className="font-bold text-slate-700">{m.kg.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-[8px]">
                                <span className="text-slate-400">SAAT:</span>
                                <span className="font-bold" style={{ color: theme.secondary }}>{Math.round(m.hours)}</span>
                              </div>
                              <div className="flex justify-between text-[8px]">
                                <span className="text-slate-400">MLY:</span>
                                <span className="font-bold" style={{ color: theme.accent }}>₺{m.unitCost.toFixed(2)}</span>
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
        </div>
      )}
    </div>
  );
};

const CompactStat = ({ label, value, unit, theme }: any) => (
  <div className="bg-white border border-slate-200 p-2 rounded flex flex-col items-center relative overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-[2px]" style={{ backgroundColor: theme.accent }}></div>
    <span className="text-[8px] font-black text-slate-400 uppercase mb-1 tracking-widest">{label}</span>
    <div className="flex items-baseline gap-1">
      <span className="text-sm font-black text-slate-900">{value}</span>
      <span className="text-[8px] font-bold text-slate-400">{unit}</span>
    </div>
  </div>
);

export default YearlyReport;