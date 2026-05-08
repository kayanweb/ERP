/**
 * Performance Evaluations Service
 */
import { evaluationRepo } from '@/lib/repositories'
import type { EvaluationRecord } from '@/lib/repositories'

export type { EvaluationRecord }

export async function getAllEvaluations(): Promise<EvaluationRecord[]> {
  return evaluationRepo().getAll()
}

export async function getEvaluationById(id: string): Promise<EvaluationRecord | undefined> {
  return evaluationRepo().getById(id)
}

export async function getEvaluationsByEmployee(employeeId: string): Promise<EvaluationRecord[]> {
  return evaluationRepo().getByEmployee(employeeId)
}

export async function createEvaluation(
  evaluation: Omit<EvaluationRecord, 'id' | 'createdAt' | 'updatedAt' | 'overallScore'>
): Promise<EvaluationRecord> {
  const overallScore = calculateOverallScore(evaluation.categories)
  return evaluationRepo().create({ ...evaluation, overallScore })
}

export async function updateEvaluation(
  id: string,
  updates: Partial<EvaluationRecord>
): Promise<EvaluationRecord | undefined> {
  if (updates.categories) {
    updates.overallScore = calculateOverallScore(updates.categories)
  }
  return evaluationRepo().update(id, updates)
}

export async function submitEvaluation(id: string): Promise<EvaluationRecord | undefined> {
  return evaluationRepo().update(id, { status: 'submitted' })
}

export async function acknowledgeEvaluation(id: string, employeeComments?: string): Promise<EvaluationRecord | undefined> {
  return evaluationRepo().update(id, {
    status: 'acknowledged',
    acknowledgedAt: new Date().toISOString(),
    employeeComments,
  })
}

export async function deleteEvaluation(id: string): Promise<void> {
  return evaluationRepo().delete(id)
}

export function calculateOverallScore(
  categories: { category: string; score: number; weight: number }[]
): number {
  const totalWeight = categories.reduce((sum, c) => sum + c.weight, 0)
  if (totalWeight === 0) return 0
  
  const weightedSum = categories.reduce((sum, c) => sum + (c.score * c.weight), 0)
  return Math.round((weightedSum / totalWeight) * 10) / 10
}

export function getScoreLabel(score: number): { en: string; ar: string; color: string } {
  if (score >= 4.5) return { en: 'Excellent', ar: 'ممتاز', color: 'green' }
  if (score >= 3.5) return { en: 'Very Good', ar: 'جيد جداً', color: 'blue' }
  if (score >= 2.5) return { en: 'Good', ar: 'جيد', color: 'yellow' }
  if (score >= 1.5) return { en: 'Satisfactory', ar: 'مقبول', color: 'orange' }
  return { en: 'Needs Improvement', ar: 'يحتاج تحسين', color: 'red' }
}

export const DEFAULT_CATEGORIES = [
  { category: 'Clinical Skills', categoryAr: 'المهارات السريرية', weight: 25 },
  { category: 'Communication', categoryAr: 'التواصل', weight: 20 },
  { category: 'Teamwork', categoryAr: 'العمل الجماعي', weight: 15 },
  { category: 'Professionalism', categoryAr: 'الاحترافية', weight: 15 },
  { category: 'Documentation', categoryAr: 'التوثيق', weight: 10 },
  { category: 'Attendance', categoryAr: 'الحضور', weight: 10 },
  { category: 'Initiative', categoryAr: 'المبادرة', weight: 5 },
]

export async function getLatestEvaluation(employeeId: string): Promise<EvaluationRecord | undefined> {
  const evaluations = await evaluationRepo().getByEmployee(employeeId)
  if (evaluations.length === 0) return undefined
  return evaluations.sort((a, b) => b.evaluationDate.localeCompare(a.evaluationDate))[0]
}

export async function getEvaluationStats(period?: string): Promise<{
  total: number
  avgScore: number
  byScoreRange: {
    excellent: number
    veryGood: number
    good: number
    satisfactory: number
    needsImprovement: number
  }
  byStatus: {
    draft: number
    submitted: number
    acknowledged: number
  }
}> {
  let evaluations = await evaluationRepo().getAll()
  
  if (period) {
    evaluations = evaluations.filter(e => e.period === period)
  }
  
  const totalScore = evaluations.reduce((sum, e) => sum + e.overallScore, 0)
  
  return {
    total: evaluations.length,
    avgScore: evaluations.length > 0 ? Math.round((totalScore / evaluations.length) * 10) / 10 : 0,
    byScoreRange: {
      excellent: evaluations.filter(e => e.overallScore >= 4.5).length,
      veryGood: evaluations.filter(e => e.overallScore >= 3.5 && e.overallScore < 4.5).length,
      good: evaluations.filter(e => e.overallScore >= 2.5 && e.overallScore < 3.5).length,
      satisfactory: evaluations.filter(e => e.overallScore >= 1.5 && e.overallScore < 2.5).length,
      needsImprovement: evaluations.filter(e => e.overallScore < 1.5).length,
    },
    byStatus: {
      draft: evaluations.filter(e => e.status === 'draft').length,
      submitted: evaluations.filter(e => e.status === 'submitted').length,
      acknowledged: evaluations.filter(e => e.status === 'acknowledged').length,
    },
  }
}

export async function getEmployeePerformanceTrend(employeeId: string): Promise<{
  period: string
  score: number
}[]> {
  const evaluations = await evaluationRepo().getByEmployee(employeeId)
  return evaluations
    .sort((a, b) => a.period.localeCompare(b.period))
    .map(e => ({
      period: e.period,
      score: e.overallScore,
    }))
}
