import Card from '@/shared/components/Card'
import Button from '@/shared/components/Button'
import { GraduationCap, Plus } from 'lucide-react'

export default function LearningPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
            Learning Path
          </h2>
          <p className="text-gray-400">
            Track your learning milestones and master new skills
          </p>
        </div>
        <Button variant="primary" className="inline-flex items-center space-x-2 shadow-lg shadow-accent-purple/30">
          <Plus className="w-5 h-5" />
          <span>Add Milestone</span>
        </Button>
      </div>

      {/* Learning Component - To be implemented */}
      <Card className="backdrop-blur-2xl bg-white/[0.02]">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-purple/20 to-accent-blue/20 mb-6">
              <GraduationCap className="w-10 h-10 text-accent-purple" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              Learning Tracker Coming Soon
            </h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Organize skills and track your learning progress systematically
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
