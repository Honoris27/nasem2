import React, { useMemo, useState, useEffect } from 'react';
import { 
  Team, Project, Budget, ProductionEntry, 
  ProductionType, MONTHS, YEARS, DAILY_WORKING_HOURS, ReportTemplate, DEFAULT_THEME
} from '../types';
import { 
  Printer, Activity, Users, Loader2, PlayCircle, RefreshCw
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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reportReady, setReportReady] = useState(false);

  const theme = template?.theme || DEFAULT_THEME;

  useEffect(() => {
    setReportReady(false);
  }, [filterYear, filterMonth]);

  const handlePrepareReport = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setReportReady(true);
    }, 800);
  };

  const filteredEntries = useMemo(() => 
    entries.filter(e => e.year === filterYear && e.month === filterMonth),
    [entries, filterYear, filterMonth]
  );

  const filteredBudgets = useMemo(() => 
    budgets.filter(b => b.year === filterYear && b.month === filterMonth),
    [budgets, filterYear, filterMonth]
  );

  const matrixData = useMemo(() => {
    if (!reportReady) return [];
    
    return teams.map(team => {
      const teamEntries = filteredEntries.filter(e => e.teamId === team.id);
      const teamBudget = filteredBudgets.find(b => b.teamId === team.id);
      
      if (teamEntries.length === 0 && (!teamBudget || teamBudget.amountTL === 0)) return null;

      const teamTotalKg = teamEntries.reduce((acc, curr) => acc + curr.quantityKg, 0);
      const workingDaysCount = teamBudget?.workingDays?.length || 30;
      const teamTotalHours = teamBudget ? (teamBudget.personnelCount * workingDaysCount * DAILY_WORKING_HOURS) : 0;
      const teamCost = teamBudget?.amountTL || 0;
      const unitCost = teamTotalKg > 0 ? (teamCost / teamTotalKg) : 0;

      const projectBreakdown = Array.from(new Set(teamEntries.map(e => e.projectId))).map(pId => {
        const pEntries = teamEntries.filter(e => e.projectId === pId);
        const pName = projects.find(p => p.id === pId)?.name || '---';
        const pTotalKg = pEntries.reduce((a, c) => a + c.quantityKg, 0);
        
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
        personnelCount: teamBudget?.personnelCount || 0,
        totalKg: teamTotalKg,
        hours: teamTotalHours,
        unitCost: unitCost,
        projects: projectBreakdown
      };
    }).filter(item => item !== null);
  }, [teams, projects, filteredEntries, filteredBudgets, reportReady]);

  const summary = useMemo(() => {
    const totalKg = filteredEntries.reduce((acc, curr) => acc + curr.quantityKg, 0);
    const totalCost = filteredBudgets.reduce((acc, curr) => acc + curr.amountTL, 0);
    const totalHours = filteredBudgets.reduce((acc, curr) => {
      const days = curr.workingDays?.length || 0;
      return acc + (curr.personnelCount * days * DAILY_WORKING_HOURS);
    }, 0);
    return { totalKg, totalCost, totalHours };
  }, [filteredEntries, filteredBudgets]);

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 p-3 flex items-center justify-between no-print rounded shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase">DÖNEM:</span>
            <select className="bg-slate-50 border border-slate-200 text-[11px] font-bold px-2 py-1 outline-none" value={filterYear} onChange={e => setFilterYear(Number(e.target.value))}>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select className="bg-slate-50 border border-slate-200 text-[11px] font-bold px-2 py-1 outline-none" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
              {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <button 
            onClick={handlePrepareReport}
            disabled={isAnalyzing}
            className={`flex items-center gap-2 px-6 py-2 rounded text-[10px] font-black uppercase tracking-widest transition-all ${
              reportReady ? 'bg-slate-50 text-slate-600 border border-slate-200' : 'text-white hover:opacity-90 shadow-md'
            }`}
            style={{ backgroundColor: reportReady ? undefined : theme.secondary }}
          >
            {isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : reportReady ? <RefreshCw size={14} /> : <PlayCircle size={14} />}
            {reportReady ? 'ANALİZİ YENİLE' : 'RAPORU HAZIRLA'}
          </button>
        </div>
        {reportReady && (
          <button 
            onClick={() => window.print()} 
            className="text-white px-5 py-2 text-[10px] font-black uppercase tracking-widest hover:opacity-90 rounded flex items-center gap-2"
            style={{ backgroundColor: theme.primary }}
          >
            <Printer size={14} /> LANDSCAPE YAZDIR
          </button>
        )}
      </div>

      {!reportReady && !isAnalyzing && (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-20 rounded flex flex-col items-center justify-center text-center opacity-60">
           <Activity size={48} className="text-slate-300 mb-4" />
           <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Rapor verileri hazırlanmadı. Lütfen "Raporu Hazırla" butonuna tıklayarak<br/>oranlama ve maliyet analizini başlatın.</p>
        </div>
      )}

      {isAnalyzing && (
        <div className="bg-white p-20 rounded border border-slate-200 flex flex-col items-center justify-center text-center">
           <Loader2 size={32} className="animate-spin mb-4" style={{ color: theme.secondary }} />
           <p className="text-xs font-black text-slate-900 uppercase tracking-[0.3em]">Veri Kümeleri Hesaplanıyor...</p>
           <p className="text-[10px] text-slate-400 mt-2 font-bold italic">Adam-saat oranlaması ve proje maliyet dağılımı yapılıyor.</p>
        </div>
      )}

      {reportReady && (
        <div className="bg-white p-6 border border-slate-300 report-card print:p-0 print:border-none">
          <div className="flex justify-between items-end pb-4 mb-6" style={{ borderBottom: `2px solid ${theme.primary}` }}>
            <div className="flex items-center gap-4">
              <div className="p-2 text-white rounded" style={{ backgroundColor: theme.secondary }}><Activity size={24} /></div>
              <div>
                <h1 className="text-xl font-black text-slate-900 uppercase leading-none">{template?.headerTitle}</h1>
                <p className="text-[8px] font-bold text-slate-500 uppercase mt-1">Hassas Adam-Saat ve Maliyet Dağılım Matrisi</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-sm font-black text-slate-900 uppercase">{filterMonth} {filterYear}</h2>
              <div className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Dijital ERP Çıktısı v2.0</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <Stat label="TOP. ÜRETİM" value={summary.totalKg.toLocaleString()} unit="KG" theme={theme} />
            <Stat label="TOP. MALİYET" value={summary.totalCost.toLocaleString()} unit="₺" theme={theme} />
            <Stat label="TOP. ADAM-SAAT" value={Math.round(summary.totalHours).toLocaleString()} unit="Sa" theme={theme} />
          </div>

          <div className="border border-slate-200 overflow-hidden rounded shadow-sm">
            <table className="w-full text-left border-collapse table-fixed erp-table">
              <thead>
                <tr className="text-white" style={{ backgroundColor: theme.primary }}>
                  <th className="w-[180px]">EKİP / PROJE KIRILIMI</th>
                  <th className="text-center w-[80px]">İMALAT</th>
                  <th className="text-center w-[80px]">KAYNAK</th>
                  <th className="text-center w-[80px]">TEMİZLİK</th>
                  <th className="text-center w-[100px] opacity-90">TOPLAM KG</th>
                  <th className="text-center w-[70px]">A-SAAT</th>
                  <th className="text-right w-[90px]">B. MALİYET</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {matrixData.map((team: any) => (
                  <React.Fragment key={team.teamId}>
                    <tr className="bg-slate-50 font-black">
                      <td className="px-3 py-1.5 flex items-center justify-between">
                        <span className="text-[10px] text-slate-900">{team.teamName}</span>
                        <span className="text-[8px] px-1 rounded" style={{ backgroundColor: `${theme.secondary}15`, color: theme.secondary }}>({team.personnelCount} P.)</span>
                      </td>
                      <td colSpan={3} className="text-center text-[9px] text-slate-400 italic">EKİP TOTAL GÖRÜNÜMÜ</td>
                      <td className="text-center font-bold" style={{ color: theme.secondary }}>{team.totalKg.toLocaleString()}</td>
                      <td className="text-center text-slate-900">{Math.round(team.hours).toLocaleString()}</td>
                      <td className="text-right" style={{ color: theme.accent }}>₺{team.unitCost.toFixed(2)}</td>
                    </tr>
                    {team.projects.map((p: any) => (
                      <tr key={p.id} className="text-slate-500 hover:bg-slate-50/50">
                        <td className="pl-6 py-1 text-[9px] border-r border-slate-50 font-medium">{p.name}</td>
                        <td className="text-center text-[9px] border-r border-slate-50" style={{ color: theme.imalat }}>{p.imalat.toLocaleString()}</td>
                        <td className="text-center text-[9px] border-r border-slate-50" style={{ color: theme.kaynak }}>{p.kaynak.toLocaleString()}</td>
                        <td className="text-center text-[9px] border-r border-slate-50" style={{ color: theme.temizlik }}>{p.temizlik.toLocaleString()}</td>
                        <td className="text-center text-[9px] font-bold text-slate-600 border-r border-slate-50">{p.total.toLocaleString()}</td>
                        <td className="text-center text-[9px] font-bold" style={{ color: theme.secondary }}>{Math.round(p.hours).toLocaleString()}</td>
                        <td className="text-right text-[9px] font-bold" style={{ color: theme.accent }}>₺{p.unitCost.toFixed(2)}</td>
                      </tr>
                    ))}
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

const Stat = ({ label, value, unit, theme }: any) => (
  <div className="bg-white border border-slate-200 p-2 rounded flex flex-col items-center relative overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-[2px]" style={{ backgroundColor: theme.accent }}></div>
    <span className="text-[8px] font-black text-slate-400 uppercase mb-1 tracking-widest">{label}</span>
    <div className="flex items-baseline gap-1">
      <span className="text-sm font-black text-slate-900">{value}</span>
      <span className="text-[8px] font-bold text-slate-400">{unit}</span>
    </div>
  </div>
);

export default Reports;