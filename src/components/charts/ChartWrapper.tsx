import React, { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

// Icon components (simple SVG implementations)
const ShareIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const FullscreenIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
  </svg>
);

export interface ChartWrapperProps {
  title?: string;
  description?: string;
  loading?: boolean;
  error?: string | null;
  children: ReactNode;
  height?: number | string;
  onShare?: () => void;
  onDownload?: () => void;
  onFullscreen?: () => void;
  headerActions?: ReactNode;
}

export default function ChartWrapper({
  title,
  description,
  loading = false,
  error,
  children,
  height = 400,
  onShare,
  onDownload,
  onFullscreen,
  headerActions
}: ChartWrapperProps) {
  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-white/[0.02] to-white/[0.05] border-white/10 rounded-lg">
        <div className="p-6">
          {title && (
            <div className="mb-4">
              <Skeleton className="h-7 w-2/5 mb-2" />
              {description && <Skeleton className="h-5 w-3/5 mt-2" />}
            </div>
          )}
          <Skeleton className="rounded" style={{ height }} />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-gradient-to-br from-white/[0.02] to-white/[0.05] border-white/10 rounded-lg">
        <div className="p-6">
          <div
            className="flex items-center justify-center flex-col gap-4"
            style={{ height }}
          >
            <h3 className="text-lg font-semibold text-red-500">
              Failed to load chart
            </h3>
            <p className="text-sm text-gray-400 text-center">
              {error}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // Normal state
  return (
    <Card className="bg-gradient-to-br from-white/[0.02] to-white/[0.05] border-white/10 rounded-lg transition-all duration-300 hover:border-white/20 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/15">
      <div className="p-6">
        {(title || description || onShare || onDownload || onFullscreen || headerActions) && (
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              {title && (
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {description}
                </p>
              )}
            </div>

            <div className="flex gap-1 ml-4">
              {headerActions}
              {onShare && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onShare}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                  title="Share"
                >
                  <ShareIcon />
                </Button>
              )}
              {onDownload && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDownload}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                  title="Download"
                >
                  <DownloadIcon />
                </Button>
              )}
              {onFullscreen && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onFullscreen}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                  title="Fullscreen"
                >
                  <FullscreenIcon />
                </Button>
              )}
            </div>
          </div>
        )}

        <div
          className="relative rounded-md"
          style={{ minHeight: height }}
        >
          {children}
        </div>
      </div>
    </Card>
  );
}


