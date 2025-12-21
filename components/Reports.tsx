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

  // Performans Matrisi Verisi (Hiyerarşik: Ekip -> Proje)
  const matrixData = useMemo(() => {
    return teams.map(team => {
      const teamEntries = filteredEntries.filter(e => e.teamId === team.id);
      const teamBudget = filteredBudgets.find(b => b.teamId === team.id);
      
      if (teamEntries.length === 0 && (!teamBudget || teamBudget.amountTL === 0)) return null;

      const teamTotalKg = teamEntries.reduce((acc, curr) => acc + curr.quantityKg, 0);
      const teamHours = teamBudget ? (teamBudget.personnelCount * (teamBudget.workingDays?.length || 0) * DAILY_WORKING_HOURS) : 0;
      const teamCost = teamBudget?.amountTL || 0;
      const unitCost = teamTotalKg > 0 ? (teamCost / teamTotalKg) : 0;

      // Bu ekip altındaki projelerin detayları
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
      {/* Kontrol Paneli */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 no-print flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dönem Seçimi:</span>
            <select className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none" value={filterYear} onChange={e => setFilterYear(Number(e.target.value))}>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
              {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>
        <button onClick={() => window.print()} className="bg-slate-900 hover:bg-black text-white px-8 py-3 rounded-xl font-black text-xs flex items-center gap-3 transition-all shadow-xl shadow-slate-200 active:scale-95">
          <Printer size={16} /> RAPORU YAZDIR (PDF)
        </button>
      </div>

      {/* Rapor Ana Sayfası */}
      <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 report-card print:p-0 print:shadow-none print:border-none">
        
        {/* Header Section */}
        <div className="flex justify-between items-start border-b-4 border-slate-900 pb-10 mb-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-blue-500/20">
              <div className="grid grid-cols-2 gap-0.5">
                <div className="w-3 h-3 bg-white/20 rounded-sm"></div>
                <div className="w-3 h-3 bg-white rounded-sm"></div>
                <div className="w-3 h-3 bg-white rounded-sm"></div>
                <div className="w-3 h-3 bg-white/40 rounded-sm"></div>
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">PROANALİZ ENTERPRISE</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] mt-2">Endüstriyel Verimlilik ve Performans Portalı</p>
              <div className="mt-2 inline-block px-3 py-1 bg-slate-100 rounded-full text-[9px] font-black text-slate-500 uppercase tracking-widest border border-slate-200">Resmi Sistem Kaydı</div>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-black text-slate-900 uppercase leading-none mb-3 tracking-tighter">TÜM EKİPLER PERFORMANS ANALİZ RAPORU</h2>
            <div className="inline-block bg-slate-900 text-white px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-widest shadow-lg shadow-slate-200">
              DÖNEM: {filterMonth.toUpperCase()} {filterYear}
            </div>
          </div>
        </div>

        {/* Summary Statistics Tiles */}
        <div className="grid grid-cols-4 gap-6 mb-12">
          <StatTile label="Top. Üretim" value={summary.totalKg.toLocaleString()} unit="KG" />
          <StatTile label="Top. Maliyet" value={summary.totalCost.toLocaleString()} unit="₺" />
          <StatTile label="Top. Adam-Saat" value={Math.round(summary.totalHours).toLocaleString()} unit="Sa" />
          <StatTile label="Aktif Ekipler" value={summary.activeTeams.toString()} unit="EKİP" />
        </div>

        {/* Performance Matrix Table */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-6 px-1">
            <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600">
              <LayoutGrid size={18} />
            </div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">VERİ MATRİSİ & PERFORMANS DETAYI</h3>
            <div className="ml-auto text-[10px] font-bold text-slate-400 uppercase tracking-widest">Birim: KG / TRY / Adam-Saat</div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.15em]">
                  <th className="px-8 py-5 border-r border-slate-800">EKİP / PROJE DETAYI</th>
                  <th className="px-4 py-5 text-center border-r border-slate-800">İMALAT (KG)</th>
                  <th className="px-4 py-5 text-center border-r border-slate-800">KAYNAK (KG)</th>
                  <th className="px-4 py-5 text-center border-r border-slate-800">TEMİZLİK (KG)</th>
                  <th className="px-4 py-5 text-center border-r border-slate-800 bg-slate-800">TOPLAM KG</th>
                  <th className="px-4 py-5 text-center border-r border-slate-800">ADAM-SAAT</th>
                  <th className="px-4 py-5 text-right">B. MALİYET</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {matrixData.map((teamData) => (
                  <React.Fragment key={teamData.teamId}>
                    {/* Team Row */}
                    <tr className="bg-slate-50/50">
                      <td className="px-8 py-4 border-r border-slate-200">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-blue-100 text-blue-600 rounded-md">
                            <Users size={14} />
                          </div>
                          <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{teamData.teamName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center text-xs font-bold text-slate-500 border-r border-slate-200">{teamData.imalat.toLocaleString()}</td>
                      <td className="px-4 py-4 text-center text-xs font-bold text-slate-500 border-r border-slate-200">{teamData.kaynak.toLocaleString()}</td>
                      <td className="px-4 py-4 text-center text-xs font-bold text-slate-500 border-r border-slate-200">{teamData.temizlik.toLocaleString()}</td>
                      <td className="px-4 py-4 text-center text-xs font-black text-slate-900 border-r border-slate-200 bg-slate-100/50">{teamData.totalKg.toLocaleString()}</td>
                      <td className="px-4 py-4 text-center text-xs font-black text-slate-900 border-r border-slate-200">{Math.round(teamData.hours).toLocaleString()}</td>
                      <td className="px-4 py-4 text-right text-xs font-black text-emerald-600">
                        <span className="text-[10px] mr-1">₺</span>{teamData.unitCost.toFixed(2)}
                      </td>
                    </tr>
                    
                    {/* Project Rows */}
                    {teamData.projects.map((proj) => (
                      <tr key={proj.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-12 py-3 border-r border-slate-100">
                          <div className="flex items-center gap-3 opacity-60">
                            <div className="w-1.5 h-1.5 bg-slate-300 rounded-full"></div>
                            <span className="text-[11px] font-bold text-slate-500 lowercase">{proj.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center text-[10px] font-medium text-slate-400 border-r border-slate-100 italic">{proj.imalat.toLocaleString()}</td>
                        <td className="px-4 py-3 text-center text-[10px] font-medium text-slate-400 border-r border-slate-100 italic">{proj.kaynak.toLocaleString()}</td>
                        <td className="px-4 py-3 text-center text-[10px] font-medium text-slate-400 border-r border-slate-100 italic">{proj.temizlik.toLocaleString()}</td>
                        <td className="px-4 py-3 text-center text-[11px] font-bold text-slate-600 border-r border-slate-100 italic">{proj.total.toLocaleString()}</td>
                        <td className="px-4 py-3 text-center text-[10px] text-slate-300 border-r border-slate-100">—</td>
                        <td className="px-4 py-3 text-right text-[10px] text-slate-300">—</td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
                
                {matrixData.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-8 py-20 text-center text-slate-400 font-bold uppercase text-[11px] tracking-widest">Seçili dönemde veri bulunamadı.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-16 pt-8 border-t-2 border-slate-100 flex justify-between items-end">
          <div className="space-y-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rapor Onay Durumu:</p>
            <div className="flex items-center gap-6">
              <div className="flex flex-col gap-1">
                <div className="w-24 h-0.5 bg-slate-200"></div>
                <span className="text-[9px] font-bold text-slate-400 uppercase">Yönetici İmzası</span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="w-24 h-0.5 bg-slate-200"></div>
                <span className="text-[9px] font-bold text-slate-400 uppercase">Mali İşler</span>
              </div>
            </div>
          </div>
          <div className="text-right opacity-30 group">
             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">ProAnaliz V1.0 Cloud Enterprise Infrastructure</p>
             <p className="text-[8px] font-medium text-slate-300 uppercase italic">Digital Signature ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Alt Bileşen: İstatistik Kartı
const StatTile = ({ label, value, unit }: { label: string, value: string, unit: string }) => (
  <div className="bg-white p-6 rounded-[1.75rem] border border-slate-200 shadow-sm flex flex-col items-start relative overflow-hidden group hover:border-blue-200 transition-all">
    <div className="absolute top-0 right-0 w-16 h-16 -mr-8 -mt-8 bg-slate-50 rounded-full group-hover:bg-blue-50 transition-colors"></div>
    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 relative z-10">{label}</span>
    <div className="flex items-baseline gap-2 relative z-10">
      <h4 className="text-2xl font-black text-slate-900 tracking-tighter">{value}</h4>
      <span className="text-[11px] font-black text-slate-400 uppercase">{unit}</span>
    </div>
    <div className="mt-4 w-full h-1 bg-slate-50 rounded-full overflow-hidden">
      <div className="w-1/2 h-full bg-blue-500/20 group-hover:bg-blue-500/40 transition-all"></div>
    </div>
  </div>
);

export default Reports;