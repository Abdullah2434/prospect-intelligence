/**
 * Export Utilities
 * 
 * Handles exporting prospect data to CSV and Google Sheets
 */

import { ProspectEntity } from './supabase'

/**
 * Convert prospects array to CSV format
 */
export function prospectsToCSV(prospects: ProspectEntity[]): string {
  if (prospects.length === 0) {
    return ''
  }

  // CSV Headers
  const headers = [
    'Name',
    'Type',
    'Location',
    'Summary',
    'Relevance Score',
    'Source',
    'Created At',
  ]

  // CSV Rows
  const rows = prospects.map((prospect) => {
    return [
      escapeCSV(prospect.name),
      escapeCSV(prospect.type || ''),
      escapeCSV(prospect.location || ''),
      escapeCSV(prospect.summary || ''),
      escapeCSV(prospect.relevance_score?.toString() || ''),
      escapeCSV(prospect.source || ''),
      escapeCSV(prospect.created_at),
    ]
  })

  // Combine headers and rows
  const csvContent = [headers, ...rows]
    .map((row) => row.join(','))
    .join('\n')

  return csvContent
}

/**
 * Escape CSV field (handles commas, quotes, and newlines)
 */
function escapeCSV(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`
  }
  return field
}

/**
 * Download CSV file
 */
export function downloadCSV(prospects: ProspectEntity[], filename: string = 'prospects.csv') {
  const csv = prospectsToCSV(prospects)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Export to Google Sheets
 * Opens Google Sheets with the data pre-filled
 */
export async function exportToGoogleSheets(prospects: ProspectEntity[]): Promise<void> {
  const csv = prospectsToCSV(prospects)
  
  // Encode CSV data
  const encodedData = encodeURIComponent(csv)
  
  // Google Sheets import URL
  // This creates a new sheet with the CSV data
  const googleSheetsUrl = `https://docs.google.com/spreadsheets/d/create?usp=drive_web&usp=sheets_web&usp=sheets_web&usp=sheets_web`
  
  // Alternative: Use Google Sheets API or create a form that submits to Google Sheets
  // For now, we'll use a simpler approach: create a data URI and open it
  // Note: This requires the user to manually paste the CSV into Google Sheets
  // A better approach would be to use the Google Sheets API with OAuth
  
  // For now, we'll copy the CSV to clipboard and open Google Sheets
  try {
    await navigator.clipboard.writeText(csv)
    window.open('https://sheets.google.com/create', '_blank')
    // Note: Modal will be shown by the calling component
  } catch (err) {
    console.error('Failed to copy to clipboard:', err)
    // Fallback: download CSV
    downloadCSV(prospects)
    throw new Error('Failed to copy to clipboard. CSV downloaded instead.')
  }
}

