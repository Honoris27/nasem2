import React, { useMemo } from 'react';
import { Team, Project, Budget, ProductionEntry, ProductionType, ReportTheme } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, Scale, Zap, DollarSign, Activity } from 'lucide-react';

interface DashboardProps {
  entries: ProductionEntry[];
  budgets: Budget[];
  teams: Team[];
  projects: Project[];
  theme: ReportTheme;
}

const Dashboard: React.FC<DashboardProps> = ({ entries, budgets, teams, projects, theme }) => {
  const stats = useMemo(() => {
    const totalKg = entries.reduce((acc, curr) => acc + curr.quantityKg, 0);
    const totalCost = budgets.reduce((acc, curr) => acc + curr.amountTL, 0);
    const totalPersonnel = budgets.reduce((acc, curr) => acc + curr.personnelCount, 0);
    const avgPerformance = totalPersonnel > 0 ? (totalKg / totalPersonnel) : 0;
    return {
      totalKg,
      totalCost,
      totalPersonnel,
      avgPerformance: avgPerformance.toFixed(1),
      costPerKg: totalKg > 0 ? (totalCost / totalKg).toFixed(2) : '0'
    };
  }, [entries, budgets]);

  const teamData = useMemo(() => teams.map(team => {
    const tEntries = entries.filter(e => e.teamId === team.id);
    const tBudgets = budgets.filter(b => b.teamId === team.id);
    const kg = tEntries.reduce((acc, curr) => acc + curr.quantityKg, 0);
    const personnel = tBudgets.reduce((acc, curr) => acc + curr.personnelCount, 0);
    return { name: team.name, perf: personnel > 0 ? Number((kg / personnel).toFixed(1)) : 0 };
  }), [entries, budgets, teams]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="TOPLAM ÜRETİM" value={stats.totalKg.toLocaleString()} unit="KG" icon={<Scale size={14} />} color={theme.secondary} />
        <StatCard title="TOPLAM MALİYET" value={stats.totalCost.toLocaleString()} unit="₺" icon={<DollarSign size={14} />} color={theme.accent} />
        <StatCard title="GENEL VERİM" value={stats.avgPerformance} unit="KG/KİŞİ" icon={<Zap size={14} />} color="#f59e0b" />
        <StatCard title="BİRİM MALİYET" value={stats.costPerKg} unit="₺/KG" icon={<Activity size={14} />} color={theme.primary} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 erp-card p-5">
           <div className="flex items-center justify-between mb-6">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ekip Verimlilik Dağılımı</h3>
             <Activity size={16} className="text-slate-300" />
           </div>
           <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={teamData}>
                 <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#f1f5f9" />
                 <XAxis dataKey="name" tick={{fontSize: 9, fontWeight: 700, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                 <YAxis tick={{fontSize: 9, fontWeight: 700, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                 <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{fontSize: '10px', fontWeight: 'bold', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                 <Bar dataKey="perf" fill={theme.secondary} radius={[2, 2, 0, 0]} barSize={24} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="erp-card p-5">
           <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Üretim Tipleri (Global)</h3>
           <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={[
                    { name: 'İmalat', value: entries.filter(e => e.type === ProductionType.IMALAT).reduce((a,c)=>a+c.quantityKg, 0) },
                    { name: 'Kaynak', value: entries.filter(e => e.type === ProductionType.KAYNAK).reduce((a,c)=>a+c.quantityKg, 0) },
                    { name: 'Temizlik', value: entries.filter(e => e.type === ProductionType.TEMIZLIK).reduce((a,c)=>a+c.quantityKg, 0) },
                   ]}
                   innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value"
                 >
                   <Cell fill={theme.imalat} />
                   <Cell fill={theme.kaynak} />
                   <Cell fill={theme.temizlik} />
                 </Pie>
                 <Tooltip />
                 <Legend iconType="circle" wrapperStyle={{fontSize: '9px', fontWeight: '800', textTransform: 'uppercase'}} />
               </PieChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, unit, icon, color }: any) => {
  return (
    <div className="erp-card p-4 flex flex-col items-start relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1 h-full" style={{ backgroundColor: color }}></div>
      <div className="text-slate-300 mb-2">{icon}</div>
      <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</span>
      <div className="flex items-baseline gap-1">
        <h4 className="text-lg font-black text-slate-900 tracking-tighter leading-none">{value}</h4>
        <span className="text-[9px] font-bold text-slate-400">{unit}</span>
      </div>
    </div>
  );
};

export default Dashboard;