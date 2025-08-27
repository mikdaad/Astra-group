import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/utils/api/withAuth';
import { PERMISSIONS } from '@/lib/types/rbac';
import { CardService } from '@/utils/supabase/cards';

export const GET = withAuth(async (req: NextRequest, context, user) => {
    try {
      const cardService = CardService;

      // Get all cards with user profiles
      const cards = await cardService.listWithUserProfiles({});

      // Calculate statistics
      const totalCards = cards?.length || 0;
      const activeCards = cards?.filter(card => card.status === 'active').length || 0;
      const blockedCards = cards?.filter(card => card.status === 'blocked').length || 0;
      const pendingCards = cards?.filter(card => card.status === 'pending').length || 0;
      const totalBalance = cards?.reduce((sum, card) => sum + (card.balance || 0), 0) || 0;

      // TODO: Add these calculations when transaction data is available
      const totalTransactions = 0; // cards?.reduce((sum, card) => sum + (card.totalPaymentsMade || 0), 0) || 0;
      const monthlyTransactionVolume = 0; // TODO: Calculate based on last month's transactions
      const overdueInvoices = cards?.filter(card => card.paymentStatus === 'overdue').length || 0;
      const totalRevenue = 0; // TODO: Calculate based on commission and payments

      const stats = {
        totalCards,
        activeCards,
        blockedCards,
        pendingCards,
        totalBalance,
        totalTransactions,
        monthlyTransactionVolume,
        overdueInvoices,
        totalRevenue
      };

      return NextResponse.json(stats);
    } catch (error) {
      console.error('Error in cards stats API:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
}, { requiredPermission: PERMISSIONS.CARDS_VIEW });
