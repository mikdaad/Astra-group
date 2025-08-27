'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Download, Plus, Search } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  mobile: string;
  address: string;
  totalInvestment: number;
  rank: string;
  dateOfJoining: string;
  status: 'Active' | 'In-Active';
}

interface TeamStatsData {
  activePercentage: number;
  totalActive: number;
  monthlyData: Array<{ month: string; value: number }>;
  radialData: Array<{ month: string; percentage: number }>;
}

const TeamLineChart: React.FC<{ data: Array<{ month: string; value: number }> }> = ({ data }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  const generatePath = () => {
    if (data.length === 0) return '';
    
    const points = data.map((item, index) => {
      const x = 20 + (index * (480 / Math.max(1, data.length - 1)));
      const y = 80 - ((item.value - minValue) / range) * 60;
      return `${x},${y}`;
    });
    
    return `M${points.join(' L')}`;
  };

  const generateDottedPath = () => {
    if (data.length === 0) return '';
    
    const points = data.map((item, index) => {
      const x = 20 + (index * (480 / Math.max(1, data.length - 1)));
      const y = 100 - ((item.value * 0.8 - minValue) / range) * 60;
      return `${x},${y}`;
    });
    
    return `M${points.join(' L')}`;
  };

  return (
    <div className="w-full h-32">
      <svg width="100%" height="120" viewBox="0 0 520 120" className="overflow-visible">
        <defs>
          <linearGradient id="teamLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fff" stopOpacity={1} />
            <stop offset="100%" stopColor="#fff" stopOpacity={0.8} />
          </linearGradient>
        </defs>
        
        {/* Dotted line */}
        <path
          d={generateDottedPath()}
          stroke="#fff"
          strokeWidth="2"
          fill="none"
          strokeDasharray="5,5"
          opacity={0.6}
        />
        
        {/* Main line */}
        <path
          d={generatePath()}
          stroke="url(#teamLineGradient)"
          strokeWidth="3"
          fill="none"
        />
        
        {/* Data points */}
        {data.map((item, index) => {
          const x = 20 + (index * (480 / Math.max(1, data.length - 1)));
          const y = 80 - ((item.value - minValue) / range) * 60;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="4"
              fill="#fff"
              className="drop-shadow-sm"
            />
          );
        })}
      </svg>
      
      {/* Month labels */}
      <div className="flex justify-between text-sm text-white/70 px-5 mt-2">
        {data.map((item, index) => (
          <span key={index}>{item.month}</span>
        ))}
      </div>
    </div>
  );
};

