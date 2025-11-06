/**
 * Generate Prospects Page
 * 
 * Allows users to input a natural language audience description
 * and generate prospects via n8n webhook integration.
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Loader2, ExternalLink } from 'lucide-react'
import { ProspectEntity } from '@/lib/supabase'
import { getProspectsBySearchRequestId } from '@/lib/prospects'

export default function GenerateProspectsPage() {
  const router = useRouter()
  const [queryText, setQueryText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [latestProspects, setLatestProspects] = useState<ProspectEntity[]>([])
  const [searchRequestId, setSearchRequestId] = useState<string | null>(null)
  const [showTable, setShowTable] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!queryText.trim()) {
      setError('Please enter a query description')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL
      
      if (!webhookUrl) {
        throw new Error('N8N webhook URL is not configured')
      }

      // Call n8n webhook
      const response = await fetch('/api/generate-prospects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query_text: queryText }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to generate prospects')
      }

      const data = await response.json()
      
      // If we have a search request ID, load the latest prospects
      if (data.searchRequestId) {
        setSearchRequestId(data.searchRequestId)
        loadLatestProspects(data.searchRequestId)
        setShowTable(true)
      } else {
        // Redirect to prospect list page if no search request ID
        router.push('/prospects')
      }
    } catch (err) {
      console.error('Error generating prospects:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const loadLatestProspects = async (requestId: string) => {
    try {
      const prospects = await getProspectsBySearchRequestId(requestId)
      setLatestProspects(prospects)
    } catch (error) {
      console.error('Error loading latest prospects:', error)
    }
  }

  const formatUrl = (url: string | null): string => {
    if (!url) return 'N/A'
    try {
      const urlObj = new URL(url)
      return urlObj.hostname.replace('www.', '')
    } catch {
      return url.length > 30 ? url.substring(0, 30) + '...' : url
    }
  }

  return (
    <div className="w-full">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-navy-100 rounded-lg">
            <Sparkles className="w-6 h-6 text-navy-800" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Generate Prospects
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Describe your target audience to generate prospect data
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="query_text"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Audience Description
            </label>
            <textarea
              id="query_text"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder="e.g., Mid-sized industrial manufacturers in Germany focusing on sustainability..."
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-800 focus:border-navy-800 resize-none"
              disabled={isLoading}
            />
            <p className="mt-2 text-sm text-gray-500">
              Provide a detailed description of your target audience or market
              segment
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={isLoading || !queryText.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-navy-800 text-white rounded-lg hover:bg-navy-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate Prospects</span>
                </>
              )}
            </button>
            {isLoading && (
              <p className="text-sm text-gray-500">
                This may take a few moments...
              </p>
            )}
          </div>
        </form>
      </div>

      {/* Latest Generated Prospects Table */}
      {showTable && latestProspects.length > 0 && (
        <div className="mt-8 w-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Latest Generated Prospects
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {latestProspects.length} prospect(s) generated from your query
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-navy-800 border-b border-navy-700">
                <tr>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider w-[12%]">
                    Name
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider w-[8%]">
                    Type
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider w-[10%]">
                    Location
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider w-[10%]">
                    Relevance Score
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider w-[12%]">
                    Source
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider w-[48%]">
                    Summary
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {latestProspects.map((prospect) => (
                  <tr key={prospect.id} className="hover:bg-navy-50/30 transition-colors">
                    <td className="px-4 md:px-6 py-4 text-sm font-medium text-gray-900">
                      <div className="min-w-[100px]">{prospect.name}</div>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-700">
                      <span className="px-2 py-1 bg-navy-100 text-navy-800 rounded-full text-xs font-medium whitespace-nowrap">
                        {prospect.type || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-700">
                      <div className="min-w-[80px] max-w-[120px] truncate" title={prospect.location || 'N/A'}>
                        {prospect.location || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                      {prospect.relevance_score !== null ? (
                        <span className="font-medium">{prospect.relevance_score.toFixed(2)}</span>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-700">
                      {prospect.source ? (
                        <a
                          href={prospect.source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-navy-800 hover:text-navy-900 hover:underline max-w-[150px] truncate"
                          title={prospect.source}
                        >
                          <span className="truncate">{formatUrl(prospect.source)}</span>
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-700 min-w-[300px] md:min-w-[400px]">
                      <div>
                        <span className="break-words">{prospect.summary || 'No summary'}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => router.push('/prospects')}
              className="text-navy-800 hover:text-navy-900 font-medium text-sm hover:underline"
            >
              View All Prospects →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

