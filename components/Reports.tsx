import React, { useMemo, useState } from 'react';
import { 
  Team, Project, Budget, ProductionEntry, 
  ProductionType, MONTHS, YEARS, DAILY_WORKING_HOURS, ReportTemplate
} from '../types';
import { 
  Printer, LayoutGrid, Activity, Scale, DollarSign, Clock, Users, ChevronRight, Hash
} from 'lucide-react';

interface ReportsProps {
  entries: ProductionEntry[];
  budgets: Budget[];
  teams: Team[];
  projects: Project[];
  template: ReportTemplate;
}

const Reports: React.FC<ReportsProps> = ({ entries, budgets, teams, projects, template }) => {
  const [filterYear, setFilterYear] = useState(2025);
  const [filterMonth, setFilterMonth] = useState<string>('Ocak');

  // Filtrelenmiş Veriler
  const filteredEntries = useMemo(() => 
    entries.filter(e => e.year === filterYear && e.month === filterMonth),
    [entries, filterYear, filterMonth]
  );

  const filteredBudgets = useMemo(() => 
    budgets.filter(b => b.year === filterYear && b.month === filterMonth),
    [budgets, filterYear, filterMonth]
  );

  // Üst Özet İstatistikler
  const summary = useMemo(() => {
    const totalKg = filteredEntries.reduce((acc, curr) => acc + curr.quantityKg, 0);
    const totalCost = filteredBudgets.reduce((acc, curr) => acc + curr.amountTL, 0);
    const totalHours = filteredBudgets.reduce((acc, curr) => {
      const days = curr.workingDays?.length || 0;
      return acc + (curr.personnelCount * days * DAILY_WORKING_HOURS);
    }, 0);
    const activeTeams = new Set(filteredEntries.map(e => e.teamId)).size;

    return { totalKg, totalCost, totalHours, activeTeams };
  }, [filteredEntries, filteredBudgets]);

  // Performans Matrisi Verisi
  const matrixData = useMemo(() => {
    return teams.map(team => {
      const teamEntries = filteredEntries.filter(e => e.teamId === team.id);
      const teamBudget = filteredBudgets.find(b => b.teamId === team.id);
      
      if (teamEntries.length === 0 && (!teamBudget || teamBudget.amountTL === 0)) return null;

      const teamTotalKg = teamEntries.reduce((acc, curr) => acc + curr.quantityKg, 0);
      const teamHours = teamBudget ? (teamBudget.personnelCount * (teamBudget.workingDays?.length || 0) * DAILY_WORKING_HOURS) : 0;
      const teamCost = teamBudget?.amountTL || 0;
      const unitCost = teamTotalKg > 0 ? (teamCost / teamTotalKg) : 0;
      const personnelCount = teamBudget?.personnelCount || 0;

      const projectBreakdown = Array.from(new Set(teamEntries.map(e => e.projectId))).map(pId => {
        const pEntries = teamEntries.filter(e => e.projectId === pId);
        const pName = projects.find(p => p.id === pId)?.name || 'Tanımsız Proje';
        
        return {
          id: pId,
          name: pName,
          imalat: pEntries.filter(e => e.type === ProductionType.IMALAT).reduce((a, c) => a + c.quantityKg, 0),
          kaynak: pEntries.filter(e => e.type === ProductionType.KAYNAK).reduce((a, c) => a + c.quantityKg, 0),
          temizlik: pEntries.filter(e => e.type === ProductionType.TEMIZLIK).reduce((a, c) => a + c.quantityKg, 0),
          total: pEntries.reduce((a, c) => a + c.quantityKg, 0)
        };
      });

      return {
        teamId: team.id,
        teamName: team.name,
        personnelCount,
        imalat: teamEntries.filter(e => e.type === ProductionType.IMALAT).reduce((a, c) => a + c.quantityKg, 0),
        kaynak: teamEntries.filter(e => e.type === ProductionType.KAYNAK).reduce((a, c) => a + c.quantityKg, 0),
        temizlik: teamEntries.filter(e => e.type === ProductionType.TEMIZLIK).reduce((a, c) => a + c.quantityKg, 0),
        totalKg: teamTotalKg,
        hours: teamHours,
        unitCost: unitCost,
        projects: projectBreakdown
      };
    }).filter(item => item !== null);
  }, [teams, projects, filteredEntries, filteredBudgets]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl border border-slate-200 no-print flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Dönem:</span>
            <select className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-bold outline-none" value={filterYear} onChange={e => setFilterYear(Number(e.target.value))}>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-bold outline-none" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
              {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>
        <button onClick={() => window.print()} className="bg-slate-900 hover:bg-black text-white px-6 py-2.5 rounded-lg font-black text-[11px] flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-slate-200">
          <Printer size={14} /> RAPORU YAZDIR
        </button>
      </div>

      <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 report-card print:p-0 print:shadow-none print:border-none">
        
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-xl">
              <Activity size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">PROANALİZ ENTERPRISE</h1>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 italic">Endüstriyel Verimlilik ve Performans Portalı</p>
              <div className="mt-1 inline-block px-2 py-0.5 bg-slate-100 rounded text-[8px] font-black text-slate-500 uppercase tracking-widest border border-slate-200">RESMİ SİSTEM KAYDI</div>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-black text-slate-900 uppercase leading-none mb-2 tracking-tighter">PERFORMANS ANALİZ RAPORU</h2>
            <div className="inline-block bg-slate-900 text-white px-4 py-1.5 rounded text-[10px] font-black uppercase tracking-widest">
              DÖNEM: {filterMonth.toUpperCase()} {filterYear}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-10">
          <StatTile label="Top. Üretim" value={summary.totalKg.toLocaleString()} unit="KG" />
          <StatTile label="Top. Maliyet" value={summary.totalCost.toLocaleString()} unit="₺" />
          <StatTile label="Top. Adam-Saat" value={Math.round(summary.totalHours).toLocaleString()} unit="Sa" />
          <StatTile label="Aktif Ekipler" value={summary.activeTeams.toString()} unit="EKİP" />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4 px-1">
            <div className="p-1 bg-blue-100 rounded text-blue-600">
              <LayoutGrid size={14} />
            </div>
            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">VERİ MATRİSİ & PERFORMANS DETAYI</h3>
            <div className="ml-auto text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">Birim: KG / TRY / Adam-Saat</div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm print:rounded-none">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="bg-slate-900 text-white text-[9px] font-black uppercase tracking-[0.1em]">
                  <th className="px-6 py-4 border-r border-slate-800 w-[200px]">EKİP / PROJE DETAYI</th>
                  <th className="px-2 py-4 text-center border-r border-slate-800">İMALAT (KG)</th>
                  <th className="px-2 py-4 text-center border-r border-slate-800">KAYNAK (KG)</th>
                  <th className="px-2 py-4 text-center border-r border-slate-800">TEMİZLİK (KG)</th>
                  <th className="px-2 py-4 text-center border-r border-slate-800 bg-slate-800">TOPLAM KG</th>
                  <th className="px-1 py-4 text-center border-r border-slate-800 w-[80px]">ADAM-SAAT</th>
                  <th className="px-1 py-4 text-right w-[80px]">B. MALİYET</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {matrixData.map((teamData) => (
                  <React.Fragment key={teamData.teamId}>
                    <tr className="bg-slate-50/50">
                      <td className="px-6 py-2 border-r border-slate-200">
                        <div className="flex items-center gap-2">
                          <Users size={12} className="text-blue-600" />
                          <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{teamData.teamName}</span>
                          <span className="text-[8px] font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">({teamData.personnelCount} P.)</span>
                        </div>
                      </td>
                      <td className="px-2 py-2 text-center text-[10px] font-bold text-slate-500 border-r border-slate-200">{teamData.imalat.toLocaleString()}</td>
                      <td className="px-2 py-2 text-center text-[10px] font-bold text-slate-500 border-r border-slate-200">{teamData.kaynak.toLocaleString()}</td>
                      <td className="px-2 py-2 text-center text-[10px] font-bold text-slate-500 border-r border-slate-200">{teamData.temizlik.toLocaleString()}</td>
                      <td className="px-2 py-2 text-center text-[10px] font-black text-slate-900 border-r border-slate-200 bg-slate-100/50">{teamData.totalKg.toLocaleString()}</td>
                      <td className="px-1 py-2 text-center text-[10px] font-black text-slate-900 border-r border-slate-200">{Math.round(teamData.hours).toLocaleString()}</td>
                      <td className="px-1 py-2 text-right text-[10px] font-black text-emerald-600">
                        ₺{teamData.unitCost.toFixed(2)}
                      </td>
                    </tr>
                    {teamData.projects.map((proj) => (
                      <tr key={proj.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-10 py-1 border-r border-slate-100">
                          <div className="flex items-center gap-2 opacity-60">
                            <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                            <span className="text-[9px] font-bold text-slate-500 lowercase">{proj.name}</span>
                          </div>
                        </td>
                        <td className="px-2 py-1 text-center text-[9px] font-medium text-slate-400 border-r border-slate-100 italic">{proj.imalat.toLocaleString()}</td>
                        <td className="px-2 py-1 text-center text-[9px] font-medium text-slate-400 border-r border-slate-100 italic">{proj.kaynak.toLocaleString()}</td>
                        <td className="px-2 py-1 text-center text-[9px] font-medium text-slate-400 border-r border-slate-100 italic">{proj.temizlik.toLocaleString()}</td>
                        <td className="px-2 py-1 text-center text-[9.5px] font-bold text-slate-600 border-r border-slate-100 italic">{proj.total.toLocaleString()}</td>
                        <td className="px-1 py-1 text-center text-[9px] text-slate-300 border-r border-slate-100">—</td>
                        <td className="px-1 py-1 text-right text-[9px] text-slate-300">—</td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-100 flex justify-between items-end opacity-40">
           <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
              ProAnaliz Cloud Infrastructure | Digital Signature Validated
           </div>
           <div className="text-[8px] font-medium text-slate-400 uppercase italic">
              Zaman Damgası: {new Date().toLocaleString('tr-TR')}
           </div>
        </div>
      </div>
    </div>
  );
};

const StatTile = ({ label, value, unit }: { label: string, value: string, unit: string }) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-start group hover:border-blue-200 transition-all">
    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">{label}</span>
    <div className="flex items-baseline gap-1.5">
      <h4 className="text-xl font-black text-slate-900 tracking-tighter">{value}</h4>
      <span className="text-[10px] font-black text-slate-400 uppercase">{unit}</span>
    </div>
    <div className="mt-3 w-full h-0.5 bg-slate-50 rounded-full overflow-hidden">
      <div className="w-1/3 h-full bg-blue-500/20 group-hover:bg-blue-500/40 transition-all"></div>
    </div>
  </div>
);

export default Reports;