/**
 * Prospect Management Utilities
 * 
 * Handles CRUD operations for prospects including:
 * - Inserting new prospects with deduplication
 * - Querying and filtering prospects
 * - Export functionality
 */

import { supabase, ProspectEntity, SearchRequest } from './supabase'

/**
 * Create a new search request
 */
export async function createSearchRequest(
  queryText: string
): Promise<SearchRequest | null> {
  const { data, error } = await supabase
    .from('search_requests')
    .insert([{ query_text: queryText }])
    .select()
    .single()

  if (error) {
    console.error('Error creating search request:', error)
    return null
  }

  return data
}

/**
 * Check if a prospect already exists based on name
 * Returns the existing prospect if found, null otherwise
 */
export async function findDuplicateProspect(
  name: string
): Promise<ProspectEntity | null> {
  const { data, error } = await supabase
    .from('prospect_entities')
    .select('*')
    .eq('name', name)
    .maybeSingle()

  if (error) {
    console.error('Error checking for duplicate:', error)
    return null
  }

  return data
}

/**
 * Insert a new prospect with automatic deduplication
 * If a duplicate exists, updates the existing record with new information
 */
export async function insertProspectWithDeduplication(
  prospect: Omit<ProspectEntity, 'id' | 'created_at'>
): Promise<{ success: boolean; isDuplicate: boolean; data?: ProspectEntity }> {
  // Check for duplicate by name
  const existing = await findDuplicateProspect(prospect.name)

  if (existing) {
    // Update existing prospect with new data if it's more complete
    const updateData: Partial<ProspectEntity> = {}
    
    // Update fields if new data is more complete
    if (prospect.summary && !existing.summary) {
      updateData.summary = prospect.summary
    }
    if (prospect.location && !existing.location) {
      updateData.location = prospect.location
    }
    if (prospect.type && !existing.type) {
      updateData.type = prospect.type
    }
    if (prospect.relevance_score !== null && (existing.relevance_score === null || prospect.relevance_score > existing.relevance_score)) {
      updateData.relevance_score = prospect.relevance_score
    }
    if (prospect.source && !existing.source) {
      updateData.source = prospect.source
    }
    
    // Update search_request_id if provided
    if (prospect.search_request_id) {
      updateData.search_request_id = prospect.search_request_id
    }

    if (Object.keys(updateData).length > 0) {
      const { data, error } = await supabase
        .from('prospect_entities')
        .update(updateData)
        .eq('id', existing.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating duplicate prospect:', error)
        return { success: false, isDuplicate: true }
      }

      return { success: true, isDuplicate: true, data }
    }

    return { success: true, isDuplicate: true, data: existing }
  }

  // Insert new prospect
  const { data, error } = await supabase
    .from('prospect_entities')
    .insert([prospect])
    .select()
    .single()

  if (error) {
    console.error('Error inserting prospect:', error)
    return { success: false, isDuplicate: false }
  }

  return { success: true, isDuplicate: false, data }
}

/**
 * Batch insert prospects with deduplication
 */
export async function batchInsertProspects(
  prospects: Omit<ProspectEntity, 'id' | 'created_at'>[]
): Promise<{ inserted: number; duplicates: number; errors: number }> {
  let inserted = 0
  let duplicates = 0
  let errors = 0

  for (const prospect of prospects) {
    const result = await insertProspectWithDeduplication(prospect)
    if (result.success) {
      if (result.isDuplicate) {
        duplicates++
      } else {
        inserted++
      }
    } else {
      errors++
    }
  }

  return { inserted, duplicates, errors }
}

/**
 * Prospect with Query Text
 */
export interface ProspectWithQuery extends ProspectEntity {
  query_text: string | null
}

/**
 * Get all prospects with optional filters and include query text
 */
export async function getProspects(filters?: {
  search?: string
  type?: string
  location?: string
}): Promise<ProspectWithQuery[]> {
  // Get prospects with joined query text from search_requests
  let query = supabase
    .from('prospect_entities')
    .select(`
      *,
      search_requests(query_text)
    `)

  // Apply search filter (name)
  if (filters?.search) {
    query = query.ilike('name', `%${filters.search}%`)
  }

  // Apply type filter
  if (filters?.type) {
    query = query.eq('type', filters.type)
  }

  // Apply location filter
  if (filters?.location) {
    query = query.eq('location', filters.location)
  }

  // Order by created_at descending
  query = query.order('created_at', { ascending: false })

  const { data, error } = await query

  if (error) {
    console.error('Error fetching prospects:', error)
    return []
  }

  // Transform the data to flatten the query_text
  // Supabase returns search_requests as an array, so we need to get the first item
  const prospectsWithQuery: ProspectWithQuery[] = (data || []).map((prospect: any) => {
    const searchRequest = Array.isArray(prospect.search_requests) 
      ? prospect.search_requests[0] 
      : prospect.search_requests
    
    return {
      ...prospect,
      query_text: searchRequest?.query_text || null,
      search_requests: undefined, // Remove the nested object
    }
  })

  return prospectsWithQuery
}

/**
 * Get prospects by search request ID (for showing latest generated)
 */
export async function getProspectsBySearchRequestId(
  searchRequestId: string
): Promise<ProspectEntity[]> {
  const { data, error } = await supabase
    .from('prospect_entities')
    .select('*')
    .eq('search_request_id', searchRequestId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching prospects by search request:', error)
    return []
  }

  return data || []
}

/**
 * Get unique query texts from search requests
 */
export async function getUniqueQueryTexts(): Promise<string[]> {
  const { data, error } = await supabase
    .from('search_requests')
    .select('query_text')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching query texts:', error)
    return []
  }

  // Deduplicate by query_text, keeping unique values
  const uniqueQueries = Array.from(new Set(data.map((req) => req.query_text))).filter(Boolean)
  return uniqueQueries
}

/**
 * Get unique types from prospects
 */
export async function getUniqueTypes(): Promise<string[]> {
  const { data, error } = await supabase
    .from('prospect_entities')
    .select('type')
    .not('type', 'is', null)

  if (error) {
    console.error('Error fetching types:', error)
    return []
  }

  const types = Array.from(new Set(data.map((p) => p.type))).filter(Boolean) as string[]
  return types.sort()
}

/**
 * Get unique locations from prospects
 */
export async function getUniqueLocations(): Promise<string[]> {
  const { data, error } = await supabase
    .from('prospect_entities')
    .select('location')
    .not('location', 'is', null)

  if (error) {
    console.error('Error fetching locations:', error)
    return []
  }

  const locations = Array.from(new Set(data.map((p) => p.location))).filter(Boolean)
  return locations.sort()
}

/**
 * Get type clusters (grouped by type with counts)
 */
export async function getTypeClusters(): Promise<
  { type: string; count: number }[]
> {
  const { data, error } = await supabase
    .from('prospect_entities')
    .select('type')
    .not('type', 'is', null)

  if (error) {
    console.error('Error fetching type clusters:', error)
    return []
  }

  const clusters = data.reduce((acc, prospect) => {
    const type = prospect.type
    if (type) {
      acc[type] = (acc[type] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  return Object.entries(clusters)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
}

/**
 * Get location clusters (grouped by location with counts)
 */
export async function getLocationClusters(): Promise<
  { location: string; count: number }[]
> {
  const { data, error } = await supabase
    .from('prospect_entities')
    .select('location')
    .not('location', 'is', null)

  if (error) {
    console.error('Error fetching location clusters:', error)
    return []
  }

  const clusters = data.reduce((acc, prospect) => {
    const location = prospect.location
    if (location) {
      acc[location] = (acc[location] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  return Object.entries(clusters)
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count)
}

