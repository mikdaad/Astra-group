"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Gem, DollarSign, PieChart, Award, Shield, BarChart3, Clock, Target } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient as createSupabaseClient } from "@/utils/supabase/client";

type InvestmentData = {
  totalPortfolioValue: number;
  goldHoldings: number;
  diamondHoldings: number;
  monthlyReturns: number;
  totalReturns: number;
  investmentGoal: number;
  riskProfile: string;
  goldWeight: number; // in grams
  diamondWeight: number; // in carats
};

type PriceData = {
  current: number;
  change24h: number;
  changePercent: number;
  high24h: number;
  low24h: number;
};

type RecentInvestment = {
  id: string;
  type: 'gold' | 'diamond';
  amount: number;
  weight: number;
  date: string;
  status: 'completed' | 'pending';
};

// Utility function for formatting Indian Rupees
function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

const mockInvestmentData: InvestmentData = {
  totalPortfolioValue: 2850000,
  goldHoldings: 1650000,
  diamondHoldings: 1200000,
  monthlyReturns: 142000,
  totalReturns: 425000,
  investmentGoal: 5000000,
  riskProfile: "Moderate Growth",
  goldWeight: 257.2, // grams
  diamondWeight: 26.7 // carats
};

const mockGoldPrice: PriceData = {
  current: 6420,
  change24h: 180,
  changePercent: 2.89,
  high24h: 6450,
  low24h: 6280
};

const mockDiamondPrice: PriceData = {
  current: 45000,
  change24h: -750,
  changePercent: -1.64,
  high24h: 46200,
  low24h: 44800
};

const mockRecentInvestments: RecentInvestment[] = [
  {
    id: '1',
    type: 'gold',
    amount: 25000,
    weight: 3.9,
    date: '2024-08-25',
    status: 'completed'
  },
  {
    id: '2',
    type: 'diamond',
    amount: 45000,
    weight: 1.0,
    date: '2024-08-24',
    status: 'completed'
  },
  {
    id: '3',
    type: 'gold',
    amount: 15000,
    weight: 2.3,
    date: '2024-08-23',
    status: 'pending'
  }
];

