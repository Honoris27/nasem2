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
}

export type ViewType = 'dashboard' | 'entry' | 'budgets' | 'settings' | 'reports' | 'yearly' | 'project-report';

export const MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

export const YEARS = Array.from({ length: 26 }, (_, i) => 2025 + i);

// Günlük standart çalışma saati (Kullanıcı isteği üzerine 7.5 saat olarak güncellendi)
export const DAILY_WORKING_HOURS = 7.5;
export const WORKING_HOURS_PER_MONTH = 165; // 22 gün * 7.5 saat baz alındığında