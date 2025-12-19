
import React, { useState } from 'react';
import { Team, Project, ProductionType, MONTHS, YEARS, ProductionEntry } from '../types';
import { Save, History, X } from 'lucide-react';

interface DataEntryProps {
  teams: Team[];
  projects: Project[];
  entries: ProductionEntry[];
  onAddEntry: (entry: Omit<ProductionEntry, 'id'>) => void;
  onDeleteEntry: (id: string) => void;
}

const DataEntry: React.FC<DataEntryProps> = ({ teams, projects, entries, onAddEntry, onDeleteEntry }) => {
  const [formData, setFormData] = useState({
    year: 2025,
    month: 'Ocak',
    projectId: '',
    teamId: '',
    type: ProductionType.IMALAT,
    quantityKg: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectId || !formData.teamId || formData.quantityKg <= 0) return alert("HATA: Tüm alanları doldurunuz.");
    onAddEntry(formData);
    setFormData({ ...formData, quantityKg: 0 });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Yeni Üretim Kaydı</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <FormGroup label="YIL">
              <select className="erp-input" value={formData.year} onChange={e => setFormData({...formData, year: Number(e.target.value)})}>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="AY">
              <select className="erp-input" value={formData.month} onChange={e => setFormData({...formData, month: e.target.value})}>
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="PROJE">
              <select className="erp-input" value={formData.projectId} onChange={e => setFormData({...formData, projectId: e.target.value})}>
                <option value="">Seçiniz...</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="EKİP">
              <select className="erp-input" value={formData.teamId} onChange={e => setFormData({...formData, teamId: e.target.value})}>
                <option value="">Seçiniz...</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="TÜR">
              <select className="erp-input" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as ProductionType})}>
                {Object.values(ProductionType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="MİKTAR (KG)">
              <input type="number" className="erp-input font-bold" value={formData.quantityKg || ''} onChange={e => setFormData({...formData, quantityKg: Number(e.target.value)})} />
            </FormGroup>
          </div>

          <div className="mt-6 flex justify-end">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-8 rounded shadow flex items-center gap-2 text-xs uppercase tracking-widest transition-colors">
              <Save size={16} /> KAYDI SİSTEME İŞLE
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Kayıt Geçmişi</h3>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{entries.length} KAYIT</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left erp-table">
            <thead>
              <tr>
                <th className="px-6 py-3">DÖNEM</th>
                <th className="px-6 py-3">PROJE / EKİP</th>
                <th className="px-6 py-3">ÜRÜN TÜRÜ</th>
                <th className="px-6 py-3 text-right">MİKTAR (KG)</th>
                <th className="px-6 py-3 text-center">İŞLEM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {entries.slice().reverse().map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-400">{entry.month} {entry.year}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-700">{projects.find(p => p.id === entry.projectId)?.name}</div>
                    <div className="text-[10px] font-bold text-blue-500 uppercase">{teams.find(t => t.id === entry.teamId)?.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded-full border border-slate-200 text-[9px] font-bold text-slate-500 uppercase">{entry.type}</span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-800">{entry.quantityKg.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => onDeleteEntry(entry.id)} className="text-red-300 hover:text-red-500 transition-colors">
                      <X size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .erp-input {
          width: 100%;
          padding: 0.6rem 1rem;
          background-color: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          outline: none;
          font-size: 0.8rem;
          color: #334155;
        }
        .erp-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }
      `}</style>
    </div>
  );
};

const FormGroup = ({ label, children }: any) => (
  <div className="space-y-1.5">
    <label className="text-[9px] font-black text-slate-400 tracking-widest uppercase">{label}</label>
    {children}
  </div>
);

export default DataEntry;
