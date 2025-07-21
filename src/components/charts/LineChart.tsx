import React from 'react';
import EChartsBase, { EChartsBaseProps } from './EChartsBase';
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

export default function LineChart({
  data,
  xField,
  yFields,
  xAxisLabel,
  yAxisLabel,
  title,
  colors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de'],
  smooth = true,
  showSymbol = true,
  ...chartProps
}: LineChartProps) {
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
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    legend: {
      data: yFields,
      top: title ? 40 : 10,
      left: 'center'
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
      nameGap: 30,
      axisLine: {
        lineStyle: {
          color: '#484753'
        }
      },
      axisTick: {
        lineStyle: {
          color: '#484753'
        }
      },
      axisLabel: {
        color: '#9ca3af'
      }
    },
    yAxis: {
      type: 'value',
      name: yAxisLabel,
      nameLocation: 'middle',
      nameGap: 50,
      axisLine: {
        lineStyle: {
          color: '#484753'
        }
      },
      axisTick: {
        lineStyle: {
          color: '#484753'
        }
      },
      axisLabel: {
        color: '#9ca3af'
      },
      splitLine: {
        lineStyle: {
          color: '#484753',
          type: 'dashed'
        }
      }
    },
    series: yFields.map((field, index) => ({
      name: field,
      type: 'line',
      smooth,
      showSymbol,
      emphasis: {
        focus: 'series'
      },
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
