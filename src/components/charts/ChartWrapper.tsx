import React, { ReactNode } from 'react';
import { Card, CardContent, Typography, Box, Skeleton, IconButton, Tooltip } from '@mui/material';
import { Share, Download, Fullscreen } from '@mui/icons-material';

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
      <Card sx={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.05) 100%)',
        borderRadius: 2,
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <CardContent sx={{ p: 3 }}>
          {title && (
            <Box sx={{ mb: 2 }}>
              <Skeleton variant="text" width="40%" height={28} />
              {description && <Skeleton variant="text" width="60%" height={20} sx={{ mt: 1 }} />}
            </Box>
          )}
          <Skeleton variant="rectangular" height={height} sx={{ borderRadius: 1 }} />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.05) 100%)',
        borderRadius: 2,
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              height,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 2
            }}
          >
            <Typography variant="h6" color="error">
              Failed to load chart
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              {error}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{
      background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.05) 100%)',
      borderRadius: 2,
      border: '1px solid rgba(255,255,255,0.1)',
      transition: 'all 0.3s ease',
      '&:hover': {
        border: '1px solid rgba(255,255,255,0.2)',
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
      }
    }}>
      <CardContent sx={{ p: 3 }}>
        {(title || description || onShare || onDownload || onFullscreen || headerActions) && (
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 3
          }}>
            <Box sx={{ flex: 1 }}>
              {title && (
                <Typography
                  variant="h6"
                  component="h3"
                  sx={{
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    color: 'text.primary',
                    mb: description ? 1 : 0
                  }}
                >
                  {title}
                </Typography>
              )}
              {description && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ lineHeight: 1.5 }}
                >
                  {description}
                </Typography>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 0.5, ml: 2 }}>
              {headerActions}
              {onShare && (
                <Tooltip title="Share">
                  <IconButton
                    size="small"
                    onClick={onShare}
                    sx={{
                      color: 'text.secondary',
                      '&:hover': { color: 'primary.main' }
                    }}
                  >
                    <Share fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {onDownload && (
                <Tooltip title="Download">
                  <IconButton
                    size="small"
                    onClick={onDownload}
                    sx={{
                      color: 'text.secondary',
                      '&:hover': { color: 'primary.main' }
                    }}
                  >
                    <Download fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {onFullscreen && (
                <Tooltip title="Fullscreen">
                  <IconButton
                    size="small"
                    onClick={onFullscreen}
                    sx={{
                      color: 'text.secondary',
                      '&:hover': { color: 'primary.main' }
                    }}
                  >
                    <Fullscreen fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>
        )}

        <Box sx={{
          minHeight: height,
          position: 'relative',
          '& .echarts-for-react': {
            borderRadius: 1
          }
        }}>
          {children}
        </Box>
      </CardContent>
    </Card>
  );
}
