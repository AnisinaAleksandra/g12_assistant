"use client"

import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

interface FollowUpQuestionsProps {
  questions: string[]
  onQuestionClick: (question: string) => void
}

export function FollowUpQuestions({ questions, onQuestionClick }: FollowUpQuestionsProps) {
  if (questions.length === 0) return null

  return (
    <div className="flex flex-col gap-3 mb-6 animate-slide-in-up">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <p className="text-sm text-muted-foreground font-medium">Suggested questions:</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {questions.map((question, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onQuestionClick(question)}
            className="text-xs h-auto py-2 px-3 hover:bg-primary transition-all hover:scale-105 hover:shadow-md"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {question}
          </Button>
        ))}
      </div>
    </div>
  )
}
