'use client'

import React from 'react'
import GlowCard from './GlowCard'
import { CardContent } from '@/components/ui/card'

interface SkeletonCardProps {
  className?: string
  variant?: 'stat' | 'chart' | 'table' | 'default'
}

export default function SkeletonCard({ className = "", variant = 'default' }: SkeletonCardProps) {
  const shimmer = (
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
  )

  if (variant === 'stat') {
    return (
      <GlowCard className={`${className} animate-pulse`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {/* Title skeleton */}
              <div className="relative overflow-hidden">
                <div className="h-4 bg-orange-200/20 rounded w-24 mb-3" />
                {shimmer}
              </div>
              
              {/* Value skeleton */}
              <div className="relative overflow-hidden">
                <div className="h-8 bg-white/20 rounded w-16 mb-2" />
                {shimmer}
              </div>
              
              {/* Subtitle skeleton */}
              <div className="relative overflow-hidden">
                <div className="h-3 bg-orange-200/15 rounded w-20" />
                {shimmer}
              </div>
              
              {/* Change indicator skeleton */}
              <div className="flex items-center mt-3">
                <div className="relative overflow-hidden">
                  <div className="h-4 w-4 bg-green-300/30 rounded mr-2" />
                  {shimmer}
                </div>
                <div className="relative overflow-hidden">
                  <div className="h-4 bg-green-300/30 rounded w-12" />
                  {shimmer}
                </div>
              </div>
            </div>

            {/* Icon skeleton */}
            <div className="ml-4">
              <div className="relative overflow-hidden">
                <div className="bg-white/20 rounded-lg p-3">
                  <div className="h-6 w-6 bg-white/30 rounded" />
                </div>
                {shimmer}
              </div>
            </div>
          </div>

          {/* Trend chart skeleton */}
          <div className="mt-4 flex items-end space-x-1 h-8">
            {[40, 60, 80, 45, 70, 55, 85].map((height, index) => (
              <div key={index} className="relative overflow-hidden flex-1">
                <div 
                  className="bg-white/20 rounded-sm min-h-[4px]"
                  style={{ height: `${height}%` }}
                />
                {shimmer}
              </div>
            ))}
          </div>
        </CardContent>
      </GlowCard>
    )
  }

  if (variant === 'chart') {
    return (
      <GlowCard className={`${className} animate-pulse`}>
        <CardContent className="p-6">
          {/* Title and controls skeleton */}
          <div className="flex items-center justify-between mb-4">
            <div className="relative overflow-hidden">
              <div className="h-5 bg-white/20 rounded w-32" />
              {shimmer}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative overflow-hidden">
                <div className="h-8 bg-white/15 rounded w-24" />
                {shimmer}
              </div>
              <div className="relative overflow-hidden">
                <div className="h-8 w-8 bg-orange-500/30 rounded-full" />
                {shimmer}
              </div>
            </div>
          </div>

          {/* Chart area skeleton */}
          <div className="relative overflow-hidden">
            <div className="h-40 bg-white/10 rounded-lg mb-4" />
            {shimmer}
          </div>

          {/* Stats skeleton */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative overflow-hidden">
              <div className="h-6 bg-white/20 rounded w-20 mb-1" />
              {shimmer}
            </div>
            <div className="relative overflow-hidden">
              <div className="h-4 bg-orange-200/15 rounded w-16" />
              {shimmer}
            </div>
          </div>
        </CardContent>
      </GlowCard>
    )
  }

  if (variant === 'table') {
    return (
      <GlowCard className={`${className} animate-pulse`}>
        <CardContent className="p-6">
          {/* Title skeleton */}
          <div className="relative overflow-hidden mb-6">
            <div className="h-6 bg-white/20 rounded w-40" />
            {shimmer}
          </div>

          {/* Table header skeleton */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="relative overflow-hidden">
                <div className="h-4 bg-orange-200/20 rounded w-full" />
                {shimmer}
              </div>
            ))}
          </div>

          {/* Table rows skeleton */}
          {[...Array(5)].map((_, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-4 gap-4 mb-3">
              {[...Array(4)].map((_, colIndex) => (
                <div key={colIndex} className="relative overflow-hidden">
                  <div className="h-4 bg-white/15 rounded w-full" />
                  {shimmer}
                </div>
              ))}
            </div>
          ))}
        </CardContent>
      </GlowCard>
    )
  }

  // Default skeleton
  return (
    <GlowCard className={`${className} animate-pulse`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="relative overflow-hidden">
            <div className="h-4 bg-white/20 rounded w-3/4" />
            {shimmer}
          </div>
          <div className="relative overflow-hidden">
            <div className="h-8 bg-white/30 rounded w-1/2" />
            {shimmer}
          </div>
          <div className="relative overflow-hidden">
            <div className="h-20 bg-white/10 rounded" />
            {shimmer}
          </div>
        </div>
      </CardContent>
    </GlowCard>
  )
}