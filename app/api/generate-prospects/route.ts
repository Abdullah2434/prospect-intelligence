/**
 * API Route: Generate Prospects
 * 
 * Handles the POST request to generate prospects via n8n webhook.
 * Processes the response and stores prospects in Supabase with deduplication.
 */

import { NextRequest, NextResponse } from 'next/server'
import { batchInsertProspects, createSearchRequest } from '@/lib/prospects'
import { ProspectEntity } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query_text } = body

    if (!query_text || typeof query_text !== 'string') {
      return NextResponse.json(
        { error: 'query_text is required' },
        { status: 400 }
      )
    }

    const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL

    if (!webhookUrl) {
      return NextResponse.json(
        { error: 'N8N webhook URL is not configured' },
        { status: 500 }
      )
    }

    // Create search request first
    const searchRequest = await createSearchRequest(query_text)
    if (!searchRequest) {
      return NextResponse.json(
        { error: 'Failed to create search request' },
        { status: 500 }
      )
    }

    // Call n8n webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query_text }),
    })

    if (!response.ok) {
      throw new Error(`n8n webhook returned status ${response.status}`)
    }

    // Parse response from n8n
    // Expected format: { prospects: [...] }
    const data = await response.json()
    
    // Handle different response formats
    let prospects: any[] = []
    
    if (Array.isArray(data)) {
      prospects = data
    } else if (data.prospects && Array.isArray(data.prospects)) {
      prospects = data.prospects
    } else if (data.data && Array.isArray(data.data)) {
      prospects = data.data
    } else {
      return NextResponse.json(
        { error: 'Invalid response format from n8n webhook' },
        { status: 500 }
      )
    }

    if (prospects.length === 0) {
      return NextResponse.json(
        { message: 'No prospects generated', inserted: 0, duplicates: 0 },
        { status: 200 }
      )
    }

    // Transform prospects to match our schema
    const transformedProspects: Omit<ProspectEntity, 'id' | 'created_at'>[] =
      prospects.map((prospect) => ({
        search_request_id: searchRequest.id,
        name: prospect.name || '',
        type: prospect.type || null,
        location: prospect.location || null,
        summary: prospect.summary || null,
        relevance_score: prospect.relevance_score || prospect.relevanceScore || null,
        source: prospect.source || null,
      }))

    // Insert prospects with deduplication
    const result = await batchInsertProspects(transformedProspects)

    return NextResponse.json({
      message: 'Prospects generated successfully',
      searchRequestId: searchRequest.id,
      ...result,
    })
  } catch (error) {
    console.error('Error generating prospects:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to generate prospects',
      },
      { status: 500 }
    )
  }
}

