import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/utils/api/withAuth'
import { PERMISSIONS } from '@/lib/types/rbac'
import { CardService } from '@/utils/supabase/cards'

// GET /api/admin/cards/[id] - Get single card with user profile
export const GET = withAuth(async (req: NextRequest, context, user) => {
  try {
    const { id } = context.params

    const card = await CardService.getWithUserProfile(id)
    if (!card) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: card
    })
  } catch (error) {
    console.error('Error fetching card:', error)
    return NextResponse.json(
      { error: 'Failed to fetch card' },
      { status: 500 }
    )
  }
}, { requiredPermission: PERMISSIONS.CARDS_VIEW })

// PATCH /api/admin/cards/[id] - Update card
export const PATCH = withAuth(async (req: NextRequest, context, user) => {
  try {
    const { id } = context.params
    const updates = await req.json()

    updates.updated_at = new Date().toISOString()

    const updated = await CardService.update(id, updates)
    if (!updated) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Error updating card:', error)
    return NextResponse.json(
      { error: 'Failed to update card' },
      { status: 500 }
    )
  }
}, { requiredPermission: PERMISSIONS.CARDS_EDIT })

// DELETE /api/admin/cards/[id] - Delete card
export const DELETE = withAuth(async (req: NextRequest, context, user) => {
  try {
    const { id } = context.params

    const deleted = await CardService.delete(id)
    if (!deleted) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, message: 'Card deleted successfully' })
  } catch (error) {
    console.error('Error deleting card:', error)
    return NextResponse.json(
      { error: 'Failed to delete card' },
      { status: 500 }
    )
  }
}, { requiredPermission: PERMISSIONS.CARDS_EDIT })
