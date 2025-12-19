
import React from 'react';
import { 
  LayoutDashboard, 
  Database, 
  Wallet, 
  Settings, 
  BarChart3, 
  Plus, 
  Trash2, 
  Users, 
  Briefcase,
  TrendingUp,
  Scale,
  Clock,
  ClipboardList
} from 'lucide-react';

export const ICONS = {
  Dashboard: <LayoutDashboard size={20} />,
  Entry: <Database size={20} />,
  Budgets: <Wallet size={20} />,
  Settings: <Settings size={20} />,
  Reports: <BarChart3 size={20} />,
  Summary: <ClipboardList size={20} />,
  Plus: <Plus size={18} />,
  Trash: <Trash2 size={18} />,
  Users: <Users size={20} />,
  Project: <Briefcase size={20} />,
  Performance: <TrendingUp size={20} />,
  Weight: <Scale size={20} />,
  Time: <Clock size={20} />
};
