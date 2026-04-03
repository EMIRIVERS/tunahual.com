interface PremiumAccessState {
  isPremium: boolean;
  isLoading: boolean;
  email: string | null;
}

export function usePremiumAccess(kinSlug: string, userEmail?: string) {
  const state: PremiumAccessState = {
    isPremium: true,
    isLoading: false,
    email: userEmail || null,
  };

  const checkAccess = async (_email: string) => {};

  const createFreeAccess = async (_email: string) => {};

  const getPaymentLink = () => '';

  return {
    ...state,
    checkAccess,
    createFreeAccess,
    getPaymentLink,
  };
}
