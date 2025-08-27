'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { DataProvider } from '@/app/lib/contexts/DataContext';
import { PageLoaderOverlay } from '@/app/components/general/PageLoader';
// Header and Sidebar are now provided globally from app/layout on desktop
import DashboardCards from './DashboardCards';
import TeamManagement from './TeamManagement';
import DataTable from './DataTable';
import TeamTab from './TeamTab';

const tabOptions = [
  { id: 'overview', label: 'Overview' },
  { id: 'segmented', label: 'Segmented' },
  { id: 'lead-funnel', label: 'Lead Funnel' },
  { id: 'team', label: 'Team' },
  { id: 'account', label: 'Account' },
];

export default function Homepage() {
  const [activeTab, setActiveTab] = React.useState('overview');
  const [isLoading, setIsLoading] = React.useState(true);

  // Simulate initial loading (replace with actual data fetching logic)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // 2 second loading simulation

    return () => clearTimeout(timer);
  }, []);

  const handleTabChange = (tabId: string) => {
    setIsLoading(true);
    setActiveTab(tabId);
    
    // Simulate tab loading (replace with actual data fetching)
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };

  return (
    <DataProvider>
      <div
        className="min-h-screen relative overflow-y-auto overflow-x-hidden"
       
      >
        {/* Loading Overlay */}
        {isLoading && (
          <PageLoaderOverlay 
            text="A S T R A" 
            duration={1.5}
          />
        )}

        {/* Main Content */}
        <div className="">
          {/* Tab Navigation */}
          <div className="lg:mt-0 mt-2 hide-scrollbar-mobile w-full sm:w-[523px] h-9 mb-6 sm:mb-8 bg-white rounded-2xl p-1 flex items-center gap-1 overflow-x-auto no-scrollbar">
            {tabOptions.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                size="sm"
                className={
                  activeTab === tab.id
                    ? 'h-7 bg-gradient-to-b from-orange-600 to-amber-800 text-white hover:opacity-90'
                    : 'h-7 text-orange-600 hover:bg-gray-100'
                }
                onClick={() => handleTabChange(tab.id)}
                disabled={isLoading}
              >
                {tab.label}
              </Button>
            ))}
          </div>


          {/* Tab Content */}
          {activeTab === 'overview' && (
            <>
              <DashboardCards />
              <TeamManagement />
              <DataTable />
            </>
          )}

          {activeTab === 'segmented' && (
            <div className="text-white text-center py-20">
              <h2 className="text-2xl font-bold mb-4">Segmented View</h2>
              <p className="text-white/70">
                Segmented analytics and reporting will be displayed here.
              </p>
            </div>
          )}

          {activeTab === 'lead-funnel' && (
            <div className="text-white text-center py-20">
              <h2 className="text-2xl font-bold mb-4">Lead Funnel</h2>
              <p className="text-white/70">
                Lead funnel visualization and analytics will be displayed here.
              </p>
            </div>
          )}

          {activeTab === 'team' && <TeamTab />}

          {activeTab === 'account' && (
            <div className="text-white text-center py-20">
              <h2 className="text-2xl font-bold mb-4">Account Management</h2>
              <p className="text-white/70">
                Account settings and management tools will be displayed here.
              </p>
            </div>
          )}
        </div>
      </div>
    </DataProvider>
  );
}