const TeamDonutChart: React.FC<{ activePercentage: number; totalActive: number }> = ({ 
  activePercentage, 
  totalActive 
}) => {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${(activePercentage / 100) * circumference} ${circumference}`;

  return (
    <div className="relative w-40 h-40 flex items-center justify-center">
      <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 140 140">
        {/* Background circle */}
        <circle
          cx="70"
          cy="70"
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="12"
          fill="transparent"
        />
        {/* Progress arc */}
        <circle
          cx="70"
          cy="70"
          r={radius}
          stroke="#4A90E2"
          strokeWidth="12"
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-in-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
        <div className="text-2xl font-bold">{totalActive}</div>
        <div className="text-sm opacity-70">Active</div>
      </div>
    </div>
  );
};

const TeamRadialChart: React.FC<{ data: Array<{ month: string; percentage: number }> }> = ({ data }) => {
  const centerX = 80;
  const centerY = 80;
  const baseRadius = 25;
  
  return (
    <div className="relative w-40 h-40">
      <svg className="w-40 h-40" viewBox="0 0 160 160">
        {data.map((item, index) => {
          const angle = (index * 30) - 90; // 30 degrees apart, starting from top
          const radius = baseRadius + (item.percentage / 100) * 40;
          const x = centerX + radius * Math.cos(angle * Math.PI / 180);
          const y = centerY + radius * Math.sin(angle * Math.PI / 180);
          
          return (
            <g key={index}>
              {/* Line from center */}
              <line
                x1={centerX}
                y1={centerY}
                x2={x}
                y2={y}
                stroke="#4A90E2"
                strokeWidth="3"
                className="opacity-80"
              />
              {/* End point */}
              <circle
                cx={x}
                cy={y}
                r="4"
                fill="#4A90E2"
              />
            </g>
          );
        })}
        
        {/* Center circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r="8"
          fill="#fff"
        />
      </svg>
      
      {/* Center value */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
        <div className="text-lg font-bold">17%</div>
        <div className="text-xs opacity-70">Jun</div>
      </div>
      
      {/* Month labels around the chart */}
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-xs text-white/60">Feb</div>
      <div className="absolute top-8 right-4 text-xs text-white/60">Mar</div>
      <div className="absolute bottom-8 right-4 text-xs text-white/60">Apr</div>
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-white/60">May</div>
      <div className="absolute bottom-8 left-4 text-xs text-white/60">Jun</div>
    </div>
  );
};

const TeamMemberCard: React.FC<{ member: TeamMember }> = ({ member }) => (
  <Card className="bg-gradient-to-br from-orange-600 to-orange-800 border-orange-500/30 text-white">
    <CardContent className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {member.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <h4 className="font-semibold text-white">{member.name}</h4>
            <p className="text-sm text-orange-100">Mob No: {member.mobile}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          member.status === 'Active' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          {member.status}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-orange-200">Address</p>
          <p className="text-white font-medium">{member.address}</p>
        </div>
        <div>
          <p className="text-orange-200">Total Investment</p>
          <p className="text-white font-medium">₹ {member.totalInvestment.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-orange-200">Rank</p>
          <p className="text-white font-medium">{member.rank}</p>
        </div>
        <div>
          <p className="text-orange-200">Date of Joining</p>
          <p className="text-white font-medium">{member.dateOfJoining}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const TeamTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Direct' | 'Indirect'>('Direct');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data
  const teamStats: TeamStatsData = {
    activePercentage: 57,
    totalActive: 22.6,
    monthlyData: [
      { month: 'Jan', value: 45 },
      { month: 'Feb', value: 52 },
      { month: 'Mar', value: 48 },
      { month: 'Apr', value: 58 },
      { month: 'May', value: 55 },
      { month: 'Jun', value: 57 }
    ],
    radialData: [
      { month: 'Feb', percentage: 85 },
      { month: 'Mar', percentage: 72 },
      { month: 'Apr', percentage: 68 },
      { month: 'May', percentage: 45 },
      { month: 'Jun', percentage: 92 }
    ]
  };

  const teamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'Kishor Behera',
      mobile: '+91- 1234567890',
      address: 'Bangalore, India',
      totalInvestment: 20000,
      rank: 'Silver',
      dateOfJoining: '20-06-2025',
      status: 'Active'
    },
    {
      id: '2',
      name: 'Kishor Behera',
      mobile: '+91- 1234567890',
      address: 'Bangalore, India',
      totalInvestment: 20000,
      rank: 'Silver',
      dateOfJoining: '20-06-2025',
      status: 'Active'
    },
    {
      id: '3',
      name: 'Kishor Behera',
      mobile: '+91- 1234567890',
      address: 'Bangalore, India',
      totalInvestment: 20000,
      rank: 'Silver',
      dateOfJoining: '20-06-2025',
      status: 'Active'
    },
    {
      id: '4',
      name: 'Kishor Behera',
      mobile: '+91- 1234567890',
      address: 'Bangalore, India',
      totalInvestment: 20000,
      rank: 'Silver',
      dateOfJoining: '20-06-2025',
      status: 'Active'
    },
    {
      id: '5',
      name: 'Santosh Sah',
      mobile: '+91- 8712345678',
      address: 'Bangalore, India',
      totalInvestment: 15000,
      rank: 'Bronze',
      dateOfJoining: '15-05-2025',
      status: 'In-Active'
    },
    {
      id: '6',
      name: 'Santosh Sah',
      mobile: '+91- 8712345678',
      address: 'Bangalore, India',
      totalInvestment: 15000,
      rank: 'Bronze',
      dateOfJoining: '15-05-2025',
      status: 'In-Active'
    },
    {
      id: '7',
      name: 'Santosh Sah',
      mobile: '+91- 8712345678',
      address: 'Bangalore, India',
      totalInvestment: 15000,
      rank: 'Bronze',
      dateOfJoining: '15-05-2025',
      status: 'In-Active'
    },
    {
      id: '8',
      name: 'Santosh Sah',
      mobile: '+91- 8712345678',
      address: 'Bangalore, India',
      totalInvestment: 15000,
      rank: 'Bronze',
      dateOfJoining: '15-05-2025',
      status: 'In-Active'
    }
  ];

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.mobile.includes(searchTerm) ||
    member.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card className="border-orange-600/30 text-white"
        style={{
          background: 'linear-gradient(to top, #090300, #351603, #6E2B00, #CA5002)'
        }}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-white">Team Management</CardTitle>
              <p className="text-sm text-orange-200 mt-1">
                Keep tabs on your leads performance from every angle of Team management.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Calendar className="w-4 h-4 mr-2" />
                December 2025
              </Button>
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button size="icon" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <div className="w-4 h-4 border border-white rounded-sm"></div>
              </Button>
            </div>
          </div>
          
          {/* Tabs and Controls */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex gap-2">
              <Button
                variant={activeTab === 'Direct' ? 'default' : 'outline'}
                className={activeTab === 'Direct' 
                  ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                }
                onClick={() => setActiveTab('Direct')}
              >
                Direct
              </Button>
              <Button
                variant={activeTab === 'Indirect' ? 'default' : 'outline'}
                className={activeTab === 'Indirect' 
                  ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                }
                onClick={() => setActiveTab('Indirect')}
              >
                Indirect
              </Button>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                This Month
              </Button>
              <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                New Segment
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart Card - 57% Active */}
        <Card className="border-orange-600/30 text-white relative overflow-hidden"
          style={{
            background: 'linear-gradient(to bottom right, #CA5002, #6E2B00, #351603)'
          }}>
          <CardContent className="p-6 h-48">
            <div className="absolute top-6 left-6">
              <h3 className="text-4xl font-bold">57%</h3>
              <p className="text-sm text-white/70">Active</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-32">
              <svg width="100%" height="100%" viewBox="0 0 400 120" className="overflow-visible">
                <defs>
                  <linearGradient id="lineGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#fff" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#fff" stopOpacity={1} />
                  </linearGradient>
                </defs>
                
                {/* Dotted line */}
                <path
                  d="M20,90 L80,75 L140,85 L200,70 L260,80 L320,65 L380,70"
                  stroke="#fff"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray="4,4"
                  opacity={0.5}
                />
                
                {/* Main line */}
                <path
                  d="M20,70 L80,55 L140,65 L200,45 L260,60 L320,40 L380,50"
                  stroke="url(#lineGradient1)"
                  strokeWidth="3"
                  fill="none"
                />
                
                {/* Data points */}
                <circle cx="20" cy="70" r="3" fill="#fff" />
                <circle cx="80" cy="55" r="3" fill="#fff" />
                <circle cx="140" cy="65" r="3" fill="#fff" />
                <circle cx="200" cy="45" r="3" fill="#fff" />
                <circle cx="260" cy="60" r="3" fill="#fff" />
                <circle cx="320" cy="40" r="3" fill="#fff" />
                <circle cx="380" cy="50" r="3" fill="#fff" />
              </svg>
              
              {/* Month labels */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-white/60 px-6">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Donut Chart Card - 22.6 Active */}
        <Card className="border-orange-600/30 text-white relative overflow-hidden"
          style={{
            background: 'linear-gradient(to bottom right, #CA5002, #6E2B00, #351603)'
          }}>
          <CardContent className="p-6 h-48">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-4xl font-bold">22.6</h3>
                <p className="text-sm text-white/70">Active</p>
              </div>
              <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">+2.2%</span>
            </div>
            
            {/* Donut Chart */}
            <div className="absolute bottom-4 right-4 w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="35"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Blue segment */}
                <circle
                  cx="50"
                  cy="50"
                  r="35"
                  stroke="#4A90E2"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="60 280"
                  strokeDashoffset="0"
                  strokeLinecap="round"
                />
                {/* Orange segment */}
                <circle
                  cx="50"
                  cy="50"
                  r="35"
                  stroke="#FF8C00"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="50 280"
                  strokeDashoffset="-60"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            
            {/* Legend */}
            <div className="absolute bottom-4 left-6 space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-white/80">Jan 35.8%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-white/80">Feb 16.2%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-white/80">Mar 15.3%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-white/80">Apr 11.4%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-white/80">May 6.7%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                <span className="text-white/80">Jun 9.7%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Radial Chart Card - 5.42 In Active */}
        <Card className="border-orange-600/30 text-white relative overflow-hidden"
          style={{
            background: 'linear-gradient(to bottom right, #CA5002, #6E2B00, #351603)'
          }}>
          <CardContent className="p-6 h-48">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-4xl font-bold">5.42</h3>
                <p className="text-sm text-white/70">In Active</p>
              </div>
              <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">+3.7%</span>
            </div>
            
            {/* Radial/Sunburst Chart */}
            <div className="absolute bottom-4 right-4 w-28 h-28">
              <svg className="w-28 h-28" viewBox="0 0 120 120">
                {/* Center circle */}
                <circle
                  cx="60"
                  cy="60"
                  r="8"
                  fill="#fff"
                />
                
                {/* Radial spokes */}
                {[...Array(12)].map((_, index) => {
                  const angle = (index * 30) - 90;
                  const length = 15 + Math.random() * 25;
                  const x1 = 60 + 15 * Math.cos(angle * Math.PI / 180);
                  const y1 = 60 + 15 * Math.sin(angle * Math.PI / 180);
                  const x2 = 60 + length * Math.cos(angle * Math.PI / 180);
                  const y2 = 60 + length * Math.sin(angle * Math.PI / 180);
                  
                  return (
                    <g key={index}>
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#4A90E2"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      <circle
                        cx={x2}
                        cy={y2}
                        r="2"
                        fill="#4A90E2"
                      />
                    </g>
                  );
                })}
              </svg>
              
              {/* Center value */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-lg font-bold text-white">17%</div>
                <div className="text-xs text-white/70">Jun</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Search team members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-gray-800 border-gray-700 text-white"
        />
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredMembers.map((member) => (
          <TeamMemberCard key={member.id} member={member} />
        ))}
      </div>
    </div>
  );
};

export default TeamTab;
