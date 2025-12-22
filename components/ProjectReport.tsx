import React, { useMemo, useState } from 'react';
import { 
  Team, Project, Budget, ProductionEntry, 
  ProductionType, MONTHS, YEARS, DAILY_WORKING_HOURS, ReportTheme
} from '../types';
import { 
  Printer, LayoutGrid, Users, Briefcase, ChevronDown, Activity, Calendar, Filter
} from 'lucide-react';

interface ProjectReportProps {
  entries: ProductionEntry[];
  budgets: Budget[];
  teams: Team[];
  projects: Project[];
  theme: ReportTheme;
}

const ProjectReport: React.FC<ProjectReportProps> = ({ entries, budgets, teams, projects, theme }) => {
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
      
      const teamProjectEntries = filteredEntries.filter(e => e.teamId === tId);
      const projectImalat = teamProjectEntries.filter(e => e.type === ProductionType.IMALAT).reduce((a, c) => a + c.quantityKg, 0);
      const projectKaynak = teamProjectEntries.filter(e => e.type === ProductionType.KAYNAK).reduce((a, c) => a + c.quantityKg, 0);
      const projectTemizlik = teamProjectEntries.filter(e => e.type === ProductionType.TEMIZLIK).reduce((a, c) => a + c.quantityKg, 0);
      const projectTotal = projectImalat + projectKaynak + projectTemizlik;

      const teamAllMonthEntries = entries.filter(e => e.teamId === tId && e.year === filterYear && e.month === filterMonth);
      const teamTotalMonthKg = teamAllMonthEntries.reduce((a, c) => a + c.quantityKg, 0);

      const teamBudget = budgets.find(b => b.teamId === tId && b.year === filterYear && b.month === filterMonth);
      const teamTotalMonthHours = teamBudget ? (teamBudget.personnelCount * (teamBudget.workingDays?.length || 0) * DAILY_WORKING_HOURS) : 0;
      const teamTotalMonthCost = teamBudget?.amountTL || 0;
      const personnel = teamBudget?.personnelCount || 0;

      const projectRatio = teamTotalMonthKg > 0 ? (projectTotal / teamTotalMonthKg) : 0;
      const projectAllocatedHours = teamTotalMonthHours * projectRatio;
      const projectAllocatedCost = teamTotalMonthCost * projectRatio;
      const unitCost = projectTotal > 0 ? (projectAllocatedCost / projectTotal) : 0;
      
      return { 
        id: tId, 
        name: team?.name || 'Ekip', 
        imalat: projectImalat, 
        kaynak: projectKaynak, 
        temizlik: projectTemizlik, 
        total: projectTotal, 
        hours: projectAllocatedHours, 
        personnel, 
        unitCost 
      };
    });
  }, [filteredEntries, entries, teams, budgets, filterYear, filterMonth, selectedProjectId]);

  const summary = useMemo(() => {
    const projectTotalKg = matrixData.reduce((a, c) => a + c.total, 0);
    const teamCount = matrixData.length;
    const avgPerTeam = teamCount > 0 ? (projectTotalKg / teamCount) : 0;
    return { projectTotalKg, teamCount, avgPerTeam };
  }, [matrixData]);

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 p-3 flex items-center justify-between no-print rounded shadow-sm">
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
        <button 
          onClick={() => window.print()} 
          className="text-white px-5 py-2 text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2 rounded"
          style={{ backgroundColor: theme.primary }}
        >
          <Printer size={14} /> PROJE RAPORU YAZDIR
        </button>
      </div>

      <div className="bg-white p-6 border border-slate-300 report-card print:p-2 print:border-none print:shadow-none">
        <div className="flex justify-between items-end pb-4 mb-6" style={{ borderBottom: `2px solid ${theme.primary}` }}>
          <div className="flex items-center gap-4">
            <div className="p-2 text-white rounded" style={{ backgroundColor: theme.secondary }}>
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

        <div className="grid grid-cols-3 gap-3 mb-6">
          <CompactStat label="PROJE TOP. ÜRETİM" value={summary.projectTotalKg.toLocaleString()} unit="KG" theme={theme} />
          <CompactStat label="KATILAN EKİP" value={summary.teamCount.toString()} unit="BİRİM" theme={theme} />
          <CompactStat label="ORT. ÜRETİM / EKİP" value={Math.round(summary.avgPerTeam).toLocaleString()} unit="KG" theme={theme} />
        </div>

        <div className="border border-slate-200 overflow-hidden rounded shadow-sm">
          <table className="w-full text-left border-collapse table-fixed erp-table">
            <thead>
              <tr className="text-white" style={{ backgroundColor: theme.primary }}>
                <th className="w-[180px]">KATILIMCI EKİPLER</th>
                <th className="text-center">İMALAT</th>
                <th className="text-center">KAYNAK</th>
                <th className="text-center">TEMİZLİK</th>
                <th className="text-center opacity-90">TOPLAM (KG)</th>
                <th className="text-center w-[70px]">PROJE SAATİ</th>
                <th className="text-right w-[90px]">B. MALİYET</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {matrixData.map((data) => (
                <tr key={data.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-3 py-1.5 flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-900 uppercase">{data.name}</span>
                    <span className="text-[8px] px-1 rounded" style={{ backgroundColor: `${theme.secondary}15`, color: theme.secondary }}>({data.personnel} P.)</span>
                  </td>
                  <td className="text-center text-slate-500" style={{ color: theme.imalat }}>{data.imalat.toLocaleString()}</td>
                  <td className="text-center text-slate-500" style={{ color: theme.kaynak }}>{data.kaynak.toLocaleString()}</td>
                  <td className="text-center text-slate-500" style={{ color: theme.temizlik }}>{data.temizlik.toLocaleString()}</td>
                  <td className="text-center font-bold text-slate-900 bg-slate-100/50">{data.total.toLocaleString()}</td>
                  <td className="text-center font-black" style={{ color: theme.secondary }}>{Math.round(data.hours).toLocaleString()}</td>
                  <td className="text-right font-bold" style={{ color: theme.accent }}>₺{data.unitCost.toFixed(2)}</td>
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

const CompactStat = ({ label, value, unit, theme }: any) => (
  <div className="bg-white border border-slate-200 p-3 rounded flex flex-col items-center text-center relative overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-[2px]" style={{ backgroundColor: theme.accent }}></div>
    <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</span>
    <div className="flex items-baseline gap-1">
      <span className="text-sm font-black text-slate-900 tracking-tighter">{value}</span>
      <span className="text-[8px] font-bold text-slate-400">{unit}</span>
    </div>
  </div>
);

export default ProjectReport;