export default function GoldDiamondHomePage() {
  const [investmentData, setInvestmentData] = useState<InvestmentData>(mockInvestmentData);
  const [goldPrice, setGoldPrice] = useState<PriceData>(mockGoldPrice);
  const [diamondPrice, setDiamondPrice] = useState<PriceData>(mockDiamondPrice);
  const [recentInvestments, setRecentInvestments] = useState<RecentInvestment[]>(mockRecentInvestments);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createSupabaseClient();

  useEffect(() => {
    // Load investment data
    // In production, this would fetch from your API
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const portfolioProgress = useMemo(() => {
    return Math.min((investmentData.totalPortfolioValue / investmentData.investmentGoal) * 100, 100);
  }, [investmentData]);

  const goldAllocation = useMemo(() => {
    return (investmentData.goldHoldings / investmentData.totalPortfolioValue) * 100;
  }, [investmentData]);
  

  const diamondAllocation = useMemo(() => {
    return (investmentData.diamondHoldings / investmentData.totalPortfolioValue) * 100;
  }, [investmentData]);

  return (
    <div className="min-h-screen bg-transperant p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-white bg-clip-text text-transparent mb-4">
            Golden Diamond Investment
          </h1>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Premium investment opportunities in precious metals and gemstones. Build wealth with gold and diamonds.
          </p>

        </div>
        


        {/* Portfolio Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-amber-500 to-yellow-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm font-medium">Total Portfolio</p>
                  <p className="text-2xl font-bold">{formatINR(investmentData.totalPortfolioValue)}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span className="text-sm">+12.5% this month</span>
                  </div>
                </div>
                <PieChart className="w-8 h-8 text-amber-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-amber-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">Gold Holdings</p>
                  <p className="text-2xl font-bold">{formatINR(investmentData.goldHoldings)}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span className="text-sm">{investmentData.goldWeight}g • ₹{goldPrice.current}/g</span>
                  </div>
                </div>
                <Gem className="w-8 h-8 text-yellow-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Diamond Holdings</p>
                  <p className="text-2xl font-bold">{formatINR(investmentData.diamondHoldings)}</p>
                  <div className="flex items-center mt-2">
                    <TrendingDown className="w-4 h-4 mr-1" />
                    <span className="text-sm">{investmentData.diamondWeight}ct • ₹{diamondPrice.current}/ct</span>
                  </div>
                </div>
                <Award className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Monthly Returns</p>
                  <p className="text-2xl font-bold">{formatINR(investmentData.monthlyReturns)}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span className="text-sm">+8.3% return rate</span>
                  </div>
                </div>
                <DollarSign className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Investment Progress & Portfolio Allocation */}
          <Card className="lg:col-span-2 border-0 shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-6 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-amber-600" />
                Investment Overview
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Portfolio Progress */}
                <div>
                  <h4 className="text-lg font-medium mb-4">Investment Goal Progress</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Portfolio Goal</span>
                        <span>{portfolioProgress.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-amber-500 to-yellow-500 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${portfolioProgress}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Current: {formatINR(investmentData.totalPortfolioValue)}</span>
                        <span>Goal: {formatINR(investmentData.investmentGoal)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Portfolio Allocation */}
                <div>
                  <h4 className="text-lg font-medium mb-4">Asset Allocation</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                        <span className="text-sm">Gold</span>
                      </div>
                      <span className="text-sm font-medium">{goldAllocation.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                        <span className="text-sm">Diamonds</span>
                      </div>
                      <span className="text-sm font-medium">{diamondAllocation.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
                
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Returns</p>
                  <p className="text-2xl font-bold text-amber-600">{formatINR(investmentData.totalReturns)}</p>
                  <p className="text-sm text-green-600 mt-1">+15.2% overall</p>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Risk Profile</p>
                  <p className="text-xl font-semibold text-blue-600">{investmentData.riskProfile}</p>
                  <p className="text-sm text-blue-500 mt-1">Balanced growth</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Market Prices */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">Live Market Prices</h3>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Gem className="w-5 h-5 text-yellow-600 mr-2" />
                      <span className="font-medium">Gold (24K)</span>
                    </div>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-yellow-600 mb-1">₹{goldPrice.current}</p>
                  <p className="text-sm text-green-600 mb-2">+₹{goldPrice.change24h} ({goldPrice.changePercent}%)</p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div className="flex justify-between">
                      <span>High: ₹{goldPrice.high24h}</span>
                      <span>Low: ₹{goldPrice.low24h}</span>
                    </div>
                    <p>per gram • 24h change</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Award className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="font-medium">Diamond (1ct)</span>
                    </div>
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600 mb-1">₹{diamondPrice.current}</p>
                  <p className="text-sm text-red-600 mb-2">₹{diamondPrice.change24h} ({diamondPrice.changePercent}%)</p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div className="flex justify-between">
                      <span>High: ₹{diamondPrice.high24h}</span>
                      <span>Low: ₹{diamondPrice.low24h}</span>
                    </div>
                    <p>per carat • 24h change</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Investments & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Investments */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-gray-600" />
                Recent Investments
              </h3>
              <div className="space-y-3">
                {recentInvestments.map((investment) => (
                  <div key={investment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      {investment.type === 'gold' ? (
                        <Gem className="w-5 h-5 text-yellow-600 mr-3" />
                      ) : (
                        <Award className="w-5 h-5 text-blue-600 mr-3" />
                      )}
                      <div>
                        <p className="font-medium capitalize">{investment.type}</p>
                        <p className="text-sm text-gray-600">{investment.weight} {investment.type === 'gold' ? 'grams' : 'carats'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatINR(investment.amount)}</p>
                      <p className={`text-xs ${investment.status === 'completed' ? 'text-green-600' : 'text-orange-600'}`}>
                        {investment.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Button 
                className="w-full mt-4 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white"
                onClick={() => router.push('/investments')}
              >
                View All Investments
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-gray-600" />
                Quick Actions
              </h3>
              <div className="space-y-4">
                <Button 
                  onClick={() => router.push('/invest/gold')}
                  className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white p-4 h-auto flex flex-col items-center space-y-2"
                >
                  <Gem className="w-8 h-8" />
                  <span className="font-semibold">Invest in Gold</span>
                  <span className="text-sm opacity-90">Start from ₹1,000</span>
                </Button>
                
                <Button 
                  onClick={() => router.push('/invest/diamond')}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white p-4 h-auto flex flex-col items-center space-y-2"
                >
                  <Award className="w-8 h-8" />
                  <span className="font-semibold">Invest in Diamonds</span>
                  <span className="text-sm opacity-90">Certified gemstones</span>
                </Button>
                
                <Button 
                  onClick={() => router.push('/portfolio')}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white p-4 h-auto flex flex-col items-center space-y-2"
                >
                  <BarChart3 className="w-8 h-8" />
                  <span className="font-semibold">Portfolio Analytics</span>
                  <span className="text-sm opacity-90">Detailed insights</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Investment Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-yellow-50">
            <CardContent className="p-6 text-center">
              <Gem className="w-12 h-12 text-amber-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold mb-2">Premium Gold</h4>
              <p className="text-gray-600 text-sm">Invest in 24K gold with guaranteed purity and secure storage. Start with as low as ₹1,000.</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardContent className="p-6 text-center">
              <Award className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold mb-2">Certified Diamonds</h4>
              <p className="text-gray-600 text-sm">Investment-grade diamonds with international certification. Build a sparkling portfolio.</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="p-6 text-center">
              <Shield className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold mb-2">Secure Returns</h4>
              <p className="text-gray-600 text-sm">Enjoy consistent returns with our expertly managed precious metals and gemstone portfolio.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}