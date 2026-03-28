import React from 'react';
import { Box, Card, CardContent, Typography, Chip } from '@mui/material';
import { TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconColor?: string;
  trend?: number;
  trendLabel?: string;
  gradient?: string;
  onClick?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconColor = '#00B4D8',
  trend,
  trendLabel,
  gradient,
  onClick,
}) => {
  const isPositive = trend !== undefined ? trend >= 0 : null;

  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        background: gradient || 'rgba(17, 24, 39, 0.8)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: `linear-gradient(90deg, transparent, ${iconColor}, transparent)`,
        },
      }}
    >
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="caption"
              sx={{
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'text.secondary',
                fontSize: '0.7rem',
                fontWeight: 600,
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                mt: 0.5,
                mb: 0.5,
                background: `linear-gradient(135deg, #ffffff, ${iconColor})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '1.8rem', sm: '2.2rem' },
              }}
            >
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: alpha(iconColor, 0.12),
              border: `1px solid ${alpha(iconColor, 0.2)}`,
              color: iconColor,
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        </Box>
        {trend !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1.5 }}>
            <Chip
              size="small"
              icon={isPositive ? <TrendingUpIcon sx={{ fontSize: '0.85rem !important' }} /> : <TrendingDownIcon sx={{ fontSize: '0.85rem !important' }} />}
              label={`${isPositive ? '+' : ''}${trend}%`}
              sx={{
                backgroundColor: alpha(isPositive ? '#10b981' : '#ef4444', 0.12),
                color: isPositive ? '#10b981' : '#ef4444',
                border: `1px solid ${alpha(isPositive ? '#10b981' : '#ef4444', 0.2)}`,
                fontWeight: 700,
                fontSize: '0.68rem',
                height: 22,
                '& .MuiChip-icon': { color: 'inherit' },
              }}
            />
            {trendLabel && (
              <Typography variant="caption" color="text.secondary">
                {trendLabel}
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default MetricCard;
