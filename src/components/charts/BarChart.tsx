import React from 'react';
import EChartsBase, { EChartsBaseProps } from './EChartsBase';
import type { EChartsOption } from 'echarts';

export interface BarChartProps extends Omit<EChartsBaseProps, 'option'> {
  data: Array<Record<string, any>>;
  xField: string;
  yFields: string[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  title?: string;
  colors?: string[];
  stack?: boolean;
  horizontal?: boolean;
  className?: string;
}

export default function BarChart({
  data,
  xField,
  yFields,
  xAxisLabel,
  yAxisLabel,
  title,
  colors = ['#0969da', '#1f883d', '#d1242f', '#8250df'],
  stack = false,
  horizontal = false,
  className = '',
  ...chartProps
}: BarChartProps) {
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
        type: 'shadow'
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
      type: horizontal ? 'value' : 'category',
      data: horizontal ? undefined : data.map(item => item[xField]),
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
        color: '#9ca3af',
        ...(horizontal ? {} : { rotate: data.length > 10 ? 45 : 0 })
      },
      splitLine: horizontal ? {
        lineStyle: {
          color: '#484753',
          type: 'dashed'
        }
      } : undefined
    },
    yAxis: {
      type: horizontal ? 'category' : 'value',
      data: horizontal ? data.map(item => item[xField]) : undefined,
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
      splitLine: horizontal ? undefined : {
        lineStyle: {
          color: '#484753',
          type: 'dashed'
        }
      }
    },
    series: yFields.map((field, index) => ({
      name: field,
      type: 'bar',
      stack: stack ? 'Total' : undefined,
      emphasis: {
        focus: 'series'
      },
      data: data.map(item => item[field]),
      itemStyle: {
        color: colors[index % colors.length],
        borderRadius: horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]
      }
    }))
  };

  return (
    <div className={`w-full h-full ${className}`}>
      <EChartsBase option={option} {...chartProps} />
    </div>
  );
}
