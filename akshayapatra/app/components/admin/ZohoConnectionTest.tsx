'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, RefreshCw, AlertTriangle, Info } from 'lucide-react'
import { useZohoAuth } from '@/hooks/useZohoDesk'

interface ZohoConnectionTestProps {
  className?: string
}

export default function ZohoConnectionTest({ className }: ZohoConnectionTestProps) {
  const { testing, isAuthenticated, error, testAuth } = useZohoAuth()

  const getStatusIcon = () => {
    if (testing) {
      return <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
    }
    
    if (isAuthenticated === true) {
      return <CheckCircle className="h-5 w-5 text-green-500" />
    }
    
    if (isAuthenticated === false) {
      return <XCircle className="h-5 w-5 text-red-500" />
    }
    
    return <Info className="h-5 w-5 text-gray-500" />
  }

  const getStatusText = () => {
    if (testing) {
      return 'Testing connection...'
    }
    
    if (isAuthenticated === true) {
      return 'Connected to Zoho Desk'
    }
    
    if (isAuthenticated === false) {
      return 'Connection failed'
    }
    
    return 'Connection not tested'
  }

  const getStatusColor = () => {
    if (testing) {
      return 'text-blue-600 dark:text-blue-400'
    }
    
    if (isAuthenticated === true) {
      return 'text-green-600 dark:text-green-400'
    }
    
    if (isAuthenticated === false) {
      return 'text-red-600 dark:text-red-400'
    }
    
    return 'text-gray-600 dark:text-gray-400'
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Zoho Desk Connection</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <p className={`font-medium ${getStatusColor()}`}>
                {getStatusText()}
              </p>
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {error}
                </p>
              )}
            </div>
          </div>
          
          <Button
            onClick={testAuth}
            disabled={testing}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${testing ? 'animate-spin' : ''}`} />
            Test Connection
          </Button>
        </div>

        {/* Configuration Info */}
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Configuration</h4>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex justify-between">
              <span>Environment:</span>
              <span className="font-mono">Sandbox</span>
            </div>
            <div className="flex justify-between">
              <span>Base URL:</span>
              <span className="font-mono">desk.zoho.in</span>
            </div>
            <div className="flex justify-between">
              <span>Authentication:</span>
              <span className="font-mono">OAuth 2.0</span>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-blue-800 dark:text-blue-200 font-medium">
                Zoho Desk Integration
              </p>
              <p className="text-blue-600 dark:text-blue-400 mt-1">
                This integration connects securely to Zoho Desk API through a protected proxy. 
                Staff members can view ticket data without accessing Zoho credentials directly.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
