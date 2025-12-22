import React, { useState, useRef } from 'react';
import { Team, Project, ReportTemplate, ReportTheme, DEFAULT_THEME } from '../types';
import { ICONS } from '../constants';
import { supabase } from '../supabase';
import { 
  Download, Upload, ShieldCheck, Key, Eye, EyeOff, 
  Settings2, RefreshCcw, Trash2, AlertTriangle, FileBarChart, GripVertical, CheckCircle2, XCircle,
  Palette, Pipette, Layout
} from 'lucide-react';

interface SettingsViewProps {
  teams: Team[];
  projects: Project[];
  viewerPassword: string;
  templates: ReportTemplate[];
  onUpdateTemplates: (templates: ReportTemplate[]) => void;
  onUpdateViewerPassword: (pw: string) => void;
  onAddTeam: (name: string) => void;
  onAddProject: (name: string) => void;
  onDeleteTeam: (id: string) => void;
  onDeleteProject: (id: string) => void;
}

const PALETTES = [
  { name: 'Enterprise Blue', theme: DEFAULT_THEME },
  { name: 'Industrial Orange', theme: { ...DEFAULT_THEME, secondary: '#ea580c', imalat: '#f97316' } },
  { name: 'Deep Emerald', theme: { ...DEFAULT_THEME, secondary: '#059669', imalat: '#10b981' } },
  { name: 'Midnight Slate', theme: { ...DEFAULT_THEME, secondary: '#475569', primary: '#1e293b' } },
  { name: 'Corporate Purple', theme: { ...DEFAULT_THEME, secondary: '#7c3aed', accent: '#c026d3' } },
];

