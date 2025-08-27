'use client';

import React, { useId, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, IndianRupee, PieChart, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useData } from '@/app/lib/contexts/DataContext';
import { Borderlesscard } from '@/components/ui/card';

interface DashboardCardProps {
  title: string;
  amount: string;
  icon: React.ReactNode;
  isLoading?: boolean;
  onRefresh?: () => void;
  children?: React.ReactNode;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ 
  title, 
  amount, 
  icon, 
  isLoading = false, 
  onRefresh,
  children 
}) => (
  <Borderlesscard
    className="w-full h-[160px] sm:h-[176px] lg:h-[196px] text-white overflow-hidden rounded-2xl  shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
    style={{
      backgroundImage:
        'var(--astra-background, linear-gradient(355deg, #090300 3.07%, #351603 54.29%, #6E2B00 76.89%, #CA5002 97.23%))',
    }}
  >
    <div className="grid grid-cols-[1fr_160px] sm:grid-cols-[1fr_200px] h-full">
      <CardHeader className="pb-2 pr-6 sm:pr-10 relative z-10">
        <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-white/20 rounded-sm flex items-center justify-center">
            {icon}
          </div>
          <CardTitle className=" text-white">{title}</CardTitle>
        </div>
          {onRefresh && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-white/70 hover:text-white hover:bg-white/10"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          )}
        </div>
        <div className="text-xl sm:text-2xl font-bold font-['Poppins'] text-white mt-1">
        {isLoading ? (
          <div className="animate-pulse bg-white/20 h-8 w-32 rounded"></div>
        ) : (
          amount
        )}
        </div>
      </CardHeader>
      <CardContent className="p-3 flex items-center justify-center">
        {isLoading ? (
          <div className="animate-pulse bg-white/20 h-24 w-24 rounded"></div>
        ) : (
          children
        )}
      </CardContent>
    </div>
  </Borderlesscard>
);

interface DonutMiniProps {
  directPercentage: number;
  indirectPercentage: number;
  totalAmount: number;
}

const DonutMini: React.FC<DonutMiniProps> = ({ directPercentage, indirectPercentage, totalAmount }) => {
  // Map to the donut's expected segments: blue (Direct), yellow (Indirect), orange (remainder)
  const safe = (n: number) => Math.max(0, Math.min(100, Number.isFinite(n) ? n : 0));
  const bluePct = safe(directPercentage);
  const yellowPct = safe(indirectPercentage);
  const remainder = Math.max(0, 100 - (bluePct + yellowPct));
  const percents = {
    blue: bluePct,
    yellow: yellowPct,
    orange: remainder,
  };

  return (
    <div className="w-[88px] h-[88px] sm:w-[104px] sm:h-[104px]">
      <ExactDonutMini value={totalAmount} percents={percents} size={96} strokeWidth={10} />
      <div className="mt-1 flex items-center gap-1 text-[8px] text-white/70">
        <span className="inline-block w-2 h-2 bg-blue-500 rounded-full" />
        <span>Direct</span>
        <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full" />
        <span>Indirect</span>
      </div>
    </div>
  );
};

type PercentMap = { blue: number; yellow: number; orange: number };
type DonutProps = { value: number; percents: PercentMap; size?: number; strokeWidth?: number; className?: string };

function ExactDonutMini({ value, percents, size = 96, strokeWidth = 10, className }: DonutProps) {
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const center = size / 2;

  const raw = [percents.blue || 0, percents.yellow || 0, percents.orange || 0].map((n) => Math.max(0, Number.isFinite(n) ? n : 0));
  const sum = raw.reduce((a, b) => a + b, 0) || 1;
  const norm = raw.map((n) => n / sum);

  const layout = useMemo(() => {
    const out: { len: number; off: number }[] = [];
    let acc = 0;
    for (let i = 0; i < norm.length; i++) {
      const fullLen = norm[i] * c;
      const visibleLen = Math.max(0, fullLen - 1.5);
      out.push({ len: visibleLen, off: acc });
      acc += fullLen + 1.5;
    }
    return out.map(({ len, off }) => ({ len, off: off % c }));
  }, [norm, c]);

  const uid = useId();
  const gid = (n: string) => `${n}-${uid}`;

  const BLUE_A = '#335CFF', BLUE_B = '#1F3799';
  const YEL_A = '#FFC727', YEL_B = '#B88A09';
  const ORG_A = '#ED7A2A', ORG_B = '#9C480C', ORG_C = '#874618';

  const [blue, yellow, orange] = layout;

  const formatted = useMemo(() => `₹${(value / 1000).toFixed(1)}k`, [value]);

  const Arc = ({ stroke, len, off }: { stroke: string; len: number; off: number }) => (
    <circle
      cx={center}
      cy={center}
      r={r}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeDasharray={`${len} ${Math.max(0, c - len)}`}
      strokeDashoffset={off}
      transform={`rotate(-90 ${center} ${center})`}
    />
  );

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={className}>
      <defs>
        <linearGradient id={gid('gradBlue')} gradientUnits="userSpaceOnUse" x1={size * 0.2} y1={size * 0.85} x2={size * 0.75} y2={size * 0.1}>
          <stop offset="0%" stopColor={BLUE_A} />
          <stop offset="100%" stopColor={BLUE_B} />
        </linearGradient>
        <linearGradient id={gid('gradYellow')} gradientUnits="userSpaceOnUse" x1={size * 0.15} y1={size * 0.45} x2={size * 0.8} y2={size * 0.95}>
          <stop offset="0%" stopColor={YEL_A} />
          <stop offset="100%" stopColor={YEL_B} />
        </linearGradient>
        <linearGradient id={gid('gradOrange')} gradientUnits="userSpaceOnUse" x1={size * 0.88} y1={size * 0.7} x2={size * 0.68} y2={size * 0.05}>
          <stop offset="0%" stopColor={ORG_A} />
          <stop offset="46%" stopColor={ORG_B} />
          <stop offset="100%" stopColor={ORG_C} />
        </linearGradient>
      </defs>

      <circle cx={center} cy={center} r={r} fill="none" stroke="#ED7A2A" strokeWidth={strokeWidth} opacity="0.15" />
      {blue?.len > 0 && <Arc stroke={`url(#${gid('gradBlue')})`} len={blue.len} off={blue.off} />}
      {yellow?.len > 0 && <Arc stroke={`url(#${gid('gradYellow')})`} len={yellow.len} off={yellow.off} />}
      {orange?.len > 0 && <Arc stroke={`url(#${gid('gradOrange')})`} len={orange.len} off={orange.off} />}

      <circle cx={center} cy={center} r={r - strokeWidth / 2 + 0.5} fill="white" />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fontSize={12} fontWeight={700} fill="#0F172A">
        {formatted}
      </text>
    </svg>
  );
}

