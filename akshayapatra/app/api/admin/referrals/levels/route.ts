import { NextRequest, NextResponse } from 'next/server';
import { withPermission, AuthErrors } from '@/utils/api/withAuth';
import { createClient } from '@/utils/supabase/server';

// GET - Fetch all referral levels
export const GET = withPermission('REFERRALS_VIEW')(async (req, context, user) => {
  try {
    const supabase = await createClient();
    
    const { data: levels, error } = await supabase
      .from('referral_levels')
      .select('*')
      .order('level', { ascending: true });

    if (error) {
      console.error('Error fetching referral levels:', error);
      return AuthErrors.internalError();
    }

    return NextResponse.json({ levels });
  } catch (error) {
    console.error('Error in GET /api/admin/referrals/levels:', error);
    return AuthErrors.internalError();
  }
});

// POST - Create new referral level
export const POST = withPermission('REFERRALS_LEVELS_MANAGE')(async (req, context, user) => {
  try {
    const body = await req.json();
    const { level, name, commission_percentage, is_active } = body;

    // Validation
    if (!level || !name || commission_percentage === undefined) {
      return AuthErrors.badRequest('Missing required fields: level, name, commission_percentage');
    }

    if (level < 1 || level > 4) {
      return AuthErrors.badRequest('Level must be between 1 and 4');
    }

    if (commission_percentage < 0 || commission_percentage > 100) {
      return AuthErrors.badRequest('Commission percentage must be between 0 and 100');
    }

    const supabase = await createClient();

    // Check if level already exists
    const { data: existingLevel } = await supabase
      .from('referral_levels')
      .select('id')
      .eq('level', level)
      .single();

    if (existingLevel) {
      return NextResponse.json(
        { error: `Level ${level} already exists` },
        { status: 409 }
      );
    }

    // Check maximum levels (4)
    const { data: allLevels } = await supabase
      .from('referral_levels')
      .select('id');

    if (allLevels && allLevels.length >= 4) {
      return AuthErrors.badRequest('Maximum of 4 referral levels allowed');
    }

    // Create new level
    const { data: newLevel, error } = await supabase
      .from('referral_levels')
      .insert([{
        level,
        name: name.trim(),
        commission_percentage,
        is_active: is_active ?? true
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating referral level:', error);
      return AuthErrors.internalError();
    }

    return NextResponse.json({ level: newLevel }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/admin/referrals/levels:', error);
    return AuthErrors.internalError();
  }
});