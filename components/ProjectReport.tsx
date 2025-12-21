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
  const [reportType, setReportType] = useState('Proje Bazlı Performans');

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
      return { id: tId, name: team?.name || 'Ekip', imalat, kaynak, temizlik, total, hours };
    });
  }, [filteredEntries, teams, budgets, filterYear, filterMonth, selectedProjectId]);

  const summary = useMemo(() => {
    const projectTotalKg = matrixData.reduce((a, c) => a + c.total, 0);
    const teamCount = matrixData.length;
    const avgPerTeam = teamCount > 0 ? (projectTotalKg / teamCount) : 0;
    return { projectTotalKg, teamCount, avgPerTeam };
  }, [matrixData]);

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm no-print flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Filter size={12} /> Kapsam</label>
            <div className="relative">
              <select className="appearance-none bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-xs font-bold w-full outline-none" value={reportType} onChange={e => setReportType(e.target.value)}>
                <option>Proje Bazlı Performans</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Calendar size={12} /> Mali Yıl</label>
            <div className="relative">
              <select className="appearance-none bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-xs font-bold w-full outline-none" value={filterYear} onChange={e => setFilterYear(Number(e.target.value))}>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><ChevronDown size={12} /> Ay</label>
            <select className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-xs font-bold w-full outline-none" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
              {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Briefcase size={12} /> Proje</label>
            <select className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-xs font-bold w-full outline-none" value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)}>
              <option value="">Seçiniz...</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>
        <div className="flex justify-start">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-black text-[11px] flex items-center gap-2 transition-all shadow-lg shadow-blue-500/10">
            <Activity size={16} /> ANALİZİ BAŞLAT
          </button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 report-card print:p-0 print:border-none print:shadow-none">
        <div className="relative z-10 flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-xl">
              <Briefcase size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">PROANALİZ ENTERPRISE</h1>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 italic">Kurumsal Performans Özet Raporu</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-black text-slate-900 uppercase leading-none mb-2 tracking-tighter">{selectedProjectName.toUpperCase()} ANALİZİ</h2>
            <div className="inline-block bg-slate-900 text-white px-4 py-1.5 rounded text-[10px] font-black uppercase tracking-widest">
              DÖNEM: {filterMonth.toUpperCase()} {filterYear}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-10 relative z-10">
          <StatCardSmall label="PROJE TOP. ÜRETİM" value={summary.projectTotalKg.toLocaleString()} unit="KG" />
          <StatCardSmall label="KATILAN EKİP" value={summary.teamCount.toString()} unit="EKİP" />
          <StatCardSmall label="ORT. ÜRETİM/EKİP" value={Math.round(summary.avgPerTeam).toLocaleString()} unit="KG" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4 px-1">
            <div className="p-1 bg-blue-100 rounded text-blue-600"><LayoutGrid size={14} /></div>
            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">EKİP BAZLI PERFORMANS MATRİSİ</h3>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm print:rounded-none">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0f172a] text-white text-[9px] font-black uppercase tracking-widest">
                  <th className="px-6 py-4 border-r border-slate-800">EKİPLER</th>
                  <th className="px-3 py-4 text-center border-r border-slate-800">İMALAT</th>
                  <th className="px-3 py-4 text-center border-r border-slate-800">KAYNAK</th>
                  <th className="px-3 py-4 text-center border-r border-slate-800">TEMİZLİK</th>
                  <th className="px-3 py-4 text-center border-r border-slate-800 bg-slate-800">TOPLAM (KG)</th>
                  <th className="px-3 py-4 text-center">SAAT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {matrixData.map((data) => (
                  <tr key={data.id} className="bg-white hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 border-r border-slate-100 text-[10px] font-black text-slate-900 uppercase">{data.name}</td>
                    <td className="px-3 py-3 text-center text-[10px] text-slate-500 border-r border-slate-100">{data.imalat.toLocaleString()}</td>
                    <td className="px-3 py-3 text-center text-[10px] text-slate-500 border-r border-slate-100">{data.kaynak.toLocaleString()}</td>
                    <td className="px-3 py-3 text-center text-[10px] text-slate-500 border-r border-slate-100">{data.temizlik.toLocaleString()}</td>
                    <td className="px-3 py-3 text-center text-[10px] font-black text-slate-900 border-r border-slate-100 bg-slate-50/50">{data.total.toLocaleString()}</td>
                    <td className="px-3 py-3 text-center text-[10px] font-bold text-slate-400">{Math.round(data.hours).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="no-print flex justify-center mt-10">
         <button onClick={() => window.print()} className="bg-slate-900 text-white px-10 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-2xl hover:bg-black flex items-center gap-3 transition-all active:scale-95">
            <Printer size={16} /> PDF YAZDIR (YATAY)
         </button>
      </div>
    </div>
  );
};

const StatCardSmall = ({ label, value, unit }: { label: string, value: string, unit: string }) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-start group hover:border-blue-200 transition-all">
    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">{label}</span>
    <div className="flex items-baseline gap-1.5">
      <h4 className="text-xl font-black text-slate-900 tracking-tighter">{value}</h4>
      <span className="text-[10px] font-black text-slate-400 uppercase">{unit}</span>
    </div>
  </div>
);

export default ProjectReport;