interface LineChartProps {
  data: Array<{ month: string; value: number }>;
}

const LineChartComponent: React.FC<LineChartProps> = ({ data }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;
  const maxIndex = data.findIndex(d => d.value === maxValue);

  const generatePath = () => {
    if (data.length === 0) return '';
    
    const points = data.map((item, index) => {
      const x = 10 + (index * (160 / Math.max(1, data.length - 1)));
      const y = 40 - ((item.value - minValue) / range) * 25;
      return `${x},${y}`;
    });
    
    return `M${points.join(' L')}`;
  };

  return (
    <div className="w-[180px] h-[72px] sm:w-[200px] sm:h-[80px]">
      <svg width="200" height="80" viewBox="0 0 200 80" className="overflow-visible">
        <defs>
          <linearGradient id="lineGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fff" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#fff" stopOpacity={1} />
          </linearGradient>
          <linearGradient id="fillGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.0)" />
          </linearGradient>
        </defs>
        
        {/* Line */}
        <path
          d={generatePath()}
          stroke="url(#lineGradient2)"
          strokeWidth="2"
          fill="none"
          className="drop-shadow-sm"
        />
        {/* Dotted baseline */}
        <path
          d={generatePath()}
          stroke="#ffffff55"
          strokeWidth="1"
          fill="none"
          strokeDasharray="3 4"
        />
        
        {/* Data points */}
        {data.map((item, index) => {
          const x = 10 + (index * (160 / Math.max(1, data.length - 1)));
          const y = 40 - ((item.value - minValue) / range) * 25;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="2"
              fill="#fff"
              className="drop-shadow-sm"
            >
              <title>₹{item.value.toLocaleString()} in {item.month}</title>
            </circle>
          );
        })}
        {/* Highlight max point */}
        {(() => {
          const x = 10 + (maxIndex * (160 / Math.max(1, data.length - 1)));
          const y = 40 - ((maxValue - minValue) / range) * 25;
          return (
            <g>
              <circle cx={x} cy={y} r="3" fill="#3CD856" />
              <text x={x - 10} y={y - 6} fill="#3CD856" fontSize="6">₹{maxValue.toLocaleString()}</text>
            </g>
          );
        })()}
      </svg>
      
      {/* Month labels */}
      <div className="mt-1 w-full flex justify-between text-[8px] text-white/60 px-1">
        {data.slice(0, 6).map((item, index) => (
          <span key={index}>{item.month}</span>
        ))}
      </div>
    </div>
  );
};

