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
      {/* Filtre Paneli (Görseldeki gibi) */}
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
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-black text-xs flex items-center gap-3 transition-all shadow-xl shadow-blue-500/20 active:scale-95">
          <Activity size={18} /> ANALİZİ BAŞLAT
        </button>
      </div>

      {/* Rapor Kartı */}
      <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 report-card relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32 opacity-50"></div>
        
        {/* Header */}
        <div className="relative z-10 flex justify-between items-start border-b-4 border-slate-900 pb-10 mb-12">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-2xl">
              <Activity size={32} strokeWidth={3} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">PROANALİZ ENTERPRISE</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] mt-2 italic">Endüstriyel Verimlilik ve Performans Portalı</p>
              <div className="mt-2 inline-block px-3 py-1 bg-slate-100 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-widest border border-slate-200">RESMİ SİSTEM KAYDI</div>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-black text-slate-900 uppercase leading-none mb-3 tracking-tighter">{filterYear} YILI KURUMSAL FAALİYET ÖZETİ</h2>
            <div className="inline-block bg-slate-900 text-white px-6 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest shadow-lg">
              DÖNEM: 1 OCAK - 31 ARALIK {filterYear}
            </div>
          </div>
        </div>

        {/* Summary Stat Tiles (Identical to Image) */}
        <div className="grid grid-cols-4 gap-6 mb-16 relative z-10">
          <ReportStatTile label="YILLIK TOP. ÜRETİM" value={summary.totalKg.toLocaleString()} unit="KG" />
          <ReportStatTile label="YILLIK TOP. MALİYET" value={summary.totalCost.toLocaleString()} unit="₺" />
          <ReportStatTile label="YILLIK TOP. SAAT" value={Math.round(summary.totalHours).toLocaleString()} unit="Sa" />
          <ReportStatTile label="ORTALAMA VERİM" value={summary.avgEfficiency.toFixed(2)} unit="KG/Sa" />
        </div>

        {/* Main Matrix Table */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6 px-1">
            <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600">
              <LayoutGrid size={18} />
            </div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">VERİ MATRİSİ & PERFORMANS DETAYI</h3>
            <div className="ml-auto text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Birim: KG / TRY / Adam-Saat</div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0f172a] text-white text-[10px] font-black uppercase tracking-[0.15em]">
                  <th className="px-8 py-6 border-r border-slate-800">EKİP ADI</th>
                  <th className="px-4 py-6 text-center border-r border-slate-800">YILLIK ÜRETİM</th>
                  <th className="px-4 py-6 text-center border-r border-slate-800">YILLIK SAAT</th>
                  <th className="px-4 py-6 text-center border-r border-slate-800 text-blue-400">VERİM (KG/SA)</th>
                  <th className="px-4 py-6 text-right">BİRİM MALİYET</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teamMatrix.map((team) => (
                  <React.Fragment key={team.id}>
                    {/* Main Team Row */}
                    <tr className="bg-white hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5 border-r border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                            <Users size={14} />
                          </div>
                          <span className="text-[11px] font-black text-slate-900 uppercase tracking-tighter">{team.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-5 text-center text-xs font-black text-slate-800 border-r border-slate-100">{team.annualKg.toLocaleString()}</td>
                      <td className="px-4 py-5 text-center text-xs font-bold text-slate-500 border-r border-slate-100">{Math.round(team.annualHours).toLocaleString()}</td>
                      <td className="px-4 py-5 text-center text-xs font-black text-blue-600 border-r border-slate-100">{team.efficiency.toFixed(2)}</td>
                      <td className="px-4 py-5 text-right text-xs font-black text-emerald-600">
                        <span className="text-[10px] opacity-60 mr-1">₺</span>{team.unitCost.toFixed(2)}
                      </td>
                    </tr>
                    
                    {/* Monthly Grid Row (Inside the table area) */}
                    <tr>
                      <td colSpan={5} className="px-8 py-6 bg-slate-50/30 border-b border-slate-100">
                        <div className="grid grid-cols-6 gap-3 max-w-5xl mx-auto">
                          {team.monthlyData.map((m) => (
                            <div key={m.month} className={`px-4 py-3 rounded-2xl border transition-all text-center flex flex-col justify-center min-h-[70px] ${
                              m.hasData 
                              ? 'bg-white border-blue-200 shadow-sm scale-100' 
                              : 'bg-transparent border-slate-100 opacity-20 grayscale scale-95'
                            }`}>
                              <span className="text-[9px] font-black text-slate-400 uppercase mb-1">{m.month.toUpperCase()}</span>
                              {m.hasData && (
                                <>
                                  <div className="text-[11px] font-black text-slate-900">{m.kg.toLocaleString()}</div>
                                  <div className="text-[9px] font-bold text-emerald-500">₺{(m.cost / 1000).toFixed(1)}k</div>
                                </>
                              )}
                              {!m.hasData && <div className="h-4 w-8 mx-auto bg-slate-100 rounded"></div>}
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

        {/* Print Only Footer */}
        <div className="mt-16 pt-8 border-t border-slate-100 hidden print:flex justify-between text-[8px] font-bold text-slate-400 uppercase tracking-widest">
           <span>ProAnaliz Enterprise Cloud Report Infrastructure</span>
           <span>Sistem Onaylı Elektronik Çıktı - {new Date().toLocaleString()}</span>
        </div>
      </div>
      
      <div className="no-print flex justify-center mt-12">
         <button onClick={() => window.print()} className="bg-slate-900 text-white px-12 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-black flex items-center gap-4 transition-all active:scale-95">
            <Printer size={20} /> RAPORU YAZDIR VE ARŞİVLE
         </button>
      </div>
    </div>
  );
};

// Alt Bileşen: İstatistik Kartı (Görsel Tasarımı)
const ReportStatTile = ({ label, value, unit }: { label: string, value: string, unit: string }) => (
  <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col items-start relative overflow-hidden group hover:border-blue-300 transition-all">
    <div className="absolute top-0 right-0 w-24 h-24 -mr-12 -mt-12 bg-slate-50 rounded-full group-hover:bg-blue-50 transition-colors"></div>
    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 relative z-10">{label}</span>
    <div className="flex items-baseline gap-2 relative z-10">
      <h4 className="text-2xl font-black text-slate-900 tracking-tighter">{value}</h4>
      <span className="text-[11px] font-black text-slate-400 uppercase">{unit}</span>
    </div>
    <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-50 overflow-hidden">
       <div className="w-1/3 h-full bg-slate-100 group-hover:bg-blue-500/20 transition-all"></div>
    </div>
  </div>
);

export default YearlyReport;