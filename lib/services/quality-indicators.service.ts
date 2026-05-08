/**
 * Quality Indicators Service
 */
import { qualityIndicatorRepo } from '@/lib/repositories'
import type { QualityIndicatorRecord } from '@/lib/repositories'

export type { QualityIndicatorRecord }

export async function getAllIndicators(): Promise<QualityIndicatorRecord[]> {
  return qualityIndicatorRepo().getAll()
}

export async function getIndicatorById(id: string): Promise<QualityIndicatorRecord | undefined> {
  return qualityIndicatorRepo().getById(id)
}

export async function getIndicatorsByCategory(category: string): Promise<QualityIndicatorRecord[]> {
  return qualityIndicatorRepo().getByCategory(category)
}

export async function getIndicatorsByPeriod(period: string): Promise<QualityIndicatorRecord[]> {
  return qualityIndicatorRepo().getByPeriod(period)
}

export async function createIndicator(
  indicator: Omit<QualityIndicatorRecord, 'id' | 'createdAt' | 'updatedAt'>
): Promise<QualityIndicatorRecord> {
  return qualityIndicatorRepo().create(indicator)
}

export async function updateIndicator(
  id: string,
  updates: Partial<QualityIndicatorRecord>
): Promise<QualityIndicatorRecord | undefined> {
  return qualityIndicatorRepo().update(id, updates)
}

export async function deleteIndicator(id: string): Promise<void> {
  return qualityIndicatorRepo().delete(id)
}

export function getCategoryLabel(category: QualityIndicatorRecord['category']): { en: string; ar: string } {
  const labels: Record<string, { en: string; ar: string }> = {
    patient_safety: { en: 'Patient Safety', ar: 'سلامة المرضى' },
    clinical: { en: 'Clinical', ar: 'سريري' },
    operational: { en: 'Operational', ar: 'تشغيلي' },
    staff: { en: 'Staff', ar: 'الطاقم' },
  }
  return labels[category]
}

export function getTrendLabel(trend: QualityIndicatorRecord['trend']): { en: string; ar: string; color: string; icon: string } {
  const labels: Record<string, { en: string; ar: string; color: string; icon: string }> = {
    up: { en: 'Improving', ar: 'يتحسن', color: 'green', icon: '↑' },
    down: { en: 'Declining', ar: 'يتراجع', color: 'red', icon: '↓' },
    stable: { en: 'Stable', ar: 'مستقر', color: 'gray', icon: '→' },
  }
  return labels[trend]
}

export function calculatePerformance(value: number, target: number): {
  percentage: number
  status: 'achieved' | 'near' | 'below'
  color: string
} {
  const percentage = target > 0 ? Math.round((value / target) * 100) : 0
  
  if (percentage >= 100) {
    return { percentage, status: 'achieved', color: 'green' }
  }
  if (percentage >= 80) {
    return { percentage, status: 'near', color: 'yellow' }
  }
  return { percentage, status: 'below', color: 'red' }
}

// Default quality indicators for a nursing unit
export const DEFAULT_INDICATORS = [
  // Patient Safety
  { name: 'Fall Rate', nameAr: 'معدل السقوط', category: 'patient_safety' as const, unit: 'per 1000 patient days', target: 2.5 },
  { name: 'Pressure Ulcer Rate', nameAr: 'معدل قرح الضغط', category: 'patient_safety' as const, unit: 'per 1000 patient days', target: 1.0 },
  { name: 'Medication Errors', nameAr: 'أخطاء الأدوية', category: 'patient_safety' as const, unit: 'per 1000 doses', target: 0.5 },
  { name: 'Hospital Acquired Infections', nameAr: 'العدوى المكتسبة', category: 'patient_safety' as const, unit: '%', target: 2.0 },
  
  // Clinical
  { name: 'Hand Hygiene Compliance', nameAr: 'الالتزام بنظافة اليدين', category: 'clinical' as const, unit: '%', target: 95 },
  { name: 'Pain Assessment Compliance', nameAr: 'الالتزام بتقييم الألم', category: 'clinical' as const, unit: '%', target: 100 },
  { name: 'Vital Signs Documentation', nameAr: 'توثيق العلامات الحيوية', category: 'clinical' as const, unit: '%', target: 100 },
  { name: 'Patient Satisfaction', nameAr: 'رضا المرضى', category: 'clinical' as const, unit: '%', target: 90 },
  
  // Operational
  { name: 'Bed Occupancy Rate', nameAr: 'معدل إشغال الأسرة', category: 'operational' as const, unit: '%', target: 85 },
  { name: 'Average Length of Stay', nameAr: 'متوسط مدة الإقامة', category: 'operational' as const, unit: 'days', target: 4.5 },
  { name: 'Discharge Before Noon', nameAr: 'الخروج قبل الظهر', category: 'operational' as const, unit: '%', target: 50 },
  
  // Staff
  { name: 'Nurse-Patient Ratio', nameAr: 'نسبة الممرض للمرضى', category: 'staff' as const, unit: 'ratio', target: 4 },
  { name: 'Staff Satisfaction', nameAr: 'رضا الموظفين', category: 'staff' as const, unit: '%', target: 80 },
  { name: 'Training Compliance', nameAr: 'الالتزام بالتدريب', category: 'staff' as const, unit: '%', target: 100 },
  { name: 'Overtime Hours', nameAr: 'ساعات العمل الإضافي', category: 'staff' as const, unit: 'hours/month', target: 20 },
]

export async function getQualityDashboard(period: string): Promise<{
  overall: {
    achieved: number
    near: number
    below: number
    total: number
  }
  byCategory: Record<string, {
    achieved: number
    total: number
    avgPerformance: number
  }>
  indicators: (QualityIndicatorRecord & { performance: ReturnType<typeof calculatePerformance> })[]
}> {
  const indicators = await qualityIndicatorRepo().getByPeriod(period)
  
  const withPerformance = indicators.map(ind => ({
    ...ind,
    performance: calculatePerformance(ind.value, ind.target),
  }))
  
  const overall = {
    achieved: withPerformance.filter(i => i.performance.status === 'achieved').length,
    near: withPerformance.filter(i => i.performance.status === 'near').length,
    below: withPerformance.filter(i => i.performance.status === 'below').length,
    total: withPerformance.length,
  }
  
  const byCategory: Record<string, { achieved: number; total: number; avgPerformance: number }> = {}
  
  const categories = ['patient_safety', 'clinical', 'operational', 'staff']
  categories.forEach(cat => {
    const catIndicators = withPerformance.filter(i => i.category === cat)
    if (catIndicators.length > 0) {
      byCategory[cat] = {
        achieved: catIndicators.filter(i => i.performance.status === 'achieved').length,
        total: catIndicators.length,
        avgPerformance: Math.round(
          catIndicators.reduce((sum, i) => sum + i.performance.percentage, 0) / catIndicators.length
        ),
      }
    }
  })
  
  return { overall, byCategory, indicators: withPerformance }
}
