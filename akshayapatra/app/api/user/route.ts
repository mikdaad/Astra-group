export {}

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Hello from GET /api/user' })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  return NextResponse.json({ message: 'Received', data: body })
}
