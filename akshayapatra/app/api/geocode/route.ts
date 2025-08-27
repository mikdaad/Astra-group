import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  console.log('🌍 [GEOCODE API] Request received')
  
  try {
    const { searchParams } = new URL(req.url)
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    
    if (!lat || !lng) {
      return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 })
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      console.error('🌍 [GEOCODE API] Google Maps API key not configured')
      return NextResponse.json({ error: 'Geocoding service not available' }, { status: 500 })
    }

    console.log('🌍 [GEOCODE API] Reverse geocoding for:', lat, lng)
    
    // Call Google Maps Geocoding API
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
    )
    
    if (!response.ok) {
      console.error('🌍 [GEOCODE API] Google Maps API request failed:', response.status)
      return NextResponse.json({ error: 'Geocoding request failed' }, { status: 500 })
    }

    const data = await response.json()
    
    if (data.status !== 'OK') {
      console.error('🌍 [GEOCODE API] Google Maps API error:', data.status, data.error_message)
      return NextResponse.json({ 
        error: data.error_message || 'Geocoding failed',
        status: data.status 
      }, { status: 400 })
    }

    if (!data.results || data.results.length === 0) {
      console.warn('🌍 [GEOCODE API] No results found for coordinates')
      return NextResponse.json({ error: 'No address found for coordinates' }, { status: 404 })
    }

    const result = data.results[0]
    const formattedAddress = result.formatted_address
    
    // Extract address components for structured data
    const addressComponents = result.address_components
    const extractedData = {
      formatted_address: formattedAddress,
      street_number: '',
      route: '',
      neighborhood: '',
      locality: '',
      administrative_area_level_2: '', // County
      administrative_area_level_1: '', // State
      country: '',
      postal_code: ''
    }

    // Parse address components
    addressComponents.forEach((component: { types: string[]; long_name: string }) => {
      const types = component.types
      if (types.includes('street_number')) {
        extractedData.street_number = component.long_name
      }
      if (types.includes('route')) {
        extractedData.route = component.long_name
      }
      if (types.includes('neighborhood')) {
        extractedData.neighborhood = component.long_name
      }
      if (types.includes('locality')) {
        extractedData.locality = component.long_name
      }
      if (types.includes('administrative_area_level_2')) {
        extractedData.administrative_area_level_2 = component.long_name
      }
      if (types.includes('administrative_area_level_1')) {
        extractedData.administrative_area_level_1 = component.long_name
      }
      if (types.includes('country')) {
        extractedData.country = component.long_name
      }
      if (types.includes('postal_code')) {
        extractedData.postal_code = component.long_name
      }
    })

    console.log('🌍 [GEOCODE API] Successfully geocoded address:', formattedAddress)
    
    return NextResponse.json({
      success: true,
      address: extractedData,
      raw: result // Include raw Google Maps response for debugging
    })

  } catch (error) {
    console.error('🌍 [GEOCODE API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
