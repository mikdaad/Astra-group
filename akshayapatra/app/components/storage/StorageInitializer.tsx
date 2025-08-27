"use client";

import { useEffect } from 'react';

/**
 * Component to initialize storage service on app start
 * Runs cleanup of stale data and initializes storage utilities
 */
export default function StorageInitializer() {
  useEffect(() => {
    const initializeStorage = async () => {
      try {
        const { initializeStorage } = await import('@/utils/storage/profileStorage');
        initializeStorage();
      } catch (error) {
        console.warn('Failed to initialize storage service:', error);
      }
    };

    initializeStorage();
  }, []);

  // This component doesn't render anything
  return null;
}
