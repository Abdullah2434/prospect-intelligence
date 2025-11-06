/**
 * Relationships Page
 * 
 * Displays industry and location clusters to show
 * relationships and patterns in prospect data.
 */

'use client'

import { useState, useEffect } from 'react'
import { Network, Tag, MapPin } from 'lucide-react'
import {
  getTypeClusters,
  getLocationClusters,
} from '@/lib/prospects'

interface Cluster {
  type?: string
  location?: string
  count: number
}

export default function RelationshipsPage() {
  const [typeClusters, setTypeClusters] = useState<Cluster[]>([])
  const [locationClusters, setLocationClusters] = useState<Cluster[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadClusters()
  }, [])

  const loadClusters = async () => {
    setIsLoading(true)
    try {
      const [types, locations] = await Promise.all([
        getTypeClusters(),
        getLocationClusters(),
      ])
      setTypeClusters(types)
      setLocationClusters(locations)
    } catch (error) {
      console.error('Error loading clusters:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading relationships...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Relationships</h1>
        <p className="text-sm text-gray-500 mt-1">
          Analyze type and location patterns in your prospect data
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Type Clusters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-navy-100 rounded-lg">
              <Tag className="w-6 h-6 text-navy-800" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Type Clusters
              </h2>
              <p className="text-sm text-gray-500">
                Prospects grouped by type
              </p>
            </div>
          </div>

          {typeClusters.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No type data available
            </div>
          ) : (
            <div className="space-y-3">
              {typeClusters.map((cluster, index) => (
                <div
                  key={cluster.type || index}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">
                      {cluster.type || 'Unknown'}
                    </span>
                    <span className="px-3 py-1 bg-navy-100 text-navy-800 rounded-full text-sm font-medium">
                      {cluster.count} {cluster.count === 1 ? 'prospect' : 'prospects'}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-navy-800 h-2 rounded-full transition-all"
                      style={{
                        width: `${
                          (cluster.count /
                            typeClusters.reduce(
                              (sum, c) => sum + c.count,
                              0
                            )) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Location Clusters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-navy-100 rounded-lg">
              <MapPin className="w-6 h-6 text-navy-800" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Location Clusters
              </h2>
              <p className="text-sm text-gray-500">
                Prospects grouped by location
              </p>
            </div>
          </div>

          {locationClusters.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No location data available
            </div>
          ) : (
            <div className="space-y-3">
              {locationClusters.map((cluster, index) => (
                <div
                  key={cluster.location || index}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">
                      {cluster.location || 'Unknown'}
                    </span>
                    <span className="px-3 py-1 bg-navy-100 text-navy-800 rounded-full text-sm font-medium">
                      {cluster.count} {cluster.count === 1 ? 'prospect' : 'prospects'}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-navy-800 h-2 rounded-full transition-all"
                      style={{
                        width: `${
                          (cluster.count /
                            locationClusters.reduce(
                              (sum, c) => sum + c.count,
                              0
                            )) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Network className="w-6 h-6 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Summary</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Total Types</p>
            <p className="text-2xl font-bold text-gray-900">
              {typeClusters.length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Locations</p>
            <p className="text-2xl font-bold text-gray-900">
              {locationClusters.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

