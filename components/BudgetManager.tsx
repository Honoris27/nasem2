import React, { useState, useMemo } from 'react';
import { Team, Budget, MONTHS, YEARS, DAILY_WORKING_HOURS } from '../types';
import { Save, Trash2, ShieldCheck, Calendar as CalendarIcon, Clock, XCircle, CheckCircle, AlertCircle } from 'lucide-react';

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

  // Kullanıcı "Çalışılmayan" (Tatil/İzin) günleri seçecek
  const [offDays, setOffDays] = useState<number[]>([]);

  const monthIndex = useMemo(() => MONTHS.indexOf(formData.month), [formData.month]);

  const daysInCurrentMonth = useMemo(() => 
    new Date(formData.year, monthIndex + 1, 0).getDate(), 
    [formData.year, monthIndex]
  );

  // Ayın ilk gününün haftanın hangi günü olduğunu bul (0: Pazar, 1: Pazartesi...)
  // Pazartesi'yi 0 yapmak için (day + 6) % 7 kullanılır.
  const firstDayOfMonth = useMemo(() => {
    const day = new Date(formData.year, monthIndex, 1).getDay();
    return (day === 0) ? 6 : day - 1; 
  }, [formData.year, monthIndex]);

  const toggleOffDay = (day: number) => {
    setOffDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const selectWeekendsAsOff = () => {
    const days = [];
    for (let i = 1; i <= daysInCurrentMonth; i++) {
      const date = new Date(formData.year, monthIndex, i);
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) { // 0: Pazar, 6: Cumartesi
        days.push(i);
      }
    }
    setOffDays(days);
  };

  const workingDaysList = useMemo(() => {
    const allDays = Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1);
    return allDays.filter(d => !offDays.includes(d));
  }, [daysInCurrentMonth, offDays]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.teamId || formData.personnelCount <= 0 || formData.amountTL <= 0 || workingDaysList.length === 0) {
      alert("HATA: Eksik bilgi! Lütfen ekip, tutar, personel ve en az 1 çalışma günü belirleyin.");
      return;
    }
    onAddBudget({
      ...formData,
      workingDays: workingDaysList
    });
    setFormData({ ...formData, personnelCount: 0, amountTL: 0 });
    setOffDays([]);
  };

  const calculatedManHours = (formData.personnelCount * workingDaysList.length * DAILY_WORKING_HOURS).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden border-t-4 border-t-blue-600">
        <div className="bg-slate-50 px-8 py-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Kapasite ve Takvim Planlama</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Dönemsel Personel ve Mesai Girişi</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white px-5 py-2 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex items-center gap-2">
                <Clock size={16} className="text-blue-600" />
                <span className="text-xs font-black text-slate-700 uppercase">NET EFOR: {calculatedManHours} h</span>
             </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Form Fields Side */}
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 tracking-widest uppercase ml-1">SORUMLU ÜRETİM EKİBİ</label>
                  <select className="erp-input h-12 rounded-xl bg-slate-50 border-slate-200 font-bold" value={formData.teamId} onChange={e => setFormData({...formData, teamId: e.target.value})}>
                    <option value="">Seçiniz...</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 tracking-widest uppercase ml-1">TOPLAM HAKEDİŞ (TL)</label>
                  <div className="relative">
                    <input type="number" className="erp-input h-12 rounded-xl bg-slate-50 border-slate-200 font-bold text-emerald-600 pl-10" placeholder="0.00" value={formData.amountTL || ''} onChange={e => setFormData({...formData, amountTL: Number(e.target.value)})} />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₺</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 tracking-widest uppercase ml-1">YIL</label>
                  <select className="erp-input h-12 rounded-xl bg-slate-50 border-slate-200 font-bold" value={formData.year} onChange={e => { setFormData({...formData, year: Number(e.target.value)}); setOffDays([]); }}>
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 tracking-widest uppercase ml-1">AY</label>
                  <select className="erp-input h-12 rounded-xl bg-slate-50 border-slate-200 font-bold" value={formData.month} onChange={e => { setFormData({...formData, month: e.target.value}); setOffDays([]); }}>
                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 tracking-widest uppercase ml-1">PERSONEL</label>
                  <input type="number" className="erp-input h-12 rounded-xl bg-slate-50 border-slate-200 font-bold" placeholder="0" value={formData.personnelCount || ''} onChange={e => setFormData({...formData, personnelCount: Number(e.target.value)})} />
                </div>
              </div>

              <div className="p-6 bg-blue-50/40 border border-blue-100 rounded-2xl flex items-start gap-4">
                <div className="p-2 bg-blue-500 text-white rounded-lg">
                  <AlertCircle size={16} />
                </div>
                <div>
                  <h4 className="text-[11px] font-black text-blue-600 uppercase tracking-widest mb-1">Hesaplama Parametresi</h4>
                  <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                    Sistem 1 personelin günlük net çalışmasını <b className="text-blue-700">{DAILY_WORKING_HOURS} saat</b> olarak kabul eder. 
                    Sağdaki takvimden izinli günleri işaretleyerek net adam-saat verisini otomatik güncelleyebilirsiniz.
                  </p>
                </div>
              </div>
            </div>

            {/* Calendar Picker Side */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black text-slate-500 tracking-widest uppercase flex items-center gap-2">
                  <CalendarIcon size={14} className="text-blue-500" /> ÇALIŞILMAYAN GÜNLERİ SEÇİN
                </label>
                <button type="button" onClick={selectWeekendsAsOff} className="text-[10px] font-black text-red-500 hover:text-red-700 uppercase tracking-widest transition-colors">
                  Hafta Sonlarını Kapat
                </button>
              </div>

              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 shadow-inner">
                {/* Calendar Grid Header */}
                <div className="grid grid-cols-7 mb-4">
                  {['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'].map(d => (
                    <div key={d} className="text-[10px] font-black text-slate-400 text-center uppercase tracking-tighter">{d}</div>
                  ))}
                </div>

                {/* Calendar Days Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {/* Empty slots for the start of the month */}
                  {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-11"></div>
                  ))}
                  
                  {/* Actual month days */}
                  {Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1).map(day => {
                    const isOff = offDays.includes(day);
                    const isToday = new Date().getDate() === day && new Date().getMonth() === monthIndex && new Date().getFullYear() === formData.year;
                    
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleOffDay(day)}
                        className={`h-11 rounded-xl text-xs font-bold transition-all relative group flex items-center justify-center border-2 ${
                          isOff 
                            ? 'bg-red-50 text-red-600 border-red-200 shadow-sm scale-95' 
                            : 'bg-white text-slate-600 hover:border-blue-300 border-white shadow-sm hover:shadow-md'
                        } ${isToday ? 'ring-2 ring-blue-400 ring-offset-2' : ''}`}
                      >
                        {day}
                        {isOff ? (
                          <XCircle size={10} className="absolute top-1 right-1 opacity-60" />
                        ) : (
                          <div className="absolute bottom-1 w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        )}
                      </button>
                    );
                  })}
                </div>
                
                <div className="mt-6 pt-4 border-t border-slate-200 flex justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-white border border-slate-200 shadow-sm"></div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase">Mesai</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-100 border border-red-200 shadow-sm"></div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase">İzin/Tatil</span>
                  </div>
                  <div className="text-[10px] font-black text-blue-600 uppercase">NET: {workingDaysList.length} GÜN</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 flex justify-end">
            <button type="submit" className="bg-slate-900 hover:bg-black text-white font-black py-4 px-12 rounded-2xl shadow-xl shadow-slate-200 flex items-center gap-3 text-xs uppercase tracking-[0.2em] transition-all active:scale-95">
              <Save size={18} /> PLANLAMAYI SİSTEME İŞLE
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-slate-50 px-8 py-4 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Kayıtlı Aylık Planlamalar</h3>
          <span className="text-[10px] font-black text-blue-500 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">{budgets.length} DÖNEM</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left erp-table border-none">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 border-none text-[10px] tracking-widest">DÖNEM</th>
                <th className="px-8 py-4 border-none text-[10px] tracking-widest">EKİP ADI</th>
                <th className="px-8 py-4 border-none text-center text-[10px] tracking-widest">ÇALIŞMA GÜN / PERS.</th>
                <th className="px-8 py-4 border-none text-center text-[10px] tracking-widest">NET ADAM-SAAT</th>
                <th className="px-8 py-4 border-none text-right text-[10px] tracking-widest">HAKEDİŞ TUTARI</th>
                <th className="px-8 py-4 border-none text-center text-[10px] tracking-widest">İŞLEM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {budgets.slice().reverse().map((budget) => {
                const daysCount = budget.workingDays?.length || 0;
                const hours = (budget.personnelCount * daysCount * DAILY_WORKING_HOURS).toLocaleString();
                return (
                  <tr key={budget.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-8 py-5 border-none font-bold text-slate-400 text-xs">{budget.month} {budget.year}</td>
                    <td className="px-8 py-5 border-none font-black text-slate-800 text-xs uppercase tracking-tight">{teams.find(t => t.id === budget.teamId)?.name}</td>
                    <td className="px-8 py-5 border-none text-center">
                      <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl font-black text-[10px] border border-emerald-100 shadow-sm">
                        <CheckCircle size={10} /> {daysCount} GÜN / {budget.personnelCount} P.
                      </div>
                    </td>
                    <td className="px-8 py-5 border-none text-center font-black text-slate-900 text-xs">{hours} h</td>
                    <td className="px-8 py-5 border-none text-right font-black text-emerald-600 text-xs">{budget.amountTL.toLocaleString()} ₺</td>
                    <td className="px-8 py-5 border-none text-center">
                      <button onClick={() => onDeleteBudget(budget.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {budgets.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">Henüz bir planlama kaydı bulunmuyor.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BudgetManager;