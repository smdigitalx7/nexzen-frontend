import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface ChartDataPoint {
  [key: string]: string | number;
}

interface BaseChartProps {
  title: string;
  description?: string;
  data: ChartDataPoint[];
  height?: number;
  className?: string;
}

interface LineChartProps extends BaseChartProps {
  type: 'line';
  lines: Array<{
    dataKey: string;
    name: string;
    stroke?: string;
    strokeWidth?: number;
  }>;
  xAxisKey: string;
  formatter?: (value: number) => string;
}

interface BarChartProps extends BaseChartProps {
  type: 'bar';
  bars: Array<{
    dataKey: string;
    name: string;
    fill?: string;
  }>;
  xAxisKey: string;
  formatter?: (value: number) => string;
}

interface PieChartProps extends BaseChartProps {
  type: 'pie';
  dataKey: string;
  nameKey: string;
  colors?: string[];
  formatter?: (value: number) => string;
}

export type DashboardChartProps = LineChartProps | BarChartProps | PieChartProps;

const DEFAULT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const DashboardChart: React.FC<DashboardChartProps> = ({
  title,
  description,
  data,
  height = 300,
  className,
  ...props
}) => {
  const renderChart = () => {
    if (props.type === 'line') {
      return (
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={props.xAxisKey} />
            <YAxis />
            <Tooltip formatter={props.formatter || ((value: number) => value.toString())} />
            {props.lines.map((line, index) => (
              <Line
                key={index}
                type="monotone"
                dataKey={line.dataKey}
                stroke={line.stroke || `#${Math.floor(Math.random() * 16777215).toString(16)}`}
                strokeWidth={line.strokeWidth || 2}
                name={line.name}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (props.type === 'bar') {
      return (
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={props.xAxisKey} />
            <YAxis />
            <Tooltip formatter={props.formatter || ((value: number) => value.toString())} />
            {props.bars.map((bar, index) => (
              <Bar
                key={index}
                dataKey={bar.dataKey}
                fill={bar.fill || `#${Math.floor(Math.random() * 16777215).toString(16)}`}
                name={bar.name}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (props.type === 'pie') {
      return (
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey={props.dataKey}
            >
              {data.map((entry, index) => {
                const colors = props.colors || DEFAULT_COLORS;
                return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
              })}
            </Pie>
            <Tooltip formatter={props.formatter || ((value: number) => formatCurrency(value))} />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    return null;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{renderChart()}</CardContent>
    </Card>
  );
};

export default DashboardChart;

