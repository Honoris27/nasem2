import React, { useState, useEffect } from 'react';
import { 
  Team, Project, Budget, ProductionEntry, ViewType, UserRole, ReportTemplate
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
import { LogOut, User, ChevronRight, Loader2, FileText, Briefcase } from 'lucide-react';

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

  // Verileri Supabase'den çek
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
        if (templateSetting) setTemplates(JSON.parse(templateSetting.value));
        else {
          setTemplates([{
            id: 'team',
            name: 'Standart ERP Şablonu',
            showCharts: true,
            headerTitle: 'PERSONEL VE ÜRETİM ANALİZ RAPORU',
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

  const addEntry = async (entry: Omit<ProductionEntry, 'id'>) => {
    const { data } = await supabase.from('entries').insert([entry]).select();
    if (data) setEntries([...entries, data[0]]);
  };

  const deleteEntry = async (id: string) => {
    const { error } = await supabase.from('entries').delete().eq('id', id);
    if (!error) setEntries(entries.filter(e => e.id !== id));
  };

  const addBudget = async (budget: Omit<Budget, 'id'>) => {
    const { data } = await supabase.from('budgets').insert([budget]).select();
    if (data) setBudgets([...budgets, data[0]]);
  };

  const deleteBudget = async (id: string) => {
    const { error } = await supabase.from('budgets').delete().eq('id', id);
    if (!error) setBudgets(budgets.filter(b => b.id !== id));
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Genel Bakış', icon: ICONS.Dashboard, roles: ['admin', 'viewer'] },
    { id: 'entry', label: 'Üretim Girişleri', icon: ICONS.Entry, roles: ['admin'] },
    { id: 'budgets', label: 'Bütçe & Personel', icon: ICONS.Budgets, roles: ['admin'] },
    { id: 'reports', label: 'Aylık Performans', icon: ICONS.Reports, roles: ['admin', 'viewer'] },
    { id: 'project-report', label: 'Proje Bazlı Rapor', icon: <Briefcase size={20} />, roles: ['admin', 'viewer'] },
    { id: 'yearly', label: 'Yıllık Faaliyet', icon: <FileText size={20} />, roles: ['admin', 'viewer'] },
    { id: 'settings', label: 'Sistem Ayarları', icon: ICONS.Settings, roles: ['admin'] },
  ];

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white gap-4">
        <Loader2 className="animate-spin text-blue-500" size={48} />
        <p className="text-sm font-bold tracking-widest uppercase">ERP Veritabanı Bağlanıyor...</p>
      </div>
    );
  }

  if (!userRole) return <Login onLogin={setUserRole} viewerPassword={viewerPassword} />;

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden text-slate-700">
      <aside className="w-60 bg-slate-800 text-slate-300 flex flex-col flex-shrink-0 no-print border-r border-slate-700">
        <div className="h-14 flex items-center px-6 bg-slate-900 border-b border-slate-700">
          <span className="font-black text-white tracking-widest text-sm">PRO ANALİZ <span className="text-blue-500">ERP</span></span>
        </div>

        <nav className="flex-1 py-2 overflow-y-auto">
          {sidebarItems.filter(item => item.roles.includes(userRole)).map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as ViewType)}
              className={`w-full flex items-center justify-between px-6 py-2.5 transition-all ${
                activeView === item.id 
                  ? 'bg-blue-600 text-white' 
                  : 'hover:bg-slate-700 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3 text-[13px] font-semibold">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {activeView === item.id && <ChevronRight size={12} />}
            </button>
          ))}
        </nav>
        
        <div className="p-4 border-t border-slate-700 bg-slate-900/30">
          <div className="flex items-center gap-2 px-2 py-2 mb-2">
            <User size={14} className="text-slate-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider">{userRole} MODU</span>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full py-2 bg-slate-700 hover:bg-red-900/40 text-slate-300 rounded text-[11px] font-bold"
          >
            OTURUMU KAPAT
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-8 no-print z-10">
          <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            {sidebarItems.find(i => i.id === activeView)?.label}
          </h2>
          <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded border border-slate-200">
            SİSTEM TARİHİ: {new Date().toLocaleDateString('tr-TR')}
          </span>
        </header>

        <div className="flex-1 overflow-y-auto p-6 max-w-full print:p-0">
          {activeView === 'dashboard' && <Dashboard entries={entries} budgets={budgets} teams={teams} projects={projects} />}
          {activeView === 'entry' && <DataEntry teams={teams} projects={projects} onAddEntry={addEntry} entries={entries} onDeleteEntry={deleteEntry} />}
          {activeView === 'budgets' && <BudgetManager teams={teams} budgets={budgets} onAddBudget={addBudget} onDeleteBudget={deleteBudget} />}
          {activeView === 'reports' && <Reports entries={entries} budgets={budgets} teams={teams} projects={projects} template={templates[0]} />}
          {activeView === 'yearly' && <YearlyReport entries={entries} budgets={budgets} teams={teams} projects={projects} />}
          {activeView === 'project-report' && <ProjectReport entries={entries} budgets={budgets} teams={teams} projects={projects} />}
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
      </main>
    </div>
  );
};

export default App;