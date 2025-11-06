/**
 * Supabase Client Configuration
 * 
 * This file initializes the Supabase client for database operations.
 * Make sure to set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
 * in your .env.local file.
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Prospect Entity Type
 * Matches the Supabase schema
 */
export interface ProspectEntity {
  id: string
  search_request_id: string | null
  name: string
  type: 'company' | 'person' | 'organization' | null
  location: string | null
  summary: string | null
  relevance_score: number | null
  source: string | null
  created_at: string
}

/**
 * Search Request Type
 * Matches the search_requests table
 */
export interface SearchRequest {
  id: string
  query_text: string
  created_at: string
}

