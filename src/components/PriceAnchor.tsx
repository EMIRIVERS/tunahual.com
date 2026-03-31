import { memo } from "react";
import { Gift, Check } from "lucide-react";

export const PriceAnchor = memo(function PriceAnchor() {
  return (
    <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-full bg-accent/50 border border-primary/20">
      <Gift className="w-4 h-4 text-primary shrink-0" />
      <span className="text-sm text-foreground">
        Lectura valorada en{" "}
        <span className="line-through text-muted-foreground">$47</span>
        {" "}
        <span className="font-bold text-primary">GRATIS</span>
      </span>
      <Check className="w-4 h-4 text-primary shrink-0" />
    </div>
  );
});
