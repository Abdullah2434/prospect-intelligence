/**
 * Custom Modal Component
 * 
 * Provides a clean, modern modal for alerts and confirmations
 */

'use client'

import { X, AlertCircle, CheckCircle, Info } from 'lucide-react'
import { useEffect } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  type?: 'info' | 'success' | 'error' | 'warning'
  showCancel?: boolean
  onConfirm?: () => void
  confirmText?: string
  cancelText?: string
}

export default function Modal({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  showCancel = false,
  onConfirm,
  confirmText = 'OK',
  cancelText = 'Cancel',
}: ModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const iconColors = {
    info: 'text-navy-800',
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600',
  }

  const buttonColors = {
    info: 'bg-navy-800 hover:bg-navy-900',
    success: 'bg-green-600 hover:bg-green-700',
    error: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
  }

  const bgColors = {
    info: 'bg-navy-100',
    success: 'bg-green-100',
    error: 'bg-red-100',
    warning: 'bg-yellow-100',
  }

  const Icon = {
    info: Info,
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertCircle,
  }[type]

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${bgColors[type]}`}>
              <Icon className={`w-5 h-5 ${iconColors[type]}`} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 whitespace-pre-line">{message}</p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          {showCancel && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 text-white rounded-lg transition-colors ${buttonColors[type]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

