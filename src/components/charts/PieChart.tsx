import React from 'react';
import EChartsBase, { EChartsBaseProps } from './EChartsBase';
import type { EChartsOption } from 'echarts';

export interface PieChartProps extends Omit<EChartsBaseProps, 'option'> {
  data: Array<{ name: string; value: number; color?: string }>;
  title?: string;
  showLabels?: boolean;
  showPercentage?: boolean;
  radius?: [string, string];
  colors?: string[];
}

const githubColors = [
  '#24292e',
  '#6e5494',
  '#2ea44f',
  '#f6f8fa',
  '#0366d6',
  '#d73a49',
  '#ffd33d',
  '#e36209',
];

export default function PieChart({
  data,
  title,
  showLabels = true,
  showPercentage = true,
  radius = ['40%', '70%'],
  colors = githubColors,
  ...chartProps
}: PieChartProps) {
  // Handle empty data
  if (!data || data.length === 0) {
    const option: EChartsOption = {
      title: {
        text: 'No Data Available',
        left: 'center',
        top: 'middle',
        textStyle: {
          fontSize: 16,
          fontWeight: 'normal',
          color: '#9ca3af'
        }
      }
    };
    return <EChartsBase option={option} {...chartProps} />;
  }

  const dataWithColors = data.map((item, index) => ({
    ...item,
    itemStyle: {
      color: item.color || colors[index % colors.length]
    }
  }));

  const option: EChartsOption = {
    title: undefined,
    tooltip: {
      trigger: 'item',
      formatter: (params: unknown) => {
        const p = params as { name?: string; value?: number; percent?: number };
        const name = p.name || '';
        const value = p.value || 0;
        const percent = p.percent || 0;
        return `${name}<br/>${value} (${percent}%)`;
      }
    },
    legend: {
      type: 'scroll',
      orient: 'horizontal',
      left: 'center',
      top: title ? 40 : 10,
      data: data.map(item => item.name)
    },
    series: [
      {
        type: 'pie',
        radius,
        center: ['50%', '50%'],
        data: dataWithColors,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: showLabels ? {
          formatter: showPercentage
            ? '{b}\n{d}%'
            : '{b}',
          fontSize: 12,
          color: '#ffffff'
        } : {
          show: false
        },
        labelLine: {
          show: showLabels
        }
      }
    ]
  };

  return (
    <div className="w-full flex flex-col items-center">
      {title && (
        <h2 className="text-center text-lg font-bold mb-2">{title}</h2>
      )}
      <EChartsBase option={option} {...chartProps} />
    </div>
  );
}
