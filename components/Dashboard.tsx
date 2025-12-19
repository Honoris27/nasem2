
import React, { useMemo } from 'react';
import { Team, Project, Budget, ProductionEntry, ProductionType } from '../types';
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
}

const Dashboard: React.FC<DashboardProps> = ({ entries, budgets, teams, projects }) => {
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

  const COLORS = ['#2563eb', '#059669', '#d97706'];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="TOPLAM ÜRETİM" value={`${stats.totalKg.toLocaleString()}`} unit="KG" icon={<Scale size={16} />} color="blue" />
        <StatCard title="TOPLAM MALİYET" value={`${stats.totalCost.toLocaleString()}`} unit="₺" icon={<DollarSign size={16} />} color="emerald" />
        <StatCard title="GENEL VERİM" value={stats.avgPerformance} unit="KG/KİŞİ" icon={<Zap size={16} />} color="amber" />
        <StatCard title="BİRİM MALİYET" value={stats.costPerKg} unit="₺/KG" icon={<Activity size={16} />} color="slate" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Ekip Performans Kıyaslama</h3>
            <TrendingUp size={16} className="text-slate-400" />
          </div>
          <div className="p-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <Tooltip 
                  contentStyle={{ border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}
                  cursor={{fill: '#f1f5f9'}}
                />
                <Bar dataKey="perf" name="Verim (kg/kişi)" fill="#2563eb" radius={[2, 2, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Üretim Tipleri</h3>
          </div>
          <div className="p-6 h-80 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'İmalat', value: entries.filter(e => e.type === ProductionType.IMALAT).reduce((a,c)=>a+c.quantityKg, 0) },
                    { name: 'Kaynak', value: entries.filter(e => e.type === ProductionType.KAYNAK).reduce((a,c)=>a+c.quantityKg, 0) },
                    { name: 'Temizlik', value: entries.filter(e => e.type === ProductionType.TEMIZLIK).reduce((a,c)=>a+c.quantityKg, 0) },
                  ]}
                  cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={4} dataKey="value" stroke="#fff" strokeWidth={2}
                >
                  {COLORS.map((c, i) => <Cell key={i} fill={c} />)}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="square" wrapperStyle={{fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, unit, icon, color }: any) => {
  const colors: any = {
    blue: 'text-blue-600',
    emerald: 'text-emerald-600',
    amber: 'text-amber-600',
    slate: 'text-slate-600'
  };
  
  return (
    <div className="bg-white p-5 border border-slate-200 rounded shadow-sm flex flex-col items-center text-center">
      <div className={`mb-2 text-slate-300`}>{icon}</div>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</p>
      <div className="flex items-baseline gap-1">
        <h4 className={`text-xl font-bold ${colors[color]} tracking-tight`}>{value}</h4>
        <span className="text-[10px] font-bold text-slate-400">{unit}</span>
      </div>
    </div>
  );
};

export default Dashboard;
