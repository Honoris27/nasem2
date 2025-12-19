
import React, { useMemo, useState } from 'react';
import { Team, Budget, ProductionEntry, MONTHS, YEARS, WORKING_HOURS_PER_MONTH } from '../types';
import { DollarSign, Users, Activity, Clock, Filter, Printer } from 'lucide-react';

interface PeriodSummaryProps {
  entries: ProductionEntry[];
  budgets: Budget[];
  teams: Team[];
}

const PeriodSummary: React.FC<PeriodSummaryProps> = ({ entries, budgets, teams }) => {
  const [filterYear, setFilterYear] = useState(2025);
  const [filterMonth, setFilterMonth] = useState('Ocak');
  
  const ALL_MONTHS = 'Tüm Aylar';
  const monthOptions = [ALL_MONTHS, ...MONTHS];

  const stats = useMemo(() => {
    const periodEntries = entries.filter(e => 
      e.year === filterYear && (filterMonth === ALL_MONTHS ? true : e.month === filterMonth)
    );
    const periodBudgets = budgets.filter(b => 
      b.year === filterYear && (filterMonth === ALL_MONTHS ? true : b.month === filterMonth)
    );

    const kg = periodEntries.reduce((acc, curr) => acc + curr.quantityKg, 0);
    const budget = periodBudgets.reduce((acc, curr) => acc + curr.amountTL, 0);
    const personnel = periodBudgets.reduce((acc, curr) => acc + curr.personnelCount, 0);
    const hours = personnel * WORKING_HOURS_PER_MONTH;

    return { kg, budget, personnel, hours };
  }, [entries, budgets, filterYear, filterMonth]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-4 no-print shadow-sm">
        <div className="flex items-center gap-4">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dönem Seçimi:</div>
          <select 
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-bold outline-none" 
            value={filterYear} 
            onChange={e => setFilterYear(Number(e.target.value))}
          >
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select 
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-bold outline-none" 
            value={filterMonth} 
            onChange={e => setFilterMonth(e.target.value)}
          >
            {monthOptions.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded font-bold text-xs hover:bg-black transition-all">
          <Printer size={16} /> ÖZET YAZDIR
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="bg-slate-900 p-8 text-white">
          <h2 className="text-xl font-bold tracking-tight uppercase">OPERASYONEL KONSOLİDE ÖZET</h2>
          <p className="text-xs text-slate-400 font-bold uppercase mt-1 tracking-widest">{filterMonth} {filterYear} Dönemi Verileri</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          <SummaryBlock label="TOPLAM ÜRETİM" value={`${stats.kg.toLocaleString()} KG`} icon={<Activity size={18} className="text-blue-500" />} />
          <SummaryBlock label="TOPLAM BÜTÇE" value={`${stats.budget.toLocaleString()} ₺`} icon={<DollarSign size={18} className="text-emerald-500" />} />
          <SummaryBlock label="PERSONEL GÜCÜ" value={`${stats.personnel} KİŞİ`} icon={<Users size={18} className="text-indigo-500" />} />
          <SummaryBlock label="ADAM-SAAT" value={`${stats.hours.toLocaleString()} SAAT`} icon={<Clock size={18} className="text-slate-500" />} />
        </div>

        <div className="p-8 border-t border-slate-100 bg-slate-50/50">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">SİSTEM NOTLARI</h3>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            Yukarıdaki veriler, seçilen döneme ait tüm ekiplerin ve projelerin toplu analiz sonuçlarını temsil eder. 
            Maliyet hesaplamaları, girilen personel hakedişleri ve toplam üretim kilogramları üzerinden dinamik olarak hesaplanmıştır.
          </p>
        </div>
      </div>
    </div>
  );
};

const SummaryBlock = ({ label, value, icon }: any) => (
  <div className="p-8 flex flex-col items-center justify-center text-center">
    <div className="mb-3 text-slate-300">{icon}</div>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <h4 className="text-2xl font-bold text-slate-800 tracking-tight">{value}</h4>
  </div>
);

export default PeriodSummary;
