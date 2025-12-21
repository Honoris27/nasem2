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

  // Filtrelenmiş Veriler
  const filteredEntries = useMemo(() => 
    entries.filter(e => e.year === filterYear && e.month === filterMonth && e.projectId === selectedProjectId),
    [entries, filterYear, filterMonth, selectedProjectId]
  );

  // Ekiplerin o projedeki özetleri
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

      return {
        id: tId,
        name: team?.name || 'Bilinmeyen Ekip',
        imalat,
        kaynak,
        temizlik,
        total,
        hours
      };
    });
  }, [filteredEntries, teams, budgets, filterYear, filterMonth, selectedProjectId]);

  // Üst Kart Hesaplamaları
  const summary = useMemo(() => {
    const projectTotalKg = matrixData.reduce((a, c) => a + c.total, 0);
    const teamCount = matrixData.length;
    const avgPerTeam = teamCount > 0 ? (projectTotalKg / teamCount) : 0;

    return { projectTotalKg, teamCount, avgPerTeam };
  }, [matrixData]);

  return (
    <div className="space-y-8 pb-20">
      {/* Filtre Paneli (Görseldeki Tasarım) */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm no-print flex flex-col gap-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
               <Filter size={14} className="text-blue-500" /> RAPOR KAPSAMI
            </label>
            <div className="relative">
              <select 
                className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 pr-12 text-xs font-black text-slate-700 outline-none w-full"
                value={reportType}
                onChange={e => setReportType(e.target.value)}
              >
                <option>Proje Bazlı Performans</option>
                <option>Maliyet Odaklı Analiz</option>
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
                className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 pr-12 text-xs font-black text-slate-700 outline-none w-full"
                value={filterYear}
                onChange={e => setFilterYear(Number(e.target.value))}
              >
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
               <ChevronDown size={14} className="text-blue-500" /> DÖNEM (AY)
            </label>
            <div className="relative">
              <select 
                className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 pr-12 text-xs font-black text-slate-700 outline-none w-full"
                value={filterMonth}
                onChange={e => setFilterMonth(e.target.value)}
              >
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
               <Briefcase size={14} className="text-blue-500" /> PROJE SEÇİMİ
            </label>
            <div className="relative">
              <select 
                className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 pr-12 text-xs font-black text-slate-700 outline-none w-full"
                value={selectedProjectId}
                onChange={e => setSelectedProjectId(e.target.value)}
              >
                <option value="">Proje Seçiniz...</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
          </div>
        </div>

        <div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-black text-xs flex items-center gap-3 transition-all shadow-xl shadow-blue-500/20 active:scale-95">
            <Activity size={18} /> ANALİZİ BAŞLAT
          </button>
        </div>
      </div>

      {/* Rapor Kartı */}
      <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 report-card relative overflow-hidden">
        
        {/* Header */}
        <div className="relative z-10 flex justify-between items-start border-b-4 border-slate-900 pb-10 mb-12">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-2xl">
              <Briefcase size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">PROANALİZ ENTERPRISE</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] mt-2 italic">Endüstriyel Verimlilik ve Performans Portalı</p>
              <div className="mt-2 inline-block px-3 py-1 bg-slate-100 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-widest border border-slate-200">RESMİ SİSTEM KAYDI</div>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-black text-slate-900 uppercase leading-none mb-3 tracking-tighter">{selectedProjectName.toUpperCase()} PROJE BAZLI ANALİZ</h2>
            <div className="inline-block bg-slate-900 text-white px-6 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest shadow-lg">
              DÖNEM: {filterMonth.toUpperCase()} {filterYear}
            </div>
          </div>
        </div>

        {/* Summary Stat Tiles */}
        <div className="grid grid-cols-3 gap-6 mb-16 relative z-10">
          <StatCard label="PROJE TOP. ÜRETİM" value={summary.projectTotalKg.toLocaleString()} unit="KG" />
          <StatCard label="KATILAN EKİP SAYISI" value={summary.teamCount.toString()} unit="EKİP" />
          <StatCard label="ORT. ÜRETİM/EKİP" value={Math.round(summary.avgPerTeam).toLocaleString()} unit="KG" />
        </div>

        {/* Matrix Table */}
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
                  <th className="px-8 py-6 border-r border-slate-800">KATILAN EKİPLER</th>
                  <th className="px-4 py-6 text-center border-r border-slate-800">İMALAT (KG)</th>
                  <th className="px-4 py-6 text-center border-r border-slate-800">KAYNAK (KG)</th>
                  <th className="px-4 py-6 text-center border-r border-slate-800">TEMİZLİK (KG)</th>
                  <th className="px-4 py-6 text-center border-r border-slate-800 bg-slate-800">TOPLAM (KG)</th>
                  <th className="px-4 py-6 text-center">ADAM-SAAT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {matrixData.map((data) => (
                  <tr key={data.id} className="bg-white hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-5 border-r border-slate-100">
                      <div className="flex items-center gap-3">
                        <Users size={14} className="text-blue-500" />
                        <span className="text-[11px] font-black text-slate-900 uppercase tracking-tighter">{data.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-5 text-center text-[10px] font-bold text-slate-500 border-r border-slate-100">{data.imalat.toLocaleString()}</td>
                    <td className="px-4 py-5 text-center text-[10px] font-bold text-slate-500 border-r border-slate-100">{data.kaynak.toLocaleString()}</td>
                    <td className="px-4 py-5 text-center text-[10px] font-bold text-slate-500 border-r border-slate-100">{data.temizlik.toLocaleString()}</td>
                    <td className="px-4 py-5 text-center text-xs font-black text-slate-900 border-r border-slate-100 bg-slate-50/50">{data.total.toLocaleString()}</td>
                    <td className="px-4 py-5 text-center text-xs font-bold text-slate-500">{Math.round(data.hours).toLocaleString()}</td>
                  </tr>
                ))}
                {matrixData.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">Seçili proje ve dönemde veri bulunamadı.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="no-print flex justify-center mt-12">
         <button onClick={() => window.print()} className="bg-slate-900 text-white px-12 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-black flex items-center gap-4 transition-all active:scale-95">
            <Printer size={20} /> PDF OLARAK YAZDIR
         </button>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, unit }: { label: string, value: string, unit: string }) => (
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

export default ProjectReport;