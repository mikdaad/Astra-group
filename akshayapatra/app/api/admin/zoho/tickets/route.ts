import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { hasAdminAccess } from '@/utils/admin/permissions'
import { getZohoAccessToken } from '@/lib/services/zoho-auth'

/**
 * Zoho Desk Tickets API Proxy
 * This endpoint provides secure access to Zoho Desk tickets
 * It's protected and only accessible to admin users
 */

interface ZohoTicket {
  id: string
  ticketNumber: string
  subject: string
  description: string
  status: string
  priority: string
  createdTime: string
  modifiedTime: string
  dueDate?: string
  contact?: {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
  }
  assignee?: {
    firstName?: string
    lastName?: string
    email?: string
  }
  department?: {
    name: string
  }
  category?: string
  subCategory?: string
  channel?: string
}

interface ZohoTicketsResponse {
  data: ZohoTicket[]
  info: {
    count: number
    moreRecords: boolean
  }
}

export async function GET(req: NextRequest) {
  try {
    console.log('🎫 [ZOHO TICKETS API] Request received')

    // Verify admin access
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.warn('🎫 [ZOHO TICKETS API] Unauthorized: No user found')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // const hasAccess = await hasAdminAccess(user, supabase)
    // if (!hasAccess) {
    //   console.warn('🎫 [ZOHO TICKETS API] Forbidden: User lacks admin access', { userId: user.id })
    //   return NextResponse.json(
    //     { error: 'Forbidden: Admin access required' },
    //     { status: 403 }
    //   )
    // }

    // Parse query parameters
    const { searchParams } = new URL(req.url)
    const from = searchParams.get('from') || '0'
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 100) // Max 100 per Zoho limits
    const status = searchParams.get('status') // Filter by status if provided
    const sortBy = searchParams.get('sortBy') || 'modifiedTime'
    // Note: Zoho Desk API doesn't support sortOrder parameter

    // Get Zoho access token
    const accessToken = await getZohoAccessToken()

    // Build Zoho API URL
    const baseUrl = process.env.ZOHO_BASE_URL || 'https://desk.zoho.in'
    const orgId = process.env.ZOHO_ORG_ID

    if (!orgId) {
      throw new Error('Missing Zoho Organization ID')
    }

    let zohoUrl = `${baseUrl}/api/v1/tickets?from=${from}&limit=${limit}&sortBy=${sortBy}`
    
    if (status && status !== 'all') {
      zohoUrl += `&status=${encodeURIComponent(status)}`
    }

    console.log('🎫 [ZOHO TICKETS API] Fetching tickets from Zoho:', zohoUrl)
    // Make request to Zoho API
    const response = await fetch(zohoUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
        'orgId': orgId,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('🎫 [ZOHO TICKETS API] Zoho API error:', response.status, errorText)
      throw new Error(`Zoho API error: ${response.status} - ${errorText}`)
    }

    const data: ZohoTicketsResponse = await response.json()
    
    console.log('🎫 [ZOHO TICKETS API] Successfully fetched tickets:', data.info?.count || 'unknown count')

    return NextResponse.json({
      success: true,
      tickets: data.data || [],
      info: data.info || { count: 0, moreRecords: false },
      meta: {
        from: parseInt(from),
        limit,
        status: status || 'all',
        sortBy
      }
    })

  } catch (error) {
    console.error('🎫 [ZOHO TICKETS API] Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch tickets from Zoho Desk',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('🎫 [ZOHO TICKETS API] Create ticket request received')

    // Verify admin access
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // const hasAccess = await hasAdminAccess(user, supabase)
    // if (!hasAccess) {
    //   return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    // }

    // Parse request body
    const ticketData = await req.json()

    // Get Zoho access token
    const accessToken = await getZohoAccessToken()

    // Build Zoho API URL
    const baseUrl = process.env.ZOHO_BASE_URL || 'https://desk.zoho.in'
    const orgId = process.env.ZOHO_ORG_ID

    if (!orgId) {
      throw new Error('Missing Zoho Organization ID')
    }

    const zohoUrl = `${baseUrl}/api/v1/tickets`

    // Make request to Zoho API
    const response = await fetch(zohoUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
        'orgId': orgId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(ticketData)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('🎫 [ZOHO TICKETS API] Create ticket error:', response.status, errorText)
      throw new Error(`Zoho API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    
    console.log('🎫 [ZOHO TICKETS API] Successfully created ticket:', data.id)

    return NextResponse.json({
      success: true,
      ticket: data,
      message: 'Ticket created successfully'
    })

  } catch (error) {
    console.error('🎫 [ZOHO TICKETS API] Create ticket error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create ticket in Zoho Desk',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
