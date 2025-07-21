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

export default function PieChart({
  data,
  title,
  showLabels = true,
  showPercentage = true,
  radius = ['40%', '70%'],
  colors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4'],
  ...chartProps
}: PieChartProps) {
  // Add colors to data if not provided
  const dataWithColors = data.map((item, index) => ({
    ...item,
    itemStyle: {
      color: item.color || colors[index % colors.length]
    }
  }));

  const option: EChartsOption = {
    title: title ? {
      text: title,
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    } : undefined,
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const { name, value, percent } = params;
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

  return <EChartsBase option={option} {...chartProps} />;
}