interface BarChartProps {
  data: Array<{ 
    month: string; 
    values: [number, number, number]; // Three values per month
  }>;
}

const BarChartComponent: React.FC<BarChartProps> = ({ data }) => {
  const allValues = data.flatMap(d => d.values);
  const maxHeight = Math.max(...allValues);
  const colors = ['#FF6B35', '#F7931E', '#FFD23F']; // Orange gradient colors

  return (
    <div className="w-[180px] h-[72px] sm:w-[200px] sm:h-[80px]">
      <div className="flex items-end justify-between h-12 px-1">
        {data.map((item, monthIndex) => (
          <div key={monthIndex} className="flex items-end gap-0.5 group cursor-pointer">
            {item.values.map((value, barIndex) => (
              <div
                key={barIndex}
                className="w-2 rounded-sm transition-all duration-300 hover:opacity-80"
                style={{ 
                  height: `${(value / maxHeight) * 35}px`,
                  backgroundImage: 'linear-gradient(to top, #FF6B35, #FFD199)'
                }}
                title={`₹${value.toLocaleString()} in ${item.month}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-1 w-full flex justify-between text-[8px] text-white/60 px-1">
        {data.map((item, index) => (
          <span key={index}>{item.month}</span>
        ))}
      </div>
    </div>
  );
};

export default function DashboardCards() {
  const { 
    dashboardData, 
    lineChartData, 
    barChartData, 
    isLoading, 
    refreshData 
  } = useData();

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  // Transform bar chart data to include three values per month
  const transformedBarData = barChartData.map(item => ({
    month: item.month,
    values: [
      item.value, 
      item.value * 0.8, 
      item.value * 0.6
    ] as [number, number, number]
  }));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 px-1">
      <DashboardCard
        title="Total Income"
        amount={formatCurrency(dashboardData.totalIncome)}
        icon={<PieChart className="w-4 h-4 text-white" />}
        isLoading={isLoading}
        onRefresh={refreshData}
      >
        <DonutMini
          directPercentage={dashboardData.directCommission > 0 || dashboardData.indirectCommission > 0
            ? (dashboardData.directCommission / (dashboardData.directCommission + dashboardData.indirectCommission)) * 100
            : 0}
          indirectPercentage={dashboardData.directCommission > 0 || dashboardData.indirectCommission > 0
            ? (dashboardData.indirectCommission / (dashboardData.directCommission + dashboardData.indirectCommission)) * 100
            : 0}
          totalAmount={dashboardData.totalIncome}
        />
      </DashboardCard>

      <DashboardCard
        title="Direct Commission"
        amount={formatCurrency(dashboardData.directCommission)}
        icon={<TrendingUp className="w-4 h-4 text-white" />}
        isLoading={isLoading}
        onRefresh={refreshData}
      >
        <LineChartComponent data={lineChartData} />
      </DashboardCard>

      <DashboardCard
        title="In-Direct Commission"
        amount={formatCurrency(dashboardData.indirectCommission)}
        icon={<IndianRupee className="w-4 h-4 text-white" />}
        isLoading={isLoading}
        onRefresh={refreshData}
      >
        <BarChartComponent data={transformedBarData} />
      </DashboardCard>
    </div>
  );
}
