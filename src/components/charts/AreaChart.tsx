import React from 'react';
import EChartsBase, { EChartsBaseProps } from './EChartsBase';
import type { EChartsOption } from 'echarts';

export interface AreaChartProps extends Omit<EChartsBaseProps, 'option'> {
  data: Array<Record<string, string | number>>;
  xField: string;
  yFields: string[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  title?: string;
  colors?: string[];
  smooth?: boolean;
  stack?: boolean;
}

export default function AreaChart({
  data,
  xField,
  yFields,
  xAxisLabel,
  yAxisLabel,
  title,
  colors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de'],
  smooth = true,
  stack = false,
  ...chartProps
}: AreaChartProps) {
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
      stack: stack ? 'Total' : undefined,
      emphasis: {
        focus: 'series'
      },
      smooth,
      data: data.map(item => item[field]),
      itemStyle: {
        color: colors[index % colors.length]
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0,
            color: colors[index % colors.length]
          }, {
            offset: 1,
            color: colors[index % colors.length] + '20'
          }]
        }
      }
    }))
  };

  return <EChartsBase option={option} {...chartProps} />;
}
