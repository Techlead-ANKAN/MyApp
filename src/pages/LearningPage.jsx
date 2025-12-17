import Card from '@/shared/components/Card'
import Button from '@/shared/components/Button'
import { GraduationCap, BookOpen, Target } from 'lucide-react'

export default function LearningPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-1">
          Learning Path
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          Track your learning milestones and master new skills
        </p>
      </div>

      {/* Coming Soon Card */}
      <Card className="min-h-[400px] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto py-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary-100 dark:bg-primary-900/30 mb-6">
            <GraduationCap className="w-10 h-10 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
            Learning Tracker Coming Soon
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Organize skills, track progress, and achieve your learning goals systematically
          </p>
          
          {/* Feature Preview */}
          <div className="space-y-3 text-left">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
              <BookOpen className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Course Tracking</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Organize and monitor your learning courses</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
              <Target className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Progress Milestones</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Set and achieve learning milestones</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
