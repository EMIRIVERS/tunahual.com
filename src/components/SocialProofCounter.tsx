import { memo, useEffect, useState } from "react";
import { Users } from "lucide-react";

interface SocialProofCounterProps {
  baseCount: number;
}

export const SocialProofCounter = memo(function SocialProofCounter({ 
  baseCount 
}: SocialProofCounterProps) {
  const [displayCount, setDisplayCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Animate counter on mount
  useEffect(() => {
    setIsVisible(true);
    const duration = 1500;
    const steps = 30;
    const increment = baseCount / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= baseCount) {
        setDisplayCount(baseCount);
        clearInterval(timer);
      } else {
        setDisplayCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [baseCount]);

  const formattedCount = displayCount.toLocaleString('es-ES');

  return (
    <div 
      className={`flex items-center justify-center gap-2 transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      <Users className="w-4 h-4 text-primary" />
      <span className="text-sm text-muted-foreground">
        <span className="font-semibold text-foreground tabular-nums">
          {formattedCount}+
        </span>{" "}
        personas han calculado su Nahual
      </span>
    </div>
  );
});
