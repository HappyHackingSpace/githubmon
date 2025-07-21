import React, { forwardRef, ForwardedRef, CSSProperties, useRef, useEffect } from 'react';
import EChartsReact from 'echarts-for-react';
import type { EChartsOption, EChartsType } from 'echarts'
import * as echarts from 'echarts';

// GitHub color palette
const GITHUB_COLORS = {
  primary: '#0969da',
  success: '#1a7f37',
  danger: '#cf222e',
  warning: '#bf8700',
  accent: '#8250df',
  neutral: '#656d76',
  canvas: '#ffffff',
  canvasSubtle: '#f6f8fa',
  border: '#d0d7de',
  borderMuted: '#d8dee4',
  fg: '#1f2328',
  fgMuted: '#656d76',
  fgSubtle: '#6e7781'
};

// Register GitHub-inspired theme
echarts.registerTheme('github-light', {
  color: [
    GITHUB_COLORS.primary,
    GITHUB_COLORS.success,
    GITHUB_COLORS.accent,
    GITHUB_COLORS.danger,
    GITHUB_COLORS.warning,
    '#fb8500',
    '#8338ec',
    '#3a86ff',
    '#06ffa5',
    '#ffbe0b'
  ],
  backgroundColor: 'transparent',
  textStyle: {
    color: GITHUB_COLORS.fg,
    fontSize: 12,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif'
  },
  title: {
    textStyle: {
      color: GITHUB_COLORS.fg,
      fontSize: 16,
      fontWeight: '600'
    }
  },
  legend: {
    textStyle: {
      color: GITHUB_COLORS.fgMuted,
      fontSize: 12
    }
  },
  tooltip: {
    backgroundColor: 'rgba(31, 35, 40, 0.95)',
    borderColor: GITHUB_COLORS.border,
    textStyle: {
      color: '#ffffff'
    },
    borderRadius: 6,
    borderWidth: 1
  },
  grid: {
    borderColor: GITHUB_COLORS.borderMuted
  },
  categoryAxis: {
    axisLine: {
      lineStyle: {
        color: GITHUB_COLORS.border
      }
    },
    axisTick: {
      lineStyle: {
        color: GITHUB_COLORS.border
      }
    },
    axisLabel: {
      color: GITHUB_COLORS.fgMuted
    }
  },
  valueAxis: {
    axisLine: {
      lineStyle: {
        color: GITHUB_COLORS.border
      }
    },
    axisTick: {
      lineStyle: {
        color: GITHUB_COLORS.border
      }
    },
    axisLabel: {
      color: GITHUB_COLORS.fgMuted
    },
    splitLine: {
      lineStyle: {
        color: GITHUB_COLORS.borderMuted
      }
    }
  }
});

// Register dark theme for GitHub
echarts.registerTheme('github-dark', {
  color: [
    '#2f81f7',
    '#3fb950',
    '#a5a5f6',
    '#f85149',
    '#d29922',
    '#ff7b72',
    '#bc8cff',
    '#58a6ff',
    '#39d353',
    '#ffab70'
  ],
  backgroundColor: 'transparent',
  textStyle: {
    color: '#f0f6fc',
    fontSize: 12,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif'
  },
  title: {
    textStyle: {
      color: '#f0f6fc',
      fontSize: 16,
      fontWeight: '600'
    }
  },
  legend: {
    textStyle: {
      color: '#8b949e',
      fontSize: 12
    }
  },
  tooltip: {
    backgroundColor: 'rgba(22, 27, 34, 0.95)',
    borderColor: '#30363d',
    textStyle: {
      color: '#f0f6fc'
    },
    borderRadius: 6,
    borderWidth: 1
  },
  grid: {
    borderColor: '#30363d'
  },
  categoryAxis: {
    axisLine: {
      lineStyle: {
        color: '#30363d'
      }
    },
    axisTick: {
      lineStyle: {
        color: '#30363d'
      }
    },
    axisLabel: {
      color: '#8b949e'
    }
  },
  valueAxis: {
    axisLine: {
      lineStyle: {
        color: '#30363d'
      }
    },
    axisTick: {
      lineStyle: {
        color: '#30363d'
      }
    },
    axisLabel: {
      color: '#8b949e'
    },
    splitLine: {
      lineStyle: {
        color: '#21262d'
      }
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
  theme?: 'github-light' | 'github-dark';
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
      theme = 'github-light',
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
      color: theme === 'github-dark' ? '#2f81f7' : '#0969da',
      textColor: theme === 'github-dark' ? '#f0f6fc' : '#1f2328',
      maskColor: theme === 'github-dark' ? 'rgba(13, 17, 23, 0.6)' : 'rgba(255, 255, 255, 0.6)',
      zlevel: 0,
      fontSize: 12,
      showSpinner: true,
      spinnerRadius: 10,
      lineWidth: 3
    };

    const chartStyle: CSSProperties = {
      height,
      width,
      ...style
    };

    return (
      <div className={`
        bg-white dark:bg-gray-900
        border border-gray-200 dark:border-gray-700
        rounded-lg
        overflow-hidden
        shadow-sm
        hover:shadow-md
        transition-shadow
        duration-200
        ${className ?? ''}
      `}>
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 dark:bg-gray-900/80">
            <div className="flex flex-col items-center space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Loading chart...</span>
            </div>
          </div>
        )}

        <EChartsReact
          ref={chartRef}
          option={option}
          style={chartStyle}
          theme={theme}
          showLoading={false} // We handle loading ourselves
          loadingOption={loadingOption || defaultLoadingOption}
          onChartReady={onChartReady}
          onEvents={onEvents}
          notMerge={notMerge}
          lazyUpdate={lazyUpdate}
          {...rest}
        />
      </div>
    );
  }
);

export default EChartsBase;
export { GITHUB_COLORS };