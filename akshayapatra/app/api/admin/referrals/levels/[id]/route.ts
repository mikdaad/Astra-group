import { NextRequest, NextResponse } from 'next/server';
import { withPermission, AuthErrors } from '@/utils/api/withAuth';
import { createClient } from '@/utils/supabase/server';

// PUT - Update referral level
export const PUT = withPermission('REFERRALS_LEVELS_MANAGE')(async (req, context, user) => {
  try {
    const { id } = context.params;
    const body = await req.json();
    const { name, commission_percentage, is_active } = body;

    // Validation
    if (commission_percentage !== undefined && (commission_percentage < 0 || commission_percentage > 100)) {
      return AuthErrors.badRequest('Commission percentage must be between 0 and 100');
    }

    const supabase = await createClient();

    // Check if level exists
    const { data: existingLevel } = await supabase
      .from('referral_levels')
      .select('*')
      .eq('id', id)
      .single();

    if (!existingLevel) {
      return NextResponse.json(
        { error: 'Referral level not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (commission_percentage !== undefined) updateData.commission_percentage = commission_percentage;
    if (is_active !== undefined) updateData.is_active = is_active;
    updateData.updated_at = new Date().toISOString();

    // Update level
    const { data: updatedLevel, error } = await supabase
      .from('referral_levels')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating referral level:', error);
      return AuthErrors.internalError();
    }

    return NextResponse.json({ level: updatedLevel });
  } catch (error) {
    console.error('Error in PUT /api/admin/referrals/levels/[id]:', error);
    return AuthErrors.internalError();
  }
});

// DELETE - Delete referral level
export const DELETE = withPermission('REFERRALS_LEVELS_MANAGE')(async (req, context, user) => {
  try {
    const { id } = context.params;
    const supabase = await createClient();

    // Check if level exists
    const { data: existingLevel } = await supabase
      .from('referral_levels')
      .select('*')
      .eq('id', id)
      .single();

    if (!existingLevel) {
      return NextResponse.json(
        { error: 'Referral level not found' },
        { status: 404 }
      );
    }

    // Check if there are any active referrals using this level
    // This is a safety check to prevent deletion of levels in use
    const { data: activeReferrals } = await supabase
      .from('user_referrals')
      .select('id')
      .eq('level', existingLevel.level)
      .limit(1);

    if (activeReferrals && activeReferrals.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete level with active referrals. Deactivate the level instead.' },
        { status: 400 }
      );
    }

    // Delete level
    const { error } = await supabase
      .from('referral_levels')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting referral level:', error);
      return AuthErrors.internalError();
    }

    return NextResponse.json({ message: 'Referral level deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/admin/referrals/levels/[id]:', error);
    return AuthErrors.internalError();
  }
});

// GET - Get specific referral level
export const GET = withPermission('REFERRALS_VIEW')(async (req, context, user) => {
  try {
    const { id } = context.params;
    const supabase = await createClient();

    const { data: level, error } = await supabase
      .from('referral_levels')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !level) {
      return NextResponse.json(
        { error: 'Referral level not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ level });
  } catch (error) {
    console.error('Error in GET /api/admin/referrals/levels/[id]:', error);
    return AuthErrors.internalError();
  }
});