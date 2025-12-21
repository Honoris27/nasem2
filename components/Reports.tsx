import React, { useMemo, useState } from 'react';
import { 
  Team, Project, Budget, ProductionEntry, 
  ProductionType, MONTHS, YEARS, DAILY_WORKING_HOURS, ReportTemplate
} from '../types';
import { 
  Printer, Calculator, Target, FileText
} from 'lucide-react';

interface ReportsProps {
  entries: ProductionEntry[];
  budgets: Budget[];
  teams: Team[];
  projects: Project[];
  template: ReportTemplate;
}

type ReportView = 'single' | 'compare' | 'project';

const Reports: React.FC<ReportsProps> = ({ entries, budgets, teams, projects, template }) => {
  const [filterYear, setFilterYear] = useState(2025);
  const [filterMonth, setFilterMonth] = useState<string>('Ocak');
  const [viewMode, setViewMode] = useState<ReportView>('single');
  const [selectedTeamId, setSelectedTeamId] = useState<string>(teams[0]?.id || '');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');

  const isFieldVisible = (id: string) => template.fields.find(f => f.id === id)?.visible !== false;
  const getFieldLabel = (id: string, defaultLabel: string) => template.fields.find(f => f.id === id)?.label || defaultLabel;

  const ALL_MONTHS_LABEL = 'Tüm Aylar';
  const monthOptions = [ALL_MONTHS_LABEL, ...MONTHS];

  const calculateTeamStats = (teamId: string, projectId?: string) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return null;

    const teamEntries = entries.filter(e => 
      e.teamId === teamId && 
      e.year === filterYear && 
      (filterMonth === ALL_MONTHS_LABEL ? true : e.month === filterMonth) &&
      (projectId ? e.projectId === projectId : true)
    );
    
    const teamBudgets = budgets.filter(b => 
      b.teamId === teamId && 
      b.year === filterYear && 
      (filterMonth === ALL_MONTHS_LABEL ? true : b.month === filterMonth)
    );

    const totalKg = teamEntries.reduce((acc, curr) => acc + curr.quantityKg, 0);
    const totalPersonnel = teamBudgets.reduce((acc, curr) => acc + curr.personnelCount, 0);
    const totalBudgetAmount = teamBudgets.reduce((acc, curr) => acc + curr.amountTL, 0);
    
    // Dinamik Adam-Saat Hesabı: Personel * Seçilen Günler * Standart Saat
    const manHours = teamBudgets.reduce((acc, curr) => {
      const days = curr.workingDays?.length || 22; // Seçilmemişse varsayılan 22 gün
      return acc + (curr.personnelCount * days * DAILY_WORKING_HOURS);
    }, 0);

    const typeBreakdown = {
      [ProductionType.IMALAT]: teamEntries.filter(e => e.type === ProductionType.IMALAT).reduce((acc, curr) => acc + curr.quantityKg, 0),
      [ProductionType.KAYNAK]: teamEntries.filter(e => e.type === ProductionType.KAYNAK).reduce((acc, curr) => acc + curr.quantityKg, 0),
      [ProductionType.TEMIZLIK]: teamEntries.filter(e => e.type === ProductionType.TEMIZLIK).reduce((acc, curr) => acc + curr.quantityKg, 0),
    };

    return {
      id: team.id,
      teamName: team.name,
      totalKg,
      personnel: filterMonth === ALL_MONTHS_LABEL ? (teamBudgets.length > 0 ? Number((totalPersonnel / teamBudgets.length).toFixed(1)) : 0) : totalPersonnel,
      budgetAmount: totalBudgetAmount,
      manHours,
      typeBreakdown,
      kgPerPerson: totalPersonnel > 0 ? (totalKg / totalPersonnel).toFixed(2) : '0',
      costPerKg: totalKg > 0 ? (totalBudgetAmount / totalKg).toFixed(2) : '0'
    };
  };

  const currentDataList = useMemo(() => {
    let list: any[] = [];
    if (viewMode === 'single') {
      const stats = calculateTeamStats(selectedTeamId);
      list = stats ? [stats] : [];
    } else if (viewMode === 'compare') {
      list = teams.map(t => calculateTeamStats(t.id));
    } else {
      const projectTeams = teams.filter(t => 
        entries.some(e => e.teamId === t.id && e.projectId === selectedProjectId && e.year === filterYear && (filterMonth === ALL_MONTHS_LABEL ? true : e.month === filterMonth))
      );
      list = projectTeams.map(t => calculateTeamStats(t.id, selectedProjectId));
    }
    
    return list.filter((item): item is NonNullable<typeof item> => item !== null);
  }, [entries, budgets, teams, filterYear, filterMonth, viewMode, selectedTeamId, selectedProjectId]);

  const ReportPage = ({ data }: { data: any }) => (
    <div className="bg-white p-12 mb-8 erp-card print:mb-0 print:shadow-none print:border-none print-page-break report-card">
      <div className="flex justify-between items-center border-b-2 border-slate-900 pb-4 mb-8">
        <div>
          <h2 className="text-xl font-black text-slate-900 leading-none mb-2">{template.headerTitle}</h2>
          <div className="flex gap-4 text-[11px] font-bold text-slate-500 uppercase tracking-tight">
            <span>DÖNEM: {filterMonth} {filterYear}</span>
            <span className="text-blue-600">SİCİL/EKİP: {data.teamName}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resmi ERP Raporu</p>
          <p className="text-xs font-bold text-slate-900">ID: {data.id.substring(0,8)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="border border-slate-200 p-5 bg-slate-50">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{getFieldLabel('personnel', 'AKTİF PERSONEL SAYISI')}</p>
          <p className="text-2xl font-black text-slate-900">{data.personnel} <span className="text-sm font-normal text-slate-500">KİŞİ</span></p>
        </div>
        <div className="border border-slate-200 p-5 bg-slate-50">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{getFieldLabel('budget', 'DÖNEMLİK BÜTÇE / HAKEDİŞ')}</p>
          <p className="text-2xl font-black text-emerald-600">{data.budgetAmount.toLocaleString()} ₺</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <h3 className="text-xs font-black text-slate-900 uppercase border-b border-slate-200 pb-2 flex items-center gap-2">
            <Calculator size={14} className="text-blue-500" /> ANALİTİK VERİLER
          </h3>
          <div className="space-y-4">
            {isFieldVisible('efficiency') && (
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-500">{getFieldLabel('efficiency', 'Performans Katsayısı')}</span>
                <span className="text-sm font-black text-slate-900">{data.kgPerPerson} kg/p</span>
              </div>
            )}
            {isFieldVisible('costPerKg') && (
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-500">{getFieldLabel('costPerKg', 'Birim KG Maliyeti')}</span>
                <span className="text-sm font-black text-slate-900">{data.costPerKg} TL</span>
              </div>
            )}
            {isFieldVisible('manHours') && (
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-500">{getFieldLabel('manHours', 'Kullanılan Efor')}</span>
                <span className="text-sm font-black text-slate-900">{data.manHours.toLocaleString()} Saat</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xs font-black text-slate-900 uppercase border-b border-slate-200 pb-2 flex items-center gap-2">
            <Target size={14} className="text-red-500" /> ÜRETİM ÇIKTILARI
          </h3>
          <div className="space-y-3">
            {Object.entries(data.typeBreakdown).map(([type, kg]) => (
              <div key={type} className="flex justify-between items-center text-[11px] font-bold py-1">
                <span className="text-slate-400 uppercase">{type}</span>
                <span className="text-slate-900">{(kg as any).toLocaleString()} KG</span>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-4 border-t-2 border-slate-900">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">DÖNEM TOPLAM ÜRETİM</p>
            <p className="text-3xl font-black text-slate-900 leading-none">{data.totalKg.toLocaleString()} KG</p>
          </div>
        </div>
      </div>

      <div className="mt-20 pt-8 border-t border-slate-200 flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
        <span>SİSTEM ONAYLI BELGE</span>
        <span>RAPOR TARİHİ: {new Date().toLocaleDateString('tr-TR')}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 border border-slate-200 no-print flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-sm border border-slate-200">
            <button onClick={() => setViewMode('single')} className={`px-4 py-1 text-[10px] font-bold ${viewMode === 'single' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>TEK EKİP</button>
            <button onClick={() => setViewMode('compare')} className={`px-4 py-1 text-[10px] font-bold ${viewMode === 'compare' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>TÜM EKİPLER</button>
          </div>
          <select className="px-2 py-1 bg-white border border-slate-200 text-[11px] font-bold" value={filterYear} onChange={e => setFilterYear(Number(e.target.value))}>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select className="px-2 py-1 bg-white border border-slate-200 text-[11px] font-bold" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
            {monthOptions.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          {viewMode === 'single' && (
            <select className="px-2 py-1 bg-blue-50 border border-blue-200 text-[11px] font-bold" value={selectedTeamId} onChange={e => setSelectedTeamId(e.target.value)}>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          )}
        </div>
        <button onClick={() => window.print()} className="bg-slate-900 text-white px-6 py-2 rounded-sm font-black text-[11px] hover:bg-black flex items-center gap-2">
          <Printer size={14} /> PDF OLUŞTUR / YAZDIR
        </button>
      </div>

      <div className="report-container">
        {currentDataList.length > 0 ? (
          currentDataList.map((data) => <ReportPage key={data.id} data={data} />)
        ) : (
          <div className="bg-white p-20 text-center border border-dashed border-slate-300 text-slate-400 font-bold uppercase text-xs">
            Kriterlere uygun kayıt bulunamadı.
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;