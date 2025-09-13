import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { PointsService } from '@/services/pointsService';
import { useToast } from '@/hooks/use-toast';

export const usePoints = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get user's current points
  const {
    data: points = 0,
    isLoading: isLoadingPoints,
    error: pointsError
  } = useQuery({
    queryKey: ['user_points', user?.id],
    queryFn: () => PointsService.getUserPoints(user!.id),
    enabled: !!user,
    refetchOnWindowFocus: true,
    staleTime: 30000, // 30 seconds
  });

  // Get transaction history
  const {
    data: transactions = [],
    isLoading: isLoadingTransactions,
    error: transactionsError
  } = useQuery({
    queryKey: ['point_transactions', user?.id],
    queryFn: () => PointsService.getTransactionHistory(user!.id),
    enabled: !!user,
  });

  // Get point packages
  const {
    data: packages = [],
    isLoading: isLoadingPackages,
    error: packagesError
  } = useQuery({
    queryKey: ['point_packages'],
    queryFn: PointsService.getPointPackages,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Add points mutation
  const addPointsMutation = useMutation({
    mutationFn: async ({
      points,
      transactionType,
      description,
      referenceId
    }: {
      points: number;
      transactionType: 'purchase' | 'bonus' | 'refund';
      description: string;
      referenceId?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');
      return PointsService.addPoints(user.id, points, transactionType, description, referenceId);
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['user_points', user?.id] });
        queryClient.invalidateQueries({ queryKey: ['point_transactions', user?.id] });
        toast({
          title: "Points Added",
          description: "Your points have been successfully added to your account.",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add points",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add points",
        variant: "destructive",
      });
    }
  });

  // Create checkout session mutation
  const createCheckoutMutation = useMutation({
    mutationFn: async ({
      packageId,
      points,
      priceId
    }: {
      packageId: string;
      points: number;
      priceId: string;
    }) => {
      return PointsService.createCheckoutSession(packageId, points, priceId);
    },
    onSuccess: (result) => {
      if (result.success && result.data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = result.data.url;
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create checkout session",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create checkout session",
        variant: "destructive",
      });
    }
  });

  // Deduct points mutation
  const deductPointsMutation = useMutation({
    mutationFn: async ({
      points,
      transactionType,
      description,
      referenceId
    }: {
      points: number;
      transactionType: 'screening' | 'voice_interview';
      description: string;
      referenceId?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');
      return PointsService.deductPoints(user.id, points, transactionType, description, referenceId);
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['user_points', user?.id] });
        queryClient.invalidateQueries({ queryKey: ['point_transactions', user?.id] });
      } else {
        toast({
          title: "Insufficient Points",
          description: result.error || "You don't have enough points for this action",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to deduct points",
        variant: "destructive",
      });
    }
  });

  // Check if user has enough points
  const hasEnoughPoints = (requiredPoints: number): boolean => {
    return points >= requiredPoints;
  };

  // Calculate points needed for resume screening
  const calculateScreeningPoints = (resumeCount: number): number => {
    return PointsService.calculateScreeningPoints(resumeCount);
  };

  // Calculate points needed for voice interviews
  const calculateVoiceInterviewPoints = (interviewCount: number): number => {
    return PointsService.calculateVoiceInterviewPoints(interviewCount);
  };

  // Refresh points data
  const refreshPoints = () => {
    queryClient.invalidateQueries({ queryKey: ['user_points', user?.id] });
    queryClient.invalidateQueries({ queryKey: ['point_transactions', user?.id] });
  };

  return {
    // Data
    points,
    transactions,
    packages,
    
    // Loading states
    isLoadingPoints,
    isLoadingTransactions,
    isLoadingPackages,
    
    // Errors
    pointsError,
    transactionsError,
    packagesError,
    
    // Mutations
    addPoints: addPointsMutation.mutate,
    deductPoints: deductPointsMutation.mutate,
    createCheckout: createCheckoutMutation.mutate,
    isAddingPoints: addPointsMutation.isPending,
    isDeductingPoints: deductPointsMutation.isPending,
    isCreatingCheckout: createCheckoutMutation.isPending,
    
    // Utilities
    hasEnoughPoints,
    calculateScreeningPoints,
    calculateVoiceInterviewPoints,
    refreshPoints,
    
    // Service methods
    formatPoints: PointsService.formatPoints,
    formatPrice: PointsService.formatPrice,
    getPointsPerDollar: PointsService.getPointsPerDollar,
  };
};
