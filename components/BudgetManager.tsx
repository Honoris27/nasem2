
import React, { useState } from 'react';
import { Team, Budget, MONTHS, YEARS } from '../types';
import { Save, Trash2, ShieldCheck } from 'lucide-react';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.teamId || formData.personnelCount <= 0 || formData.amountTL <= 0) {
      alert("HATA: Tüm zorunlu alanları doldurunuz.");
      return;
    }
    onAddBudget(formData);
    setFormData({ ...formData, personnelCount: 0, amountTL: 0 });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-2">
          <ShieldCheck size={16} className="text-blue-500" />
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Dönemsel Bütçe ve Personel Ataması</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 tracking-widest uppercase">SORUMLU EKİP</label>
              <select className="erp-input" value={formData.teamId} onChange={e => setFormData({...formData, teamId: e.target.value})}>
                <option value="">Seçiniz...</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 tracking-widest uppercase">YIL</label>
              <select className="erp-input" value={formData.year} onChange={e => setFormData({...formData, year: Number(e.target.value)})}>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 tracking-widest uppercase">AY</label>
              <select className="erp-input" value={formData.month} onChange={e => setFormData({...formData, month: e.target.value})}>
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 tracking-widest uppercase">PERSONEL SAYISI</label>
              <input type="number" className="erp-input font-bold" value={formData.personnelCount || ''} onChange={e => setFormData({...formData, personnelCount: Number(e.target.value)})} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 tracking-widest uppercase">HAKEDİŞ (TL)</label>
              <input type="number" className="erp-input font-bold text-emerald-600" value={formData.amountTL || ''} onChange={e => setFormData({...formData, amountTL: Number(e.target.value)})} />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-8 rounded shadow flex items-center gap-2 text-xs uppercase tracking-widest transition-colors">
              <Save size={16} /> BÜTÇE ATAMASINI KAYDET
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
                <th className="px-6 py-3 text-center">PERSONEL</th>
                <th className="px-6 py-3 text-right">ÖDENEN HAKEDİŞ</th>
                <th className="px-6 py-3 text-center">İŞLEM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {budgets.slice().reverse().map((budget) => (
                <tr key={budget.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-400">{budget.month} {budget.year}</td>
                  <td className="px-6 py-4 font-bold text-slate-700">{teams.find(t => t.id === budget.teamId)?.name}</td>
                  <td className="px-6 py-4 text-center font-bold text-blue-600">{budget.personnelCount}</td>
                  <td className="px-6 py-4 text-right font-bold text-emerald-600">{budget.amountTL.toLocaleString()} ₺</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => onDeleteBudget(budget.id)} className="text-red-300 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BudgetManager;
