import { memo } from "react";
import { Check } from "lucide-react";

interface FormProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export const FormProgressBar = memo(function FormProgressBar({
  currentStep,
  totalSteps,
}: FormProgressBarProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          {currentStep > 1 && (
            <span className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
              <Check className="w-3 h-3 text-primary animate-checkmark" />
            </span>
          )}
          Paso {currentStep} de {totalSteps}
        </span>
        <span className="text-primary font-medium">
          ¡Ya casi tienes tu lectura!
        </span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full progress-shimmer rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
});
