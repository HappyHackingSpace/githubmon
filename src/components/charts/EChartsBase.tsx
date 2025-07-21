import React, { forwardRef, ForwardedRef, CSSProperties, useRef, useEffect } from 'react';
import EChartsReact from 'echarts-for-react';
import type { EChartsOption, EChartsType } from 'echarts';
import { Box, useTheme } from '@mui/material';
import * as echarts from 'echarts';

// Register dark theme
echarts.registerTheme('ossinsight-dark', {
  color: [
    '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272',
    '#fc8452', '#9a60b4', '#ea7ccc', '#5470c6', '#91cc75', '#fac858'
  ],
  backgroundColor: 'transparent',
  textStyle: {
    color: '#ffffff',
    fontSize: 12
  },
  title: {
    textStyle: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: 'bold'
    }
  },
  legend: {
    textStyle: {
      color: '#ffffff',
      fontSize: 12
    }
  },
  tooltip: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    textStyle: {
      color: '#ffffff'
    }
  }
});

export interface EChartsBaseProps {
  option: EChartsOption;
  height?: number | string;
  width?: number | string;
  style?: CSSProperties;
  loading?: boolean;
  loadingOption?: object;
  theme?: string;
  onChartReady?: (chart: EChartsType) => void;
  onEvents?: { [eventName: string]: (params: any, chart: EChartsType) => void };
  className?: string;
  notMerge?: boolean;
  lazyUpdate?: boolean;
}

const EChartsBase = forwardRef<EChartsType, EChartsBaseProps>(
  function EChartsBase(
    {
      option,
      height = 400,
      width = '100%',
      style,
      loading = false,
      loadingOption,
      theme = 'ossinsight-dark',
      onChartReady,
      onEvents,
      className,
      notMerge = false,
      lazyUpdate = true,
      ...rest
    },
    ref: ForwardedRef<EChartsType>
  ) {
    const chartRef = useRef<EChartsReact>(null);
    const muiTheme = useTheme();

    useEffect(() => {
      if (chartRef.current && ref) {
        const chartInstance = chartRef.current.getEchartsInstance();
        if (typeof ref === 'function') {
          ref(chartInstance);
        } else {
          ref.current = chartInstance;
        }
      }
    }, [ref]);

    const defaultLoadingOption = {
      text: 'Loading...',
      color: '#5470c6',
      textColor: '#ffffff',
      maskColor: 'rgba(0, 0, 0, 0.3)',
      zlevel: 0,
      fontSize: 12,
      showSpinner: true,
      spinnerRadius: 10,
      lineWidth: 5
    };

    const chartStyle: CSSProperties = {
      height,
      width,
      ...style
    };

    return (
      <Box
        className={className}
        sx={{
          borderRadius: 1,
          overflow: 'hidden',
          '& .echarts-for-react': {
            borderRadius: 1
          }
        }}
      >
        <EChartsReact
          ref={chartRef}
          option={option}
          style={chartStyle}
          theme={muiTheme.palette.mode === 'dark' ? theme : undefined}
          showLoading={loading}
          loadingOption={loadingOption || defaultLoadingOption}
          onChartReady={onChartReady}
          onEvents={onEvents}
          notMerge={notMerge}
          lazyUpdate={lazyUpdate}
          {...rest}
        />
      </Box>
    );
  }
);

export default EChartsBase;
