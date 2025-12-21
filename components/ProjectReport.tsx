import React, { useMemo, useState } from 'react';
import { 
  Team, Project, Budget, ProductionEntry, 
  ProductionType, MONTHS, YEARS, DAILY_WORKING_HOURS
} from '../types';
import { 
  Printer, LayoutGrid, Users, Briefcase, ChevronDown, Activity, Calendar, Filter
} from 'lucide-react';

interface ProjectReportProps {
  entries: ProductionEntry[];
  budgets: Budget[];
  teams: Team[];
  projects: Project[];
}

const ProjectReport: React.FC<ProjectReportProps> = ({ entries, budgets, teams, projects }) => {
  const [filterYear, setFilterYear] = useState(2025);
  const [filterMonth, setFilterMonth] = useState('Ocak');
  const [selectedProjectId, setSelectedProjectId] = useState('');

  const selectedProjectName = useMemo(() => 
    projects.find(p => p.id === selectedProjectId)?.name || 'Proje Seçilmedi',
    [selectedProjectId, projects]
  );

  const filteredEntries = useMemo(() => 
    entries.filter(e => e.year === filterYear && e.month === filterMonth && e.projectId === selectedProjectId),
    [entries, filterYear, filterMonth, selectedProjectId]
  );

  const matrixData = useMemo(() => {
    if (!selectedProjectId) return [];
    const uniqueTeamIds = Array.from(new Set(filteredEntries.map(e => e.teamId)));
    return uniqueTeamIds.map(tId => {
      const team = teams.find(t => t.id === tId);
      const teamEntries = filteredEntries.filter(e => e.teamId === tId);
      const teamBudget = budgets.find(b => b.teamId === tId && b.year === filterYear && b.month === filterMonth);
      const imalat = teamEntries.filter(e => e.type === ProductionType.IMALAT).reduce((a, c) => a + c.quantityKg, 0);
      const kaynak = teamEntries.filter(e => e.type === ProductionType.KAYNAK).reduce((a, c) => a + c.quantityKg, 0);
      const temizlik = teamEntries.filter(e => e.type === ProductionType.TEMIZLIK).reduce((a, c) => a + c.quantityKg, 0);
      const total = imalat + kaynak + temizlik;
      const hours = teamBudget ? (teamBudget.personnelCount * (teamBudget.workingDays?.length || 0) * DAILY_WORKING_HOURS) : 0;
      const personnel = teamBudget?.personnelCount || 0;
      const cost = teamBudget?.amountTL || 0;
      const unitCost = total > 0 ? (cost / total) : 0;
      
      return { id: tId, name: team?.name || 'Ekip', imalat, kaynak, temizlik, total, hours, personnel, unitCost };
    });
  }, [filteredEntries, teams, budgets, filterYear, filterMonth, selectedProjectId]);

  const summary = useMemo(() => {
    const projectTotalKg = matrixData.reduce((a, c) => a + c.total, 0);
    const teamCount = matrixData.length;
    const avgPerTeam = teamCount > 0 ? (projectTotalKg / teamCount) : 0;
    return { projectTotalKg, teamCount, avgPerTeam };
  }, [matrixData]);

  return (
    <div className="space-y-4">
      {/* FILTER PANEL */}
      <div className="bg-white border border-slate-200 p-3 flex items-center justify-between no-print rounded">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase">FİLTRE:</span>
            <select className="bg-slate-50 border border-slate-200 text-[11px] font-bold px-2 py-1 outline-none w-24" value={filterYear} onChange={e => setFilterYear(Number(e.target.value))}>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select className="bg-slate-50 border border-slate-200 text-[11px] font-bold px-2 py-1 outline-none w-24" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
              {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select className="bg-slate-50 border border-slate-200 text-[11px] font-bold px-2 py-1 outline-none w-48" value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)}>
              <option value="">Proje Seçiniz...</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>
        <button onClick={() => window.print()} className="bg-slate-900 text-white px-5 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 rounded">
          <Printer size={14} /> PROJE RAPORU YAZDIR
        </button>
      </div>

      {/* REPORT AREA */}
      <div className="bg-white p-6 border border-slate-300 report-card print:p-2 print:border-none print:shadow-none">
        {/* Header */}
        <div className="flex justify-between items-end border-b-2 border-slate-900 pb-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-indigo-600 text-white rounded">
              <Briefcase size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none">PROANALİZ ENTERPRISE</h1>
              <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">Özel Proje Performans Denetim Raporu</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-sm font-black text-slate-900 uppercase">{selectedProjectName.toUpperCase()} ANALİZİ</h2>
            <div className="text-[9px] font-bold text-slate-400 mt-1 uppercase italic tracking-widest">{filterMonth.toUpperCase()} {filterYear}</div>
          </div>
        </div>

        {/* SUMMARY TILES */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <CompactStat label="PROJE TOP. ÜRETİM" value={summary.projectTotalKg.toLocaleString()} unit="KG" />
          <CompactStat label="KATILAN EKİP" value={summary.teamCount.toString()} unit="BİRİM" />
          <CompactStat label="ORT. ÜRETİM / EKİP" value={Math.round(summary.avgPerTeam).toLocaleString()} unit="KG" />
        </div>

        {/* MAIN TABLE */}
        <div className="border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse table-fixed erp-table">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="w-[180px]">KATILIMCI EKİPLER</th>
                <th className="text-center">İMALAT</th>
                <th className="text-center">KAYNAK</th>
                <th className="text-center">TEMİZLİK</th>
                <th className="text-center bg-slate-800">TOPLAM (KG)</th>
                <th className="text-center w-[70px]">SAAT</th>
                <th className="text-right w-[90px]">B. MALİYET</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {matrixData.map((data) => (
                <tr key={data.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-3 py-1.5 flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-900 uppercase">{data.name}</span>
                    <span className="text-[8px] bg-blue-100 text-blue-700 px-1 rounded">({data.personnel} P.)</span>
                  </td>
                  <td className="text-center text-slate-500">{data.imalat.toLocaleString()}</td>
                  <td className="text-center text-slate-500">{data.kaynak.toLocaleString()}</td>
                  <td className="text-center text-slate-500">{data.temizlik.toLocaleString()}</td>
                  <td className="text-center font-bold text-slate-900 bg-slate-100/50">{data.total.toLocaleString()}</td>
                  <td className="text-center text-slate-900 font-bold">{Math.round(data.hours).toLocaleString()}</td>
                  <td className="text-right text-emerald-700 font-bold">₺{data.unitCost.toFixed(2)}</td>
                </tr>
              ))}
              {matrixData.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-[10px] font-bold text-slate-300 uppercase italic">Seçilen kriterlere uygun veri bulunamadı.</td>
                </tr>
              )}
            </tbody>
          </table>
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

export default ProjectReport;