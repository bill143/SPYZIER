import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import { AlertSeverity } from '../types';

interface AlertSeverityChipProps extends Omit<ChipProps, 'color'> {
  severity: AlertSeverity;
}

const severityConfig: Record<AlertSeverity, { label: string; color: string; bg: string }> = {
  [AlertSeverity.CRITICAL]: {
    label: 'Critical',
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.12)',
  },
  [AlertSeverity.HIGH]: {
    label: 'High',
    color: '#f97316',
    bg: 'rgba(249, 115, 22, 0.12)',
  },
  [AlertSeverity.MEDIUM]: {
    label: 'Medium',
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.12)',
  },
  [AlertSeverity.LOW]: {
    label: 'Low',
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.12)',
  },
};

const AlertSeverityChip: React.FC<AlertSeverityChipProps> = ({ severity, ...props }) => {
  const config = severityConfig[severity] || severityConfig[AlertSeverity.LOW];
  return (
    <Chip
      label={config.label}
      size="small"
      {...props}
      sx={{
        color: config.color,
        backgroundColor: config.bg,
        border: `1px solid ${config.color}33`,
        fontWeight: 700,
        fontSize: '0.68rem',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        ...props.sx,
      }}
    />
  );
};

export default AlertSeverityChip;
