import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { GradientButton } from "@/components/premium/GradientButton";

interface LessonNavigationProps {
  onPrevious?: () => void;
  onNext?: () => void;
  onComplete?: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  isCompleted: boolean;
}

export function LessonNavigation({ onPrevious, onNext, onComplete, hasPrevious, hasNext, isCompleted }: LessonNavigationProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <GradientButton
        variant="outline"
        size="sm"
        onClick={onPrevious}
        disabled={!hasPrevious}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Previous Lesson</span>
        <span className="sm:hidden">Prev</span>
      </GradientButton>

      <GradientButton
        variant={isCompleted ? "outline" : "brand"}
        size="sm"
        onClick={onComplete}
      >
        <CheckCircle2 className="h-4 w-4" />
        {isCompleted ? "Completed" : "Mark as Completed"}
      </GradientButton>

      <GradientButton
        variant="outline"
        size="sm"
        onClick={onNext}
        disabled={!hasNext}
      >
        <span className="hidden sm:inline">Next Lesson</span>
        <span className="sm:hidden">Next</span>
        <ChevronRight className="h-4 w-4" />
      </GradientButton>
    </div>
  );
}
