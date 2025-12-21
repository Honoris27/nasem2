import React, { useState, useMemo } from 'react';
import { Team, Budget, MONTHS, YEARS, DAILY_WORKING_HOURS } from '../types';
import { Save, Trash2, ShieldCheck, Calendar as CalendarIcon, Clock } from 'lucide-react';

interface BudgetManagerProps {
  teams: Team[];
  budgets: Budget[];
  onAddBudget: (budget: Omit<Budget, 'id'>) => void;
  onDeleteBudget: (id: string) => void;
}

const BudgetManager: React.FC<BudgetManagerProps> = ({ teams, budgets, onAddBudget, onDeleteBudget }) => {
  const [formData, setFormData] = useState({
    teamId: '',
    year: 2025,
    month: 'Ocak',
    personnelCount: 0,
    amountTL: 0
  });

  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  const getDaysInMonth = (monthName: string, year: number) => {
    const monthIndex = MONTHS.indexOf(monthName);
    return new Date(year, monthIndex + 1, 0).getDate();
  };

  const daysInCurrentMonth = useMemo(() => 
    getDaysInMonth(formData.month, formData.year), 
    [formData.month, formData.year]
  );

  const toggleDay = (day: number) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const selectAllWeekdays = () => {
    const days = [];
    const monthIndex = MONTHS.indexOf(formData.month);
    for (let i = 1; i <= daysInCurrentMonth; i++) {
      const date = new Date(formData.year, monthIndex, i);
      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Pazar(0) ve Cumartesi(6) değilse
        days.push(i);
      }
    }
    setSelectedDays(days);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.teamId || formData.personnelCount <= 0 || formData.amountTL <= 0 || selectedDays.length === 0) {
      alert("HATA: Tüm zorunlu alanları (ve en az 1 çalışma günü) doldurunuz.");
      return;
    }
    onAddBudget({
      ...formData,
      workingDays: selectedDays
    });
    setFormData({ ...formData, personnelCount: 0, amountTL: 0 });
    setSelectedDays([]);
  };

  const calculatedManHours = (formData.personnelCount * selectedDays.length * DAILY_WORKING_HOURS).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-blue-500" />
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Dönemsel Bütçe ve Takvim Planlama</h3>
          </div>
          <div className="flex items-center gap-4 bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100">
             <div className="flex items-center gap-2">
                <Clock size={14} className="text-blue-600" />
                <span className="text-[10px] font-black text-blue-700 uppercase">Tahmini Adam-Saat: {calculatedManHours} h</span>
             </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Fields */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 tracking-widest uppercase">SORUMLU EKİP</label>
                  <select className="erp-input" value={formData.teamId} onChange={e => setFormData({...formData, teamId: e.target.value})}>
                    <option value="">Seçiniz...</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 tracking-widest uppercase">HAKEDİŞ (TL)</label>
                  <input type="number" className="erp-input font-bold text-emerald-600" placeholder="0.00" value={formData.amountTL || ''} onChange={e => setFormData({...formData, amountTL: Number(e.target.value)})} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 tracking-widest uppercase">YIL</label>
                  <select className="erp-input" value={formData.year} onChange={e => { setFormData({...formData, year: Number(e.target.value)}); setSelectedDays([]); }}>
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 tracking-widest uppercase">AY</label>
                  <select className="erp-input" value={formData.month} onChange={e => { setFormData({...formData, month: e.target.value}); setSelectedDays([]); }}>
                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 tracking-widest uppercase">PERSONEL SAYISI</label>
                  <input type="number" className="erp-input font-bold" placeholder="0" value={formData.personnelCount || ''} onChange={e => setFormData({...formData, personnelCount: Number(e.target.value)})} />
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded text-[11px] font-medium text-slate-500 leading-relaxed">
                <span className="font-bold text-blue-600 uppercase">Bilgi:</span> Adam-saat hesabı, personel sayısı ile seçilen günlerin çarpımının günlük <b>{DAILY_WORKING_HOURS} saat</b> ile çarpılmasıyla elde edilir.
              </div>
            </div>

            {/* Calendar Picker */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[9px] font-black text-slate-400 tracking-widest uppercase flex items-center gap-2">
                  <CalendarIcon size={14} /> ÇALIŞMA GÜNLERİ ({selectedDays.length} GÜN SEÇİLDİ)
                </label>
                <button type="button" onClick={selectAllWeekdays} className="text-[9px] font-black text-blue-600 hover:underline uppercase tracking-widest">Hafta İçi Günlerini Seç</button>
              </div>
              <div className="grid grid-cols-7 gap-1 bg-slate-100 p-2 rounded border border-slate-200">
                {['Pt', 'Sa', 'Çr', 'Pr', 'Cu', 'Ct', 'Pz'].map(d => (
                  <div key={d} className="text-[10px] font-black text-slate-400 text-center py-1">{d}</div>
                ))}
                {Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1).map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`h-10 rounded text-xs font-bold transition-all ${
                      selectedDays.includes(day) 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-95' 
                        : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-10 rounded shadow-xl flex items-center gap-2 text-xs uppercase tracking-widest transition-all active:scale-95">
              <Save size={16} /> BÜTÇE VE TAKVİMİ KAYDET
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Planlama Kayıtları</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left erp-table">
            <thead>
              <tr>
                <th className="px-6 py-3">DÖNEM</th>
                <th className="px-6 py-3">EKİP ADI</th>
                <th className="px-6 py-3 text-center">GÜN / PERSONEL</th>
                <th className="px-6 py-3 text-center">ADAM-SAAT</th>
                <th className="px-6 py-3 text-right">ÖDENEN HAKEDİŞ</th>
                <th className="px-6 py-3 text-center">İŞLEM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {budgets.slice().reverse().map((budget) => {
                const daysCount = budget.workingDays?.length || 0;
                const hours = (budget.personnelCount * daysCount * DAILY_WORKING_HOURS).toLocaleString();
                return (
                  <tr key={budget.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-400">{budget.month} {budget.year}</td>
                    <td className="px-6 py-4 font-bold text-slate-700">{teams.find(t => t.id === budget.teamId)?.name}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded font-bold mr-1">{daysCount} GÜN</span>
                      <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded font-bold">{budget.personnelCount} P.</span>
                    </td>
                    <td className="px-6 py-4 text-center font-black text-slate-800">{hours} h</td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-600">{budget.amountTL.toLocaleString()} ₺</td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => onDeleteBudget(budget.id)} className="text-red-300 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BudgetManager;