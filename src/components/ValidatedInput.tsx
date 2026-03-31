import { memo, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  isValid: boolean;
  showValidation: boolean;
  icon?: React.ReactNode;
}

export const ValidatedInput = memo(function ValidatedInput({
  isValid,
  showValidation,
  icon,
  className,
  ...props
}: ValidatedInputProps) {
  const [showCheck, setShowCheck] = useState(false);

  useEffect(() => {
    if (showValidation && isValid) {
      setShowCheck(true);
    } else {
      setShowCheck(false);
    }
  }, [showValidation, isValid]);

  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-muted-foreground">
          {icon}
        </div>
      )}
      <Input
        {...props}
        className={cn(
          icon ? "pl-10" : "",
          showCheck ? "pr-10 border-primary/50" : "",
          "rounded-full border-input bg-background transition-all focus:shadow-md",
          className
        )}
      />
      {showCheck && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
          <Check className="w-3 h-3 text-primary animate-checkmark" />
        </div>
      )}
    </div>
  );
});