const SettingsView: React.FC<SettingsViewProps> = ({ 
  teams, projects, viewerPassword, templates, onUpdateTemplates,
  onUpdateViewerPassword, onAddTeam, onAddProject, onDeleteTeam, onDeleteProject 
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'templates' | 'theme'>('general');
  const [newTeam, setNewTeam] = useState('');
  const [newProject, setNewProject] = useState('');
  const [tempPassword, setTempPassword] = useState(viewerPassword);
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentTemplate = templates.find(t => t.id === 'team') || templates[0];
  const currentTheme = currentTemplate.theme || DEFAULT_THEME;

  const updateTheme = (newTheme: Partial<ReportTheme>) => {
    const updated = templates.map(t => {
      if (t.id === 'team') {
        return { ...t, theme: { ...currentTheme, ...newTheme } };
      }
      return t;
    });
    onUpdateTemplates(updated);
  };

  const toggleFieldVisibility = (fieldId: string) => {
    const updated = templates.map(t => {
      if (t.id === 'team') {
        return {
          ...t,
          fields: t.fields.map(f => f.id === fieldId ? { ...f, visible: !f.visible } : f)
        };
      }
      return t;
    });
    onUpdateTemplates(updated);
  };

  const updateFieldLabel = (fieldId: string, newLabel: string) => {
    const updated = templates.map(t => {
      if (t.id === 'team') {
        return {
          ...t,
          fields: t.fields.map(f => f.id === fieldId ? { ...f, label: newLabel } : f)
        };
      }
      return t;
    });
    onUpdateTemplates(updated);
  };

  const updateHeaderTitle = (title: string) => {
    const updated = templates.map(t => t.id === 'team' ? { ...t, headerTitle: title } : t);
    onUpdateTemplates(updated);
  };

  const handleExport = () => {
    const data = {
      teams, projects, 
      templates,
      viewerPassword,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ProAnaliz_Yedek.json`;
    link.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (confirm('Dikkat! Mevcut verileriniz silinecek ve yedek yüklenecektir. Emin misiniz?')) {
          alert('Yedek veriler başarıyla okundu. (Bulut veritabanı senkronizasyonu için lütfen yönetici ile iletişime geçin)');
          window.location.reload(); 
        }
      } catch (error) { alert('Hata: Geçersiz dosya formatı.'); }
    };
    reader.readAsText(file);
  };

  const handleFactoryReset = async () => {
    if (confirm('DİKKAT! Tüm üretim verileri, bütçeler, ekipler ve projeler KALICI OLARAK silinecektir. Bu işlem geri alınamaz!')) {
      const password = prompt('Sıfırlama işlemi için yönetici anahtarını girin:');
      if (password === '142536789') {
        try {
          await supabase.from('entries').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          await supabase.from('budgets').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          await supabase.from('teams').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          await supabase.from('projects').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          alert('Sistem başarıyla sıfırlandı. Sayfa yenileniyor...');
          window.location.reload();
        } catch (e) {
          alert('Sıfırlama sırasında hata oluştu.');
        }
      } else {
        alert('Hatalı şifre! Sıfırlama iptal edildi.');
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex bg-slate-100 p-1 rounded-2xl w-fit no-print">
        <button 
          onClick={() => setActiveTab('general')}
          className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'general' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Sistem Ayarları
        </button>
        <button 
          onClick={() => setActiveTab('templates')}
          className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'templates' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Rapor Şablonları
        </button>
        <button 
          onClick={() => setActiveTab('theme')}
          className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'theme' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Görünüm ve Tema
        </button>
      </div>

      {activeTab === 'general' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">{ICONS.Users} Ekipler</h3>
              <div className="flex gap-2 mb-6">
                <input type="text" className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="Yeni ekip adı..." value={newTeam} onChange={e => setNewTeam(e.target.value)} />
                <button onClick={() => { if(newTeam) { onAddTeam(newTeam); setNewTeam(''); } }} className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700">{ICONS.Plus}</button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                {teams.map(team => (
                  <div key={team.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-700">{team.name}</span>
                    <button onClick={() => onDeleteTeam(team.id)} className="text-slate-300 hover:text-red-500">{ICONS.Trash}</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">{ICONS.Project} Projeler</h3>
              <div className="flex gap-2 mb-6">
                <input type="text" className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="Yeni proje adı..." value={newProject} onChange={e => setNewProject(e.target.value)} />
                <button onClick={() => { if(newProject) { onAddProject(newProject); setNewProject(''); } }} className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700">{ICONS.Plus}</button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                {projects.map(project => (
                  <div key={project.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-700">{project.name}</span>
                    <button onClick={() => onDeleteProject(project.id)} className="text-slate-300 hover:text-red-500">{ICONS.Trash}</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><Key className="text-amber-500" /> Şifre Yönetimi</h3>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">İzleyici Erişim Şifresi</label>
                <div className="relative mb-4">
                  <input type={showPassword ? 'text' : 'password'} className="w-full pl-10 pr-12 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500" value={tempPassword} onChange={(e) => setTempPassword(e.target.value)} />
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
                <button onClick={() => { onUpdateViewerPassword(tempPassword); alert('Şifre Güncellendi!'); }} className="w-full bg-amber-500 text-white py-3 rounded-xl font-bold transition-all hover:bg-amber-600 shadow-lg shadow-amber-100">Güncelle</button>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-center">
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><ShieldCheck className="text-blue-500" /> Veri Yönetimi</h3>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={handleExport} className="bg-slate-900 text-white px-4 py-4 rounded-xl font-bold text-xs uppercase transition-all hover:bg-black flex flex-col items-center gap-3">
                  <Download size={24} /> Yedek Al
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="bg-white text-slate-800 border-2 border-slate-100 px-4 py-4 rounded-xl font-bold text-xs uppercase transition-all hover:bg-slate-50 flex flex-col items-center gap-3">
                  <Upload size={24} /> Geri Yükle
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImport} />
              </div>
            </div>

            <div className="bg-red-50 p-8 rounded-2xl shadow-sm border border-red-100 flex flex-col justify-center">
              <h3 className="text-xl font-bold text-red-800 mb-6 flex items-center gap-2"><RefreshCcw className="text-red-500" /> Kritik İşlemler</h3>
              <button 
                onClick={handleFactoryReset}
                className="bg-red-600 text-white px-4 py-6 rounded-xl font-black text-xs uppercase transition-all hover:bg-red-700 flex flex-col items-center gap-3 shadow-xl shadow-red-200"
              >
                <Trash2 size={24} />
                Sistemi Sıfırla
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-10">
               <div>
                  <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Rapor Şablon Oluşturucu</h3>
                  <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">Çıktı Alanlarını ve Sayfa Başlıklarını Özelleştirin</p>
               </div>
               <div className="p-4 bg-indigo-50 text-indigo-600 rounded-3xl">
                  <Settings2 size={40} />
               </div>
            </div>
            
            <div className="mb-10 p-8 bg-slate-50 rounded-[2rem] border border-slate-200">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Ana Sayfa Başlığı (Print Header)</label>
              <input 
                type="text" 
                value={currentTemplate.headerTitle}
                onChange={(e) => updateHeaderTitle(e.target.value)}
                className="w-full p-5 bg-white border border-slate-200 rounded-2xl text-xl font-black uppercase outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                placeholder="Örn: EKİP PERFORMANS ANALİZİ"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentTemplate.fields.map((field) => (
                <div key={field.id} className={`p-8 rounded-[2.5rem] border-2 transition-all flex flex-col gap-4 ${field.visible ? 'border-indigo-100 bg-white shadow-md' : 'border-slate-50 bg-slate-50/50 opacity-60'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <GripVertical className="text-slate-300" size={20} />
                       <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Alan: {field.id}</span>
                    </div>
                    <button 
                      onClick={() => toggleFieldVisibility(field.id)}
                      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${field.visible ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}
                    >
                      {field.visible ? <><CheckCircle2 size={14} /> Görünür</> : <><XCircle size={14} /> Gizli</>}
                    </button>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Görünen Etiket</label>
                     <input 
                       type="text" 
                       value={field.label}
                       onChange={(e) => updateFieldLabel(field.id, e.target.value)}
                       className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"
                       placeholder="Etiket Giriniz"
                     />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'theme' && (
        <div className="space-y-6">
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-200">
             <div className="flex items-center justify-between mb-10">
               <div>
                  <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Kurumsal Kimlik & Tema</h3>
                  <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">Rapor ve Dashboard Renklerini Özelleştirin</p>
               </div>
               <div className="p-4 bg-emerald-50 text-emerald-600 rounded-3xl">
                  <Palette size={40} />
               </div>
            </div>

            <div className="mb-10">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block">Hazır Paletler</label>
               <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {PALETTES.map((p) => (
                    <button 
                      key={p.name}
                      onClick={() => updateTheme(p.theme)}
                      className="group flex flex-col items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:bg-white hover:border-emerald-300 transition-all"
                    >
                       <div className="flex gap-1">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: p.theme.primary }}></div>
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: p.theme.secondary }}></div>
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: p.theme.accent }}></div>
                       </div>
                       <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter text-center">{p.name}</span>
                    </button>
                  ))}
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <ThemeSection title="Ana Renkler">
                  <ColorPicker label="Birincil (Header)" value={currentTheme.primary} onChange={(v) => updateTheme({ primary: v })} />
                  <ColorPicker label="İkincil (Vurgu)" value={currentTheme.secondary} onChange={(v) => updateTheme({ secondary: v })} />
                  <ColorPicker label="Aksan (İkonlar)" value={currentTheme.accent} onChange={(v) => updateTheme({ accent: v })} />
               </ThemeSection>

               <ThemeSection title="Üretim Tipleri">
                  <ColorPicker label="İmalat Rengi" value={currentTheme.imalat} onChange={(v) => updateTheme({ imalat: v })} />
                  <ColorPicker label="Kaynak Rengi" value={currentTheme.kaynak} onChange={(v) => updateTheme({ kaynak: v })} />
                  <ColorPicker label="Temizlik Rengi" value={currentTheme.temizlik} onChange={(v) => updateTheme({ temizlik: v })} />
               </ThemeSection>

               <div className="bg-slate-900 p-8 rounded-[2rem] text-white flex flex-col justify-center gap-4">
                  <Layout size={32} className="text-emerald-400" />
                  <h4 className="text-lg font-black uppercase leading-tight">Canlı Önizleme</h4>
                  <div className="space-y-2 opacity-80">
                    <div className="h-4 w-full rounded" style={{ backgroundColor: currentTheme.primary }}></div>
                    <div className="flex gap-2">
                       <div className="h-8 w-1/3 rounded" style={{ backgroundColor: currentTheme.imalat }}></div>
                       <div className="h-8 w-1/3 rounded" style={{ backgroundColor: currentTheme.kaynak }}></div>
                       <div className="h-8 w-1/3 rounded" style={{ backgroundColor: currentTheme.temizlik }}></div>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">Bu renkler tüm raporlama sayfalarında geçerli olacaktır.</p>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ThemeSection = ({ title, children }: any) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-6">
    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-3">{title}</h4>
    {children}
  </div>
);

const ColorPicker = ({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) => (
  <div className="flex items-center justify-between gap-4">
     <div className="flex flex-col">
        <span className="text-[10px] font-black text-slate-900 uppercase tracking-tighter">{label}</span>
        <span className="text-[10px] font-mono text-slate-400">{value.toUpperCase()}</span>
     </div>
     <div className="relative">
        <input 
          type="color" 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          className="w-10 h-10 rounded-full border-2 border-white shadow-md cursor-pointer overflow-hidden opacity-0 absolute inset-0 z-10"
        />
        <div className="w-10 h-10 rounded-full border-2 border-slate-100 shadow-sm flex items-center justify-center transition-all" style={{ backgroundColor: value }}>
           <Pipette size={14} className="text-white mix-blend-difference" />
        </div>
     </div>
  </div>
);

export default SettingsView;