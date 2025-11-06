/**
 * Prospect List Page
 * 
 * Displays all prospects in a table with:
 * - Search functionality
 * - Industry and location filters
 * - Expandable summary field
 */

'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, ChevronDown, ChevronUp, FileText, FileSpreadsheet, ExternalLink } from 'lucide-react'
import { ProspectEntity } from '@/lib/supabase'
import { getProspects, getUniqueTypes, getUniqueLocations, ProspectWithQuery } from '@/lib/prospects'
import { downloadCSV, exportToGoogleSheets } from '@/lib/export'
import Modal from '@/components/ui/Modal'
import CustomSelect from '@/components/ui/CustomSelect'

export default function ProspectListPage() {
  const [prospects, setProspects] = useState<ProspectWithQuery[]>([])
  const [filteredProspects, setFilteredProspects] = useState<ProspectWithQuery[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  
  // Options for filters
  const [types, setTypes] = useState<string[]>([])
  const [locations, setLocations] = useState<string[]>([])
  
  // Prepare options for CustomSelect
  const typeOptions = [
    { value: '', label: 'All Types' },
    ...types.map((type) => ({ value: type, label: type })),
  ]
  
  const locationOptions = [
    { value: '', label: 'All Locations' },
    ...locations.map((location) => ({ value: location, label: location })),
  ]
  
  // Expanded summaries
  const [expandedSummaries, setExpandedSummaries] = useState<Set<string>>(new Set())
  
  // Modal state
  const [modal, setModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    type?: 'info' | 'success' | 'error' | 'warning'
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  })

  // Load prospects and filter options
  useEffect(() => {
    loadProspects()
    loadFilterOptions()
  }, [])

  // Apply client-side filters when they change
  useEffect(() => {
    applyFilters()
  }, [prospects, searchQuery, selectedType, selectedLocation])

  const loadProspects = async () => {
    setIsLoading(true)
    try {
      const data = await getProspects()
      setProspects(data)
      // Apply client-side filters after loading
      setTimeout(() => {
        applyFilters()
      }, 0)
    } catch (error) {
      console.error('Error loading prospects:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadFilterOptions = async () => {
    try {
      const [typeList, locationList] = await Promise.all([
        getUniqueTypes(),
        getUniqueLocations(),
      ])
      setTypes(typeList)
      setLocations(locationList)
    } catch (error) {
      console.error('Error loading filter options:', error)
    }
  }

  const applyFilters = () => {
    let filtered = [...prospects]

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(query)
      )
    }

    // Apply type filter
    if (selectedType) {
      filtered = filtered.filter((p) => p.type === selectedType)
    }

    // Apply location filter
    if (selectedLocation) {
      filtered = filtered.filter((p) => p.location === selectedLocation)
    }

    setFilteredProspects(filtered)
  }

  const toggleSummary = (id: string) => {
    const newExpanded = new Set(expandedSummaries)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedSummaries(newExpanded)
  }

  const truncateText = (text: string | null, maxLength: number = 100): string => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading prospects...</div>
      </div>
    )
  }

  const showModal = (title: string, message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    setModal({ isOpen: true, title, message, type })
  }

  const handleExportCSV = () => {
    try {
      downloadCSV(filteredProspects, `prospects_${new Date().toISOString().split('T')[0]}.csv`)
      showModal('Export Successful', `CSV file with ${filteredProspects.length} prospects has been downloaded.`, 'success')
    } catch (error) {
      console.error('Error exporting CSV:', error)
      showModal('Export Failed', 'Failed to export CSV. Please try again.', 'error')
    }
  }

  const handleExportGoogleSheets = async () => {
    try {
      await exportToGoogleSheets(filteredProspects)
      showModal('Export Successful', 'CSV data has been copied to clipboard. Please paste it into a new Google Sheet.', 'success')
    } catch (error) {
      console.error('Error exporting to Google Sheets:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to export to Google Sheets. Please try again.'
      showModal('Export Failed', errorMessage, 'error')
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Prospect List</h1>
          <p className="text-sm text-gray-500 mt-1">
            View and filter all generated prospects
          </p>
        </div>
        {/* Export Buttons */}
        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
          <button
            onClick={handleExportCSV}
            disabled={filteredProspects.length === 0}
            className="flex items-center gap-2 px-3 md:px-4 py-2 bg-navy-800 text-white rounded-lg hover:bg-navy-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">CSV</span>
          </button>
          <button
            onClick={handleExportGoogleSheets}
            disabled={filteredProspects.length === 0}
            className="flex items-center gap-2 px-3 md:px-4 py-2 bg-white text-navy-800 border border-navy-800 rounded-lg hover:bg-navy-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden sm:inline">Export to Sheets</span>
            <span className="sm:hidden">Sheets</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-800 focus:border-navy-800 shadow-sm hover:shadow-md transition-all font-medium"
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <CustomSelect
              options={typeOptions}
              value={selectedType}
              onChange={(value) => setSelectedType(value)}
              placeholder="All Types"
              icon={<Filter className="w-5 h-5 text-gray-400" />}
            />
          </div>

          {/* Location Filter */}
          <div className="relative">
            <CustomSelect
              options={locationOptions}
              value={selectedLocation}
              onChange={(value) => setSelectedLocation(value)}
              placeholder="All Locations"
              icon={<Filter className="w-5 h-5 text-gray-400" />}
            />
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-500">
          Showing {filteredProspects.length} of {prospects.length} prospects
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto -mx-4 md:mx-0">
          <table className="w-full min-w-[800px]">
            <thead className="bg-navy-800 border-b border-navy-700">
              <tr>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider w-[10%]">
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
                <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider w-[15%]">
                  Query
                </th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider w-[35%]">
                  Summary
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProspects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No prospects found
                  </td>
                </tr>
              ) : (
                filteredProspects.map((prospect) => {
                  const isExpanded = expandedSummaries.has(prospect.id)
                  const summary = prospect.summary || ''
                  const shouldTruncate = summary.length > 100

                  return (
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
                      <td className="px-4 md:px-6 py-4 text-sm text-gray-700">
                        <div className="min-w-[100px] max-w-[150px]">
                          <span className="text-xs text-gray-600 break-words" title={prospect.query_text || 'N/A'}>
                            {prospect.query_text ? (
                              prospect.query_text.length > 50
                                ? `${prospect.query_text.substring(0, 50)}...`
                                : prospect.query_text
                            ) : (
                              'N/A'
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 text-sm text-gray-700 min-w-[250px] md:min-w-[350px]">
                        <div>
                          {isExpanded || !shouldTruncate ? (
                            <span className="break-words">{summary || 'No summary'}</span>
                          ) : (
                            <span className="break-words">{truncateText(summary, 150)}</span>
                          )}
                          {shouldTruncate && (
                            <button
                              onClick={() => toggleSummary(prospect.id)}
                              className="ml-2 text-navy-800 hover:text-navy-900 flex items-center gap-1 whitespace-nowrap"
                            >
                              {isExpanded ? (
                                <>
                                  <span>Show Less</span>
                                  <ChevronUp className="w-4 h-4" />
                                </>
                              ) : (
                                <>
                                  <span>View More</span>
                                  <ChevronDown className="w-4 h-4" />
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Modal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </div>
  )
}

