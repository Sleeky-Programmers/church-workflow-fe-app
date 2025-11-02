import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, ChevronDown } from 'lucide-react';

export const StatCard = ({
  title,
  count,
  growth,
  growthText,
  statFilter,
}: {
  title: string;
  count: string;
  growth: string;
  growthText?: string;
  statFilter?: string;
}) => {
  const isPositiveGrowth = growth.startsWith('+');
  const Icon = isPositiveGrowth ? TrendingUp : TrendingDown;

  return (
    <Card className="w-[260px] h-[150px] bg-[#E7EFF7] shadow-none rounded-3xl overflow-hidden">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg leading-tight">
              {title}
            </h3>
            {statFilter &&
              <div className='flex items-center justify-center gap-1 cursor-pointer'>
                <p className="text-sm">{statFilter}</p>
                <ChevronDown className="w-4 h-4" />
              </div>
            }
          </div>

          <div className="flex items-center justify-between">
            <p className="text-3xl font-bold tracking-tight">
              {count}
            </p>

            <div className="text-sm flex items-end justify-between flex-col gap-1">
              {growthText && <p>{growthText}</p>}
              <p>{growth}</p>
            </div>

            <div className={`${isPositiveGrowth ? "bg-success-500" : "bg-destructive-500"} rounded-xl p-2 flex items-center justify-center`}>
              <Icon className="w-5 h-5" color='#ffffff' strokeWidth={2.5} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
