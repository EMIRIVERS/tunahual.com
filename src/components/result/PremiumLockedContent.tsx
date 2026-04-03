import { memo } from "react";

interface PremiumLockedContentProps {
  onUnlock?: () => void;
  isLoading?: boolean;
}

// Paywall removed — content is always free
export const PremiumLockedContent = memo(function PremiumLockedContent(
  _props: PremiumLockedContentProps
) {
  return null;
});
