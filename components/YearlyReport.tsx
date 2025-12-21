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
  const [reportType, setReportType] = useState('Yıllık Faaliyet Raporu');

  // Filtrelenmiş Yıllık Veriler
  const yearlyEntries = useMemo(() => entries.filter(e => e.year === filterYear), [entries, filterYear]);
  const yearlyBudgets = useMemo(() => budgets.filter(b => b.year === filterYear), [budgets, filterYear]);

  // Üst Kart Hesaplamaları
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

  // Ekip Bazlı Yıllık Matris Verisi
  const teamMatrix = useMemo(() => {
    return teams.map(team => {
      const tEntries = yearlyEntries.filter(e => e.teamId === team.id);
      const tBudgets = yearlyBudgets.filter(b => b.teamId === team.id);
      
      const annualKg = tEntries.reduce((a, c) => a + c.quantityKg, 0);
      const annualHours = tBudgets.reduce((a, c) => a + (c.personnelCount * (c.workingDays?.length || 0) * DAILY_WORKING_HOURS), 0);
      const annualCost = tBudgets.reduce((a, c) => a + c.amountTL, 0);
      
      const efficiency = annualHours > 0 ? (annualKg / annualHours) : 0;
      const unitCost = annualKg > 0 ? (annualCost / annualKg) : 0;

      // Aylık Dağılım
      const monthlyData = MONTHS.map(month => {
        const mEntries = tEntries.filter(e => e.month === month);
        const mBudget = tBudgets.find(b => b.month === month);
        const mKg = mEntries.reduce((a, c) => a + c.quantityKg, 0);
        const mCost = mBudget?.amountTL || 0;
        
        return {
          month,
          kg: mKg,
          cost: mCost,
          hasData: mKg > 0 || mCost > 0
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
    <div className="space-y-8 pb-20">
      {/* Filtre Paneli */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm no-print flex items-center justify-between gap-6">
        <div className="flex items-center gap-12">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
               <FileText size={14} className="text-blue-500" /> RAPOR KAPSAMI
            </label>
            <div className="relative">
              <select 
                className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 pr-12 text-xs font-black text-slate-700 outline-none w-64"
                value={reportType}
                onChange={e => setReportType(e.target.value)}
              >
                <option>Yıllık Faaliyet Raporu</option>
                <option>Konsolide Ekip Özeti</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
               <Calendar size={14} className="text-blue-500" /> MALİ YIL
            </label>
            <div className="relative">
              <select 
                className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 pr-12 text-xs font-black text-slate-700 outline-none w-48"
                value={filterYear}
                onChange={e => setFilterYear(Number(e.target.value))}
              >
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
          </div>
        </div>
        <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-black text-xs flex items-center gap-3 transition-all shadow-xl shadow-blue-500/20 active:scale-95">
          <Printer size={18} /> YAZDIR (YATAY)
        </button>
      </div>

      {/* Rapor Kartı */}
      <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 report-card relative overflow-hidden print:p-4 print:rounded-none print:shadow-none print:border-none">
        {/* Header */}
        <div className="relative z-10 flex justify-between items-start border-b-4 border-slate-900 pb-10 mb-12">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-2xl print:shadow-none">
              <Activity size={32} strokeWidth={3} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">PROANALİZ ENTERPRISE</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] mt-2 italic">Endüstriyel Verimlilik ve Performans Portalı</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-black text-slate-900 uppercase leading-none mb-3 tracking-tighter">{filterYear} YILI KURUMSAL FAALİYET ÖZETİ</h2>
            <div className="inline-block bg-slate-900 text-white px-6 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest">
              DÖNEM: 1 OCAK - 31 ARALIK {filterYear}
            </div>
          </div>
        </div>

        {/* Summary Stat Tiles */}
        <div className="grid grid-cols-4 gap-6 mb-16 relative z-10 print:gap-2 print:mb-8">
          <ReportStatTile label="YILLIK TOP. ÜRETİM" value={summary.totalKg.toLocaleString()} unit="KG" />
          <ReportStatTile label="YILLIK TOP. MALİYET" value={summary.totalCost.toLocaleString()} unit="₺" />
          <ReportStatTile label="YILLIK TOP. SAAT" value={Math.round(summary.totalHours).toLocaleString()} unit="Sa" />
          <ReportStatTile label="ORTALAMA VERİM" value={summary.avgEfficiency.toFixed(2)} unit="KG/Sa" />
        </div>

        {/* Main Matrix Table */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6 px-1 print:mb-4">
            <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600 print:hidden">
              <LayoutGrid size={18} />
            </div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">VERİ MATRİSİ & PERFORMANS DETAYI</h3>
            <div className="ml-auto text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Birim: KG / TRY / Adam-Saat</div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 shadow-sm print:rounded-none print:shadow-none print:border-slate-300">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0f172a] text-white text-[10px] font-black uppercase tracking-[0.15em] print:bg-slate-900 print:text-white">
                  <th className="px-8 py-6 border-r border-slate-800 print:px-4 print:py-3">EKİP ADI</th>
                  <th className="px-4 py-6 text-center border-r border-slate-800 print:py-3">YILLIK ÜRETİM</th>
                  <th className="px-4 py-6 text-center border-r border-slate-800 print:py-3">YILLIK SAAT</th>
                  <th className="px-4 py-6 text-center border-r border-slate-800 text-blue-400 print:text-blue-300 print:py-3">VERİM (KG/SA)</th>
                  <th className="px-4 py-6 text-right print:py-3">BİRİM MALİYET</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teamMatrix.map((team) => (
                  <React.Fragment key={team.id}>
                    <tr className="bg-white hover:bg-slate-50/50 transition-colors print:bg-white">
                      <td className="px-8 py-5 border-r border-slate-100 print:px-4 print:py-3">
                        <span className="text-[11px] font-black text-slate-900 uppercase tracking-tighter">{team.name}</span>
                      </td>
                      <td className="px-4 py-5 text-center text-xs font-black text-slate-800 border-r border-slate-100 print:py-3">{team.annualKg.toLocaleString()}</td>
                      <td className="px-4 py-5 text-center text-xs font-bold text-slate-500 border-r border-slate-100 print:py-3">{Math.round(team.annualHours).toLocaleString()}</td>
                      <td className="px-4 py-5 text-center text-xs font-black text-blue-600 border-r border-slate-100 print:py-3">{team.efficiency.toFixed(2)}</td>
                      <td className="px-4 py-5 text-right text-xs font-black text-emerald-600 print:py-3">
                        ₺{team.unitCost.toFixed(2)}
                      </td>
                    </tr>
                    
                    <tr>
                      <td colSpan={5} className="px-8 py-6 bg-slate-50/30 border-b border-slate-100 print:px-4 print:py-3">
                        <div className="grid grid-cols-6 gap-3 max-w-5xl mx-auto print:max-w-none print:gap-2">
                          {team.monthlyData.map((m) => (
                            <div key={m.month} className={`px-4 py-3 rounded-2xl border transition-all text-center flex flex-col justify-center min-h-[70px] print:rounded-lg print:p-1 print:min-h-0 ${
                              m.hasData 
                              ? 'bg-white border-blue-200 shadow-sm print:shadow-none print:border-slate-200' 
                              : 'bg-transparent border-slate-100 opacity-20 print:hidden'
                            }`}>
                              <span className="text-[9px] font-black text-slate-400 uppercase mb-1">{m.month.substr(0,3).toUpperCase()}</span>
                              {m.hasData && (
                                <>
                                  <div className="text-[10px] font-black text-slate-900">{m.kg.toLocaleString()}</div>
                                  <div className="text-[8px] font-bold text-emerald-500">₺{(m.cost / 1000).toFixed(1)}k</div>
                                </>
                              )}
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

        <div className="mt-16 pt-8 border-t border-slate-100 hidden print:flex justify-between text-[8px] font-bold text-slate-400 uppercase tracking-widest">
           <span>ProAnaliz Enterprise Cloud Report Infrastructure</span>
           <span>Sistem Onaylı Elektronik Çıktı - {new Date().toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

const ReportStatTile = ({ label, value, unit }: { label: string, value: string, unit: string }) => (
  <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col items-start relative overflow-hidden group hover:border-blue-300 transition-all print:p-4 print:rounded-xl print:shadow-none">
    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 relative z-10 print:mb-1">{label}</span>
    <div className="flex items-baseline gap-2 relative z-10">
      <h4 className="text-2xl font-black text-slate-900 tracking-tighter print:text-xl">{value}</h4>
      <span className="text-[11px] font-black text-slate-400 uppercase print:text-[9px]">{unit}</span>
    </div>
  </div>
);

export default YearlyReport;