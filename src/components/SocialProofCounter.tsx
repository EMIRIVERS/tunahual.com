import { memo, useEffect, useState } from "react";
import { Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SocialProofCounterProps {
  baseCount: number;
}

export const SocialProofCounter = memo(function SocialProofCounter({
  baseCount
}: SocialProofCounterProps) {
  const [displayCount, setDisplayCount] = useState(baseCount);
  const [isVisible, setIsVisible] = useState(false);

  // Fetch real count from Supabase, then animate
  useEffect(() => {
    setIsVisible(true);

    let cancelled = false;

    const fetchAndAnimate = async () => {
      let targetCount = baseCount;

      const { count, error } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true });

      if (!cancelled) {
        if (!error && count !== null) {
          targetCount = count + 10000;
        }

        const duration = 1500;
        const steps = 30;
        const increment = targetCount / steps;
        let current = 0;

        const timer = setInterval(() => {
          current += increment;
          if (current >= targetCount) {
            setDisplayCount(targetCount);
            clearInterval(timer);
          } else {
            setDisplayCount(Math.floor(current));
          }
        }, duration / steps);

        return () => clearInterval(timer);
      }
    };

    const cleanup = fetchAndAnimate();

    return () => {
      cancelled = true;
      cleanup.then((fn) => fn && fn());
    };
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
