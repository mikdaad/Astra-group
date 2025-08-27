import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
// import { hasAdminAccess } from '@/utils/admin/permissions'
import { getZohoAccessToken } from '@/lib/services/zoho-auth'

/**
 * Zoho Desk Single Ticket Operations
 * GET - Get ticket details
 * PUT - Update ticket
 * DELETE - Delete ticket
 */

interface TicketUpdateRequest {
  subject?: string
  description?: string
  status?: string
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent'
  assigneeId?: string
  departmentId?: string
  category?: string
  subCategory?: string
  dueDate?: string
  tags?: string[]
  customFields?: Record<string, unknown>
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    console.log('🎫 [ZOHO TICKET API] Get ticket request received for ID:', resolvedParams.id)

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

    // Get Zoho access token
    const accessToken = await getZohoAccessToken()

    // Build Zoho API URL
    const baseUrl = process.env.ZOHO_BASE_URL || 'https://desk.zoho.in'
    const orgId = process.env.ZOHO_ORG_ID

    if (!orgId) {
      throw new Error('Missing Zoho Organization ID')
    }

    const zohoUrl = `${baseUrl}/api/v1/tickets/${resolvedParams.id}`

    console.log('🎫 [ZOHO TICKET API] Fetching ticket from Zoho:', zohoUrl)

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
      console.error('🎫 [ZOHO TICKET API] Zoho API error:', response.status, errorText)
      throw new Error(`Zoho API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    
    console.log('🎫 [ZOHO TICKET API] Successfully fetched ticket')

    return NextResponse.json({
      success: true,
      ticket: data
    })

  } catch (error) {
    console.error('🎫 [ZOHO TICKET API] Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch ticket from Zoho Desk',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    console.log('🎫 [ZOHO TICKET API] Update ticket request received for ID:', resolvedParams.id)

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
    const rawUpdateData: TicketUpdateRequest = await req.json()
    
    // Filter out empty/null values to avoid Zoho validation errors
    const updateData: Record<string, unknown> = {}
    
    // Only include fields with valid values
    if (rawUpdateData.subject && rawUpdateData.subject.trim()) {
      updateData.subject = rawUpdateData.subject.trim()
    }
    
    if (rawUpdateData.description !== undefined) {
      updateData.description = rawUpdateData.description
    }
    
    if (rawUpdateData.status && rawUpdateData.status.trim()) {
      updateData.status = rawUpdateData.status
    }
    
    if (rawUpdateData.priority && rawUpdateData.priority.trim()) {
      updateData.priority = rawUpdateData.priority
    }
    
    if (rawUpdateData.category && rawUpdateData.category.trim()) {
      updateData.category = rawUpdateData.category.trim()
    }
    
    if (rawUpdateData.subCategory && rawUpdateData.subCategory.trim()) {
      updateData.subCategory = rawUpdateData.subCategory.trim()
    }
    
    if (rawUpdateData.assigneeId && rawUpdateData.assigneeId.trim()) {
      updateData.assigneeId = rawUpdateData.assigneeId
    }
    
    if (rawUpdateData.departmentId && rawUpdateData.departmentId.trim()) {
      updateData.departmentId = rawUpdateData.departmentId
    }
    
    if (rawUpdateData.dueDate && rawUpdateData.dueDate.trim()) {
      updateData.dueDate = rawUpdateData.dueDate
    }
    
    if (rawUpdateData.tags && Array.isArray(rawUpdateData.tags) && rawUpdateData.tags.length > 0) {
      updateData.tags = rawUpdateData.tags.filter(tag => tag && tag.trim())
    }
    
    if (rawUpdateData.customFields && Object.keys(rawUpdateData.customFields).length > 0) {
      updateData.customFields = rawUpdateData.customFields
    }
    
    console.log('🎫 [ZOHO TICKET API] Filtered update data:', Object.keys(updateData))

    // Get Zoho access token
    const accessToken = await getZohoAccessToken()

    // Build Zoho API URL
    const baseUrl = process.env.ZOHO_BASE_URL || 'https://desk.zoho.in'
    const orgId = process.env.ZOHO_ORG_ID

    if (!orgId) {
      throw new Error('Missing Zoho Organization ID')
    }

    const zohoUrl = `${baseUrl}/api/v1/tickets/${resolvedParams.id}`

    console.log('🎫 [ZOHO TICKET API] Updating ticket in Zoho:', zohoUrl)

    // Make request to Zoho API
    const response = await fetch(zohoUrl, {
      method: 'PATCH',
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
        'orgId': orgId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('🎫 [ZOHO TICKET API] Update error:', response.status, errorText)
      
      // Parse Zoho error for better user feedback
      let userFriendlyError = 'Failed to update ticket'
      try {
        const errorData = JSON.parse(errorText) as { errors?: Array<{ fieldName?: string, errorMessage?: string }>, message?: string }
        if (errorData.errors && errorData.errors.length > 0) {
          const fieldErrors = errorData.errors.map((err) => {
            const fieldName = err.fieldName?.replace('/', '') || 'field'
            return `${fieldName}: ${err.errorMessage || 'invalid value'}`
          }).join(', ')
          userFriendlyError = `Validation error: ${fieldErrors}`
        } else if (errorData.message) {
          userFriendlyError = errorData.message
        }
      } catch {
        // Use default error if parsing fails
      }
      
      throw new Error(userFriendlyError)
    }

    const data = await response.json()
    
    console.log('🎫 [ZOHO TICKET API] Successfully updated ticket')

    return NextResponse.json({
      success: true,
      ticket: data,
      message: 'Ticket updated successfully'
    })

  } catch (error) {
    console.error('🎫 [ZOHO TICKET API] Update error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update ticket in Zoho Desk',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    console.log('🎫 [ZOHO TICKET API] Delete ticket request received for ID:', resolvedParams.id)

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

    // Get Zoho access token
    const accessToken = await getZohoAccessToken()

    // Build Zoho API URL
    const baseUrl = process.env.ZOHO_BASE_URL || 'https://desk.zoho.in'
    const orgId = process.env.ZOHO_ORG_ID

    if (!orgId) {
      throw new Error('Missing Zoho Organization ID')
    }

    const zohoUrl = `${baseUrl}/api/v1/tickets/${resolvedParams.id}`

    console.log('🎫 [ZOHO TICKET API] Deleting ticket in Zoho:', zohoUrl)

    // Make request to Zoho API
    const response = await fetch(zohoUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
        'orgId': orgId,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('🎫 [ZOHO TICKET API] Delete error:', response.status, errorText)
      throw new Error(`Zoho API error: ${response.status} - ${errorText}`)
    }
    
    console.log('🎫 [ZOHO TICKET API] Successfully deleted ticket')

    return NextResponse.json({
      success: true,
      message: 'Ticket deleted successfully'
    })

  } catch (error) {
    console.error('🎫 [ZOHO TICKET API] Delete error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to delete ticket from Zoho Desk',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
