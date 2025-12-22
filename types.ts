export enum ProductionType {
  IMALAT = 'İmalat',
  KAYNAK = 'Kaynak',
  TEMIZLIK = 'Temizlik'
}

export type UserRole = 'admin' | 'viewer';

export interface User {
  role: UserRole;
  username: string;
}

export interface Team {
  id: string;
  name: string;
}

export interface Project {
  id: string;
  name: string;
}

export interface ReportTheme {
  primary: string;
  secondary: string;
  accent: string;
  imalat: string;
  kaynak: string;
  temizlik: string;
}

export interface Budget {
  id: string;
  teamId: string;
  year: number;
  month: string;
  personnelCount: number;
  amountTL: number;
  workingDays?: number[]; // Seçilen günlerin numaraları (örn: [1, 2, 5, 6...])
}

export interface ProductionEntry {
  id: string;
  year: number;
  month: string;
  projectId: string;
  teamId: string;
  type: ProductionType;
  quantityKg: number;
}

export interface ReportField {
  id: string;
  label: string;
  visible: boolean;
}

export interface ReportTemplate {
  id: string;
  name: string;
  fields: ReportField[];
  showCharts: boolean;
  headerTitle: string;
  theme: ReportTheme;
}

export type ViewType = 'dashboard' | 'entry' | 'budgets' | 'settings' | 'reports' | 'yearly' | 'project-report';

export const MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

export const YEARS = Array.from({ length: 26 }, (_, i) => 2025 + i);

// Günlük standart çalışma saati
export const DAILY_WORKING_HOURS = 7.5;
// Aylık standart çalışma saati (30 gün üzerinden planlama için)
export const WORKING_HOURS_PER_MONTH = 225; // 30 gün * 7.5 saat baz alındığında

export const DEFAULT_THEME: ReportTheme = {
  primary: '#0f172a', // Slate 900
  secondary: '#2563eb', // Blue 600
  accent: '#10b981', // Emerald 500
  imalat: '#3b82f6', // Blue 500
  kaynak: '#10b981', // Emerald 500
  temizlik: '#f59e0b', // Amber 500
};
