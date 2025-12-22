import React, { useState, useEffect } from 'react';
import { 
  Team, Project, Budget, ProductionEntry, ViewType, UserRole, ReportTemplate, DEFAULT_THEME
} from './types';
import { ICONS } from './constants';
import { supabase } from './supabase';
import Dashboard from './components/Dashboard';
import DataEntry from './components/DataEntry';
import BudgetManager from './components/BudgetManager';
import SettingsView from './components/SettingsView';
import Reports from './components/Reports';
import YearlyReport from './components/YearlyReport';
import ProjectReport from './components/ProjectReport';
import Login from './components/Login';
import { LogOut, User, ChevronRight, Loader2, FileText, Briefcase, Menu } from 'lucide-react';

const App: React.FC = () => {
  const [userRole, setUserRole] = useState<UserRole | null>(() => {
    const saved = localStorage.getItem('userRole');
    return saved ? (saved as UserRole) : null;
  });
  
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [viewerPassword, setViewerPassword] = useState('123456');
  const [loading, setLoading] = useState(true);

  const [teams, setTeams] = useState<Team[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [entries, setEntries] = useState<ProductionEntry[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: teamsData } = await supabase.from('teams').select('*');
        const { data: projectsData } = await supabase.from('projects').select('*');
        const { data: budgetsData } = await supabase.from('budgets').select('*');
        const { data: entriesData } = await supabase.from('entries').select('*');
        const { data: settingsData } = await supabase.from('settings').select('*');

        if (teamsData) setTeams(teamsData);
        if (projectsData) setProjects(projectsData);
        if (budgetsData) setBudgets(budgetsData);
        if (entriesData) setEntries(entriesData);
        
        const pwSetting = settingsData?.find(s => s.key === 'viewer_password');
        if (pwSetting) setViewerPassword(pwSetting.value);

        const templateSetting = settingsData?.find(s => s.key === 'report_template');
        if (templateSetting) {
          const parsed = JSON.parse(templateSetting.value);
          // Ensure each template has a theme
          const sanitized = parsed.map((t: any) => ({
            ...t,
            theme: t.theme || DEFAULT_THEME
          }));
          setTemplates(sanitized);
        } else {
          setTemplates([{
            id: 'team',
            name: 'Standart ERP Şablonu',
            showCharts: true,
            headerTitle: 'PERSONEL VE ÜRETİM ANALİZ RAPORU',
            theme: DEFAULT_THEME,
            fields: [
              { id: 'personnel', label: 'Aktif Personel', visible: true },
              { id: 'budget', label: 'Toplam Hakediş', visible: true },
              { id: 'efficiency', label: 'Birim Verim (kg/kişi)', visible: true },
              { id: 'costPerKg', label: 'Birim Maliyet (TL/kg)', visible: true },
              { id: 'breakdown', label: 'Üretim Detayları', visible: true },
              { id: 'manHours', label: 'Çalışma Saati', visible: true }
            ]
          }]);
        }
      } catch (error) {
        console.error("Veri çekme hatası:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    setUserRole(null);
    localStorage.removeItem('userRole');
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'DASHBOARD', icon: ICONS.Dashboard, roles: ['admin', 'viewer'] },
    { id: 'entry', label: 'VERİ GİRİŞİ', icon: ICONS.Entry, roles: ['admin'] },
    { id: 'budgets', label: 'KAPASİTE & BÜTÇE', icon: ICONS.Budgets, roles: ['admin'] },
    { id: 'reports', label: 'AYLIK ANALİZ', icon: ICONS.Reports, roles: ['admin', 'viewer'] },
    { id: 'project-report', label: 'PROJE ANALİZİ', icon: <Briefcase size={16} />, roles: ['admin', 'viewer'] },
    { id: 'yearly', label: 'YILLIK FAALİYET', icon: <FileText size={16} />, roles: ['admin', 'viewer'] },
    { id: 'settings', label: 'SİSTEM AYARLARI', icon: ICONS.Settings, roles: ['admin'] },
  ];

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white gap-4">
        <Loader2 className="animate-spin text-blue-500" size={32} />
        <p className="text-[10px] font-black tracking-widest uppercase opacity-50">Sistem Hazırlanıyor...</p>
      </div>
    );
  }

  if (!userRole) return <Login onLogin={setUserRole} viewerPassword={viewerPassword} />;

  // Safety fallback for template
  const activeTemplate = templates.find(t => t.id === 'team') || templates[0] || {
    id: 'team',
    headerTitle: 'PERSONEL VE ÜRETİM ANALİZ RAPORU',
    theme: DEFAULT_THEME,
    fields: []
  };

  const currentTheme = activeTemplate.theme || DEFAULT_THEME;

  return (
    <div className="flex h-screen bg-[#f1f5f9] overflow-hidden">
      {/* PROFESSIONAL SIDEBAR (PC VERSION) */}
      <aside className="w-52 bg-[#0f172a] text-slate-400 flex flex-col flex-shrink-0 no-print border-r border-slate-800">
        <div className="h-12 flex items-center px-5 bg-[#020617] border-b border-white/5">
          <span className="font-black text-white text-[11px] tracking-widest uppercase">PROANALİZ <span className="text-blue-500">ERP</span></span>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {sidebarItems.filter(item => item.roles.includes(userRole)).map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as ViewType)}
              className={`w-full flex items-center gap-3 px-5 py-2.5 transition-all text-[11px] font-bold uppercase tracking-tighter ${
                activeView === item.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className={activeView === item.id ? 'text-white' : 'text-slate-500'}>
                {item.icon}
              </div>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        
        <div className="p-4 bg-slate-900/50 border-t border-white/5">
          <div className="flex items-center gap-2 mb-3">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
             <span className="text-[9px] font-black text-slate-500 uppercase">{userRole} MODU</span>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full py-2 bg-slate-800 hover:bg-red-900/40 text-slate-300 rounded text-[10px] font-black uppercase tracking-widest transition-colors"
          >
            GÜVENLİ ÇIKIŞ
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-12 bg-white border-b border-slate-200 flex items-center justify-between px-6 no-print shadow-sm z-10">
          <div className="flex items-center gap-4">
            <Menu size={16} className="text-slate-400" />
            <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">
              {sidebarItems.find(i => i.id === activeView)?.label}
            </h2>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-[10px] font-bold text-slate-400">
               TERMINAL ID: <span className="text-slate-900">#PA-788</span>
             </span>
             <div className="h-4 w-[1px] bg-slate-200"></div>
             <span className="text-[10px] font-bold text-slate-900 bg-slate-50 px-3 py-1 border border-slate-200 uppercase">
               {new Date().toLocaleDateString('tr-TR')}
             </span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 print:p-0">
          <div className="max-w-[1400px] mx-auto w-full">
            {activeView === 'dashboard' && <Dashboard entries={entries} budgets={budgets} teams={teams} projects={projects} theme={currentTheme} />}
            {activeView === 'entry' && <DataEntry teams={teams} projects={projects} onAddEntry={async (e) => {
              const { data } = await supabase.from('entries').insert([e]).select();
              if (data) setEntries([...entries, data[0]]);
            }} entries={entries} onDeleteEntry={async (id) => {
              await supabase.from('entries').delete().eq('id', id);
              setEntries(entries.filter(e => e.id !== id));
            }} />}
            {activeView === 'budgets' && <BudgetManager teams={teams} budgets={budgets} onAddBudget={async (b) => {
              const { data } = await supabase.from('budgets').insert([b]).select();
              if (data) setBudgets([...budgets, data[0]]);
            }} onDeleteBudget={async (id) => {
              await supabase.from('budgets').delete().eq('id', id);
              setBudgets(budgets.filter(b => b.id !== id));
            }} />}
            {activeView === 'reports' && <Reports entries={entries} budgets={budgets} teams={teams} projects={projects} template={activeTemplate} />}
            {activeView === 'yearly' && <YearlyReport entries={entries} budgets={budgets} teams={teams} projects={projects} theme={currentTheme} />}
            {activeView === 'project-report' && <ProjectReport entries={entries} budgets={budgets} teams={teams} projects={projects} theme={currentTheme} />}
            {activeView === 'settings' && (
               <SettingsView 
                  teams={teams} 
                  projects={projects} 
                  viewerPassword={viewerPassword} 
                  templates={templates} 
                  onUpdateTemplates={async (t) => {
                    setTemplates(t);
                    await supabase.from('settings').upsert({ key: 'report_template', value: JSON.stringify(t) });
                  }} 
                  onUpdateViewerPassword={async (pw) => {
                    setViewerPassword(pw);
                    await supabase.from('settings').upsert({ key: 'viewer_password', value: pw });
                  }} 
                  onAddTeam={async (name) => {
                    const { data } = await supabase.from('teams').insert({ name }).select();
                    if (data) setTeams([...teams, data[0]]);
                  }}
                  onAddProject={async (name) => {
                    const { data } = await supabase.from('projects').insert({ name }).select();
                    if (data) setProjects([...projects, data[0]]);
                  }}
                  onDeleteTeam={async (id) => {
                    await supabase.from('teams').delete().eq('id', id);
                    setTeams(teams.filter(t => t.id !== id));
                  }}
                  onDeleteProject={async (id) => {
                    await supabase.from('projects').delete().eq('id', id);
                    setProjects(projects.filter(p => p.id !== id));
                  }}
               />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;