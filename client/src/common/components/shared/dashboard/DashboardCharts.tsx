import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import { cn } from '@/common/utils';

interface ChartConfig {
  title: string;
  description?: string;
  data: any[];
  type: "line" | "bar" | "pie" | "area";
  dataKey: string;
  xAxisKey?: string;
  color?: string;
  height?: number;
  className?: string;
}

interface DashboardChartsProps {
  charts: ChartConfig[];
  className?: string;
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  charts,
  className,
}) => {
  return (
    <div className={cn("space-y-6", className)}>
      {charts.map((chart, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle>{chart.title}</CardTitle>
            {chart.description && (
              <p className="text-sm text-muted-foreground">
                {chart.description}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <div 
              className="w-full"
              style={{ height: chart.height || 300 }}
            >
              {/* Chart implementation would go here */}
              <div className="flex items-center justify-center h-full bg-muted rounded">
                <p className="text-muted-foreground">
                  Chart: {chart.type} - {chart.title}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardCharts;
