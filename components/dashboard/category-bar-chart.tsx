'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from 'recharts';

interface CategoryData {
  category: string;
  count: number;
  color?: string;
}

interface CategoryBarChartProps {
  data: CategoryData[];
}

export function CategoryBarChart({ data }: CategoryBarChartProps) {
  const [mounted, setMounted] = React.useState(false);
  const { resolvedTheme } = useTheme();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-[240px] w-full animate-pulse rounded-lg bg-muted/20" />;
  }

  const isDark = resolvedTheme === 'dark';

  const categoryColorMap: Record<string, string> = {
    Features: isDark ? '#f4f4f5' : '#18181b',
    Bugs: isDark ? '#f43f5e' : '#e11d48',
    Improvements: isDark ? '#fbbf24' : '#d97706',
    Integrations: isDark ? '#a1a1aa' : '#52525b',
  };

  const total = data.reduce((acc, curr) => acc + curr.count, 0);

  if (total === 0) {
    return (
      <div className="flex h-[240px] w-full items-center justify-center text-xs text-muted-foreground border border-dashed rounded-lg bg-card font-mono">
        No category distribution data available yet.
      </div>
    );
  }

  return (
    <div className="h-[240px] w-full font-mono">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="2 2"
            vertical={false}
            stroke={isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}
          />
          <XAxis
            dataKey="category"
            stroke={isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'}
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)' }}
            dy={6}
          />
          <YAxis
            stroke={isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'}
            fontSize={11}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            dx={-2}
          />
          <Tooltip
            cursor={{ fill: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as CategoryData;
                const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
                const dotColor = categoryColorMap[item.category] || (isDark ? '#fff' : '#000');
                return (
                  <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-lg space-y-1 font-mono">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: dotColor }} />
                      <span className="font-bold text-popover-foreground">
                        {item.category}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4 text-muted-foreground text-[11px]">
                      <span>{item.count} items</span>
                      <span className="font-semibold text-foreground">{percentage}%</span>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={36}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={categoryColorMap[entry.category] || (isDark ? '#e4e4e7' : '#27272a')}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
