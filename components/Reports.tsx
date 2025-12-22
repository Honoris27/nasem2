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

  const filteredEntries = useMemo(() => 
    entries.filter(e => e.year === filterYear && e.month === filterMonth),
    [entries, filterYear, filterMonth]
  );

  const filteredBudgets = useMemo(() => 
    budgets.filter(b => b.year === filterYear && b.month === filterMonth),
    [budgets, filterYear, filterMonth]
  );

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

  const matrixData = useMemo(() => {
    return teams.map(team => {
      const teamEntries = filteredEntries.filter(e => e.teamId === team.id);
      const teamBudget = filteredBudgets.find(b => b.teamId === team.id);
      if (teamEntries.length === 0 && (!teamBudget || teamBudget.amountTL === 0)) return null;

      const teamTotalKg = teamEntries.reduce((acc, curr) => acc + curr.quantityKg, 0);
      const teamTotalHours = teamBudget ? (teamBudget.personnelCount * (teamBudget.workingDays?.length || 0) * DAILY_WORKING_HOURS) : 0;
      const teamCost = teamBudget?.amountTL || 0;
      const unitCost = teamTotalKg > 0 ? (teamCost / teamTotalKg) : 0;
      const personnelCount = teamBudget?.personnelCount || 0;

      const projectBreakdown = Array.from(new Set(teamEntries.map(e => e.projectId))).map(pId => {
        const pEntries = teamEntries.filter(e => e.projectId === pId);
        const pName = projects.find(p => p.id === pId)?.name || '---';
        const pTotalKg = pEntries.reduce((a, c) => a + c.quantityKg, 0);
        
        // ORANLAMA MANTIĞI: Projenin toplam üretimdeki payı kadar adam-saat ve maliyet atanır
        const projectRatio = teamTotalKg > 0 ? (pTotalKg / teamTotalKg) : 0;
        const pAllocatedHours = teamTotalHours * projectRatio;
        const pAllocatedCost = teamCost * projectRatio;
        const pUnitCost = pTotalKg > 0 ? (pAllocatedCost / pTotalKg) : 0;

        return {
          id: pId,
          name: pName,
          imalat: pEntries.filter(e => e.type === ProductionType.IMALAT).reduce((a, c) => a + c.quantityKg, 0),
          kaynak: pEntries.filter(e => e.type === ProductionType.KAYNAK).reduce((a, c) => a + c.quantityKg, 0),
          temizlik: pEntries.filter(e => e.type === ProductionType.TEMIZLIK).reduce((a, c) => a + c.quantityKg, 0),
          total: pTotalKg,
          hours: pAllocatedHours,
          unitCost: pUnitCost
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
        hours: teamTotalHours,
        unitCost: unitCost,
        projects: projectBreakdown
      };
    }).filter(item => item !== null);
  }, [teams, projects, filteredEntries, filteredBudgets]);

  return (
    <div className="space-y-4">
      {/* FILTER PANEL */}
      <div className="bg-white border border-slate-200 p-3 flex items-center justify-between no-print rounded">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase">DÖNEM SEÇİMİ:</span>
            <select className="bg-slate-50 border border-slate-200 text-[11px] font-bold px-2 py-1 outline-none" value={filterYear} onChange={e => setFilterYear(Number(e.target.value))}>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select className="bg-slate-50 border border-slate-200 text-[11px] font-bold px-2 py-1 outline-none" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
              {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>
        <button onClick={() => window.print()} className="bg-slate-900 text-white px-5 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 rounded">
          <Printer size={14} /> LANDSCAPE YAZDIR
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
              <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none">PROANALİZ ENTERPRISE CLOUD</h1>
              <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">Endüstriyel Verimlilik Konsolide Veritabanı</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-sm font-black text-slate-900 uppercase">{filterMonth.toUpperCase()} {filterYear} PERFORMANS MATRİSİ</h2>
            <div className="text-[9px] font-bold text-slate-400 mt-1 uppercase italic tracking-widest">SİSTEM ONAYLI RESMİ ÇIKTI</div>
          </div>
        </div>

        {/* STATS TILES (COMPACT) */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <CompactStat label="TOP. ÜRETİM" value={summary.totalKg.toLocaleString()} unit="KG" />
          <CompactStat label="TOP. MALİYET" value={summary.totalCost.toLocaleString()} unit="₺" />
          <CompactStat label="TOP. ADAM-SAAT" value={Math.round(summary.totalHours).toLocaleString()} unit="Sa" />
          <CompactStat label="AKTİF EKİP" value={summary.activeTeams.toString()} unit="UNIT" />
        </div>

        {/* MAIN DATA TABLE (ULTRA COMPACT) */}
        <div className="border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse table-fixed erp-table">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="w-[180px]">EKİP / PROJE KIRILIMI</th>
                <th className="text-center w-[80px]">İMALAT</th>
                <th className="text-center w-[80px]">KAYNAK</th>
                <th className="text-center w-[80px]">TEMİZLİK</th>
                <th className="text-center bg-slate-800 w-[100px]">TOPLAM KG</th>
                <th className="text-center w-[70px]">ADAM-SAAT</th>
                <th className="text-right w-[90px]">B. MALİYET</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {matrixData.map((team) => (
                <React.Fragment key={team.teamId}>
                  <tr className="bg-slate-50 font-bold">
                    <td className="px-3 py-1.5 flex items-center justify-between">
                      <span className="text-[10px] text-slate-900">{team.teamName.toUpperCase()}</span>
                      <span className="text-[8px] bg-blue-100 text-blue-700 px-1 rounded">({team.personnelCount} P.)</span>
                    </td>
                    <td className="text-center text-slate-500">{team.imalat.toLocaleString()}</td>
                    <td className="text-center text-slate-500">{team.kaynak.toLocaleString()}</td>
                    <td className="text-center text-slate-500">{team.temizlik.toLocaleString()}</td>
                    <td className="text-center text-blue-700 bg-slate-100/50">{team.totalKg.toLocaleString()}</td>
                    <td className="text-center text-slate-900">{Math.round(team.hours).toLocaleString()}</td>
                    <td className="text-right text-emerald-700">₺{team.unitCost.toFixed(2)}</td>
                  </tr>
                  {team.projects.map(p => (
                    <tr key={p.id} className="text-slate-400 italic">
                      <td className="pl-6 py-1 text-[9px] border-r border-slate-50">{p.name.toLowerCase()}</td>
                      <td className="text-center text-[9px] border-r border-slate-50">{p.imalat.toLocaleString()}</td>
                      <td className="text-center text-[9px] border-r border-slate-50">{p.kaynak.toLocaleString()}</td>
                      <td className="text-center text-[9px] border-r border-slate-50">{p.temizlik.toLocaleString()}</td>
                      <td className="text-center text-[9px] font-bold text-slate-600 border-r border-slate-50">{p.total.toLocaleString()}</td>
                      <td className="text-center text-[9px] text-slate-400 font-bold">{Math.round(p.hours).toLocaleString()}</td>
                      <td className="text-right text-[9px] text-emerald-600/60 font-bold">₺{p.unitCost.toFixed(2)}</td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between text-[7px] font-black text-slate-300 uppercase tracking-widest italic">
           <span>DIGITAL ERP INFRASTRUCTURE - PA-788 SECURE REPORT</span>
           <span>SİSTEM TARİHİ: {new Date().toLocaleString('tr-TR')}</span>
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

export default Reports;