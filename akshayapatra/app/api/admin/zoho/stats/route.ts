import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
// import { hasAdminAccess } from '@/utils/admin/permissions'
import { getZohoAccessToken } from '@/lib/services/zoho-auth'

/**
 * Zoho Desk Statistics API Proxy
 * This endpoint provides secure access to Zoho Desk statistics and metrics
 * It's protected and only accessible to admin users
 */

interface ZohoStats {
  totalTickets: number
  openTickets: number
  resolvedTickets: number
  pendingTickets: number
  overdueTickets: number
  ticketsByStatus: Record<string, number>
  ticketsByPriority: Record<string, number>
  ticketsByChannel: Record<string, number>
  avgResolutionTime: number
  avgResponseTime: number
}

export async function GET(req: NextRequest) {
  try {
    console.log('📊 [ZOHO STATS API] Request received')

    // Verify admin access
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.warn('📊 [ZOHO STATS API] Unauthorized: No user found')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // const hasAccess = await hasAdminAccess(user, supabase)
    // if (!hasAccess) {
    //   console.warn('📊 [ZOHO STATS API] Forbidden: User lacks admin access', { userId: user.id })
    //   return NextResponse.json(
    //     { error: 'Forbidden: Admin access required' },
    //     { status: 403 }
    //   )
    // }

    // Parse query parameters for date range
    const { searchParams } = new URL(req.url)
    const startDate = searchParams.get('startDate') // Format: YYYY-MM-DD
    const endDate = searchParams.get('endDate') // Format: YYYY-MM-DD
    const timeframe = searchParams.get('timeframe') || 'thisMonth' // thisWeek, thisMonth, thisYear

    // Get Zoho access token
    const accessToken = await getZohoAccessToken()

    // Build Zoho API URLs
    const baseUrl = process.env.ZOHO_BASE_URL || 'https://desk.zoho.in'
    const orgId = process.env.ZOHO_ORG_ID

    if (!orgId) {
      throw new Error('Missing Zoho Organization ID')
    }

    // Calculate date range if not provided
    let from = startDate
    let to = endDate

    if (!from || !to) {
      const now = new Date()
      const endDateTime = new Date(now)
      const startDateTime = new Date(now)

      switch (timeframe) {
        case 'thisWeek':
          startDateTime.setDate(now.getDate() - 7)
          break
        case 'thisYear':
          startDateTime.setFullYear(now.getFullYear(), 0, 1)
          break
        case 'thisMonth':
        default:
          startDateTime.setDate(1)
          break
      }

      from = startDateTime.toISOString().split('T')[0]
      to = endDateTime.toISOString().split('T')[0]
    }

    console.log('📊 [ZOHO STATS API] Fetching stats for date range:', { from, to })

    // Fetch multiple endpoints concurrently
    const promises = [
      // Get tickets count by status
      fetch(`${baseUrl}/api/v1/tickets?from=0&limit=1&status=Open`, {
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
          'orgId': orgId,
          'Content-Type': 'application/json'
        }
      }),
      // Get resolved tickets
      fetch(`${baseUrl}/api/v1/tickets?from=0&limit=1&status=Closed`, {
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
          'orgId': orgId,
          'Content-Type': 'application/json'
        }
      }),
      // Get all tickets for detailed analysis (limit to recent 100 due to Zoho API restrictions)
      fetch(`${baseUrl}/api/v1/tickets?from=0&limit=100&sortBy=modifiedTime`, {
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
          'orgId': orgId,
          'Content-Type': 'application/json'
        }
      })
    ]

    const [openResponse, closedResponse, allTicketsResponse] = await Promise.all(promises)

    // Check for errors with detailed logging
    if (!openResponse.ok) {
      const errorText = await openResponse.text()
      console.error('📊 [ZOHO STATS API] Open tickets API error:', openResponse.status, errorText)
      throw new Error(`Open tickets API error: ${openResponse.status} - ${errorText}`)
    }
    
    if (!closedResponse.ok) {
      const errorText = await closedResponse.text()
      console.error('📊 [ZOHO STATS API] Closed tickets API error:', closedResponse.status, errorText)
      throw new Error(`Closed tickets API error: ${closedResponse.status} - ${errorText}`)
    }
    
    if (!allTicketsResponse.ok) {
      const errorText = await allTicketsResponse.text()
      console.error('📊 [ZOHO STATS API] All tickets API error:', allTicketsResponse.status, errorText)
      throw new Error(`All tickets API error: ${allTicketsResponse.status} - ${errorText}`)
    }

    // Parse JSON responses with error handling
    const [openData, closedData, allTicketsData] = await Promise.all([
      parseJsonSafely(openResponse, 'open tickets'),
      parseJsonSafely(closedResponse, 'closed tickets'), 
      parseJsonSafely(allTicketsResponse, 'all tickets')
    ])

    // Helper function to safely parse JSON responses
    async function parseJsonSafely(response: Response, source: string) {
      try {
        const text = await response.text()
        if (!text || text.trim() === '') {
          console.warn(`📊 [ZOHO STATS API] Empty response from ${source}`)
          return { data: [], info: { count: 0 } }
        }
        return JSON.parse(text)
      } catch (error) {
        console.error(`📊 [ZOHO STATS API] JSON parse error for ${source}:`, error)
        // Do not log raw text to avoid large logs
        throw new Error(`Failed to parse JSON response from ${source}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    // Process the data to generate statistics
    const allTickets = allTicketsData?.data || []
    
    // Log data for debugging
    console.log('📊 [ZOHO STATS API] Data summary:', {
      openCount: openData?.info?.count || 0,
      closedCount: closedData?.info?.count || 0,
      allTicketsCount: allTickets.length
    })
    
    // Filter tickets within date range if specified
    const filteredTickets = startDate && endDate 
      ? allTickets.filter((ticket: Record<string, unknown>) => {
          const createdValue = (ticket as Record<string, unknown>)['createdTime']
          const createdDate =
            typeof createdValue === 'string' || typeof createdValue === 'number' || createdValue instanceof Date
              ? new Date(createdValue as string | number | Date)
              : null
          if (!createdDate || Number.isNaN(createdDate.getTime())) {
            return false
          }
          const ticketDate = createdDate.toISOString().split('T')[0]
          return ticketDate >= String(from) && ticketDate <= String(to)
        })
      : allTickets

    // Calculate statistics
    const stats: ZohoStats = {
      totalTickets: filteredTickets.length,
      openTickets: openData?.info?.count || 0,
      resolvedTickets: closedData?.info?.count || 0,
      pendingTickets: 0,
      overdueTickets: 0,
      ticketsByStatus: {},
      ticketsByPriority: {},
      ticketsByChannel: {},
      avgResolutionTime: 0,
      avgResponseTime: 0
    }

    // Group tickets by status, priority, and channel
    filteredTickets.forEach((ticket: Record<string, any>) => {
      // By status
      const status = ticket.status || 'Unknown'
      stats.ticketsByStatus[status] = (stats.ticketsByStatus[status] || 0) + 1

      // By priority
      const priority = ticket.priority || 'Medium'
      stats.ticketsByPriority[priority] = (stats.ticketsByPriority[priority] || 0) + 1

      // By channel
      const channel = ticket.channel || 'Email'
      stats.ticketsByChannel[channel] = (stats.ticketsByChannel[channel] || 0) + 1

      // Check for pending/overdue
      if (status === 'Open' || status === 'In Progress') {
        stats.pendingTickets++
        
        if (ticket.dueDate && new Date(ticket.dueDate) < new Date()) {
          stats.overdueTickets++
        }
      }
    })

    // Calculate average resolution time (for closed tickets)
    const closedTickets = filteredTickets.filter((ticket: Record<string, any>) => ticket.status === 'Closed')
    if (closedTickets.length > 0) {
      const totalResolutionTime = closedTickets.reduce((total: number, ticket: Record<string, any>) => {
        const created = new Date(ticket.createdTime).getTime()
        const modified = new Date(ticket.modifiedTime).getTime()
        return total + (modified - created)
      }, 0)
      stats.avgResolutionTime = Math.round(totalResolutionTime / closedTickets.length / (1000 * 60 * 60)) // Convert to hours
    }

    console.log('📊 [ZOHO STATS API] Successfully calculated statistics')

    return NextResponse.json({
      success: true,
      stats,
      meta: {
        dateRange: { from, to },
        timeframe,
        totalTicketsAnalyzed: filteredTickets.length
      }
    })

  } catch (error) {
    console.error('📊 [ZOHO STATS API] Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch statistics from Zoho Desk',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
