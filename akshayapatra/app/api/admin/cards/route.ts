import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/utils/api/withAuth'
import { PERMISSIONS } from '@/lib/types/rbac'
import { CardService } from '@/utils/supabase/cards'

// GET /api/admin/cards - List cards with user profiles
export const GET = withAuth(async (req: NextRequest, context, user) => {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')
    const schemeId = searchParams.get('schemeId')

    const filters: any = {}
    if (userId) filters.userId = userId
    if (status && status !== 'all') filters.status = status
    if (schemeId) filters.schemeId = schemeId

    const cards = await CardService.listWithUserProfiles(filters)
    return NextResponse.json({
      success: true,
      data: cards
    })
  } catch (error) {
    console.error('Error fetching cards:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cards' },
      { status: 500 }
    )
  }
}, { requiredPermission: PERMISSIONS.CARDS_VIEW })

// POST /api/admin/cards - Create card
export const POST = withAuth(async (req: NextRequest, context, user) => {
  try {
    const cardData = await req.json()

    if (!cardData?.userId || !cardData?.cardholderName || !cardData?.phoneNumber) {
      return NextResponse.json(
        { error: 'Required fields missing: userId, cardholderName, phoneNumber' },
        { status: 400 }
      )
    }

    const created = await CardService.create(cardData)

    if (!created) {
      return NextResponse.json(
        { error: 'Failed to create card' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: created
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating card:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}, { requiredPermission: PERMISSIONS.CARDS_EDIT })
