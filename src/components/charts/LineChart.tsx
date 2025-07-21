import React from 'react';
import EChartsBase, { EChartsBaseProps, GITHUB_COLORS } from './EChartsBase';
import type { EChartsOption } from 'echarts';

export interface LineChartProps extends Omit<EChartsBaseProps, 'option'> {
  data: Array<Record<string, any>>;
  xField: string;
  yFields: string[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  title?: string;
  colors?: string[];
  smooth?: boolean;
  showSymbol?: boolean;
}

const githubColors = [
  GITHUB_COLORS.primary,
  GITHUB_COLORS.success,
  GITHUB_COLORS.accent,
  GITHUB_COLORS.danger,
  GITHUB_COLORS.warning,
  '#fb8500',
];

export default function LineChart({
  data,
  xField,
  yFields,
  xAxisLabel,
  yAxisLabel,
  title,
  colors = githubColors,
  smooth = true,
  showSymbol = true,
  ...chartProps
}: LineChartProps): React.JSX.Element {
  const option: EChartsOption = {
    title: title ? {
      text: title,
      left: 'center'
    } : undefined,
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: yFields,
      top: title ? 40 : 10
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: title ? 80 : 50,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.map(item => item[xField]),
      name: xAxisLabel,
      nameLocation: 'middle',
      nameGap: 30
    },
    yAxis: {
      type: 'value',
      name: yAxisLabel,
      nameLocation: 'middle',
      nameGap: 50
    },
    series: yFields.map((field, index) => ({
      name: field,
      type: 'line',
      smooth,
      showSymbol,
      data: data.map(item => item[field]),
      itemStyle: {
        color: colors[index % colors.length]
      },
      lineStyle: {
        width: 2
      },
      symbolSize: 6
    }))
  };

  return <EChartsBase option={option} {...chartProps} />;
}