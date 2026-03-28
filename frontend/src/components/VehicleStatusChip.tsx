import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import { VehicleStatus } from '../types';
import {
  CheckCircle as ActiveIcon,
  Build as MaintenanceIcon,
  Cancel as OfflineIcon,
  Pause as InactiveIcon,
} from '@mui/icons-material';

interface VehicleStatusChipProps extends Omit<ChipProps, 'color'> {
  status: VehicleStatus;
}

const statusConfig: Record<VehicleStatus, { label: string; color: string; bg: string; icon: React.ReactElement }> = {
  [VehicleStatus.ACTIVE]: {
    label: 'Active',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.12)',
    icon: <ActiveIcon sx={{ fontSize: '0.9rem !important' }} />,
  },
  [VehicleStatus.MAINTENANCE]: {
    label: 'Maintenance',
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.12)',
    icon: <MaintenanceIcon sx={{ fontSize: '0.9rem !important' }} />,
  },
  [VehicleStatus.OFFLINE]: {
    label: 'Offline',
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.12)',
    icon: <OfflineIcon sx={{ fontSize: '0.9rem !important' }} />,
  },
  [VehicleStatus.INACTIVE]: {
    label: 'Inactive',
    color: '#94a3b8',
    bg: 'rgba(148, 163, 184, 0.12)',
    icon: <InactiveIcon sx={{ fontSize: '0.9rem !important' }} />,
  },
};

const VehicleStatusChip: React.FC<VehicleStatusChipProps> = ({ status, ...props }) => {
  const config = statusConfig[status] || statusConfig[VehicleStatus.INACTIVE];
  return (
    <Chip
      label={config.label}
      icon={config.icon}
      size="small"
      {...props}
      sx={{
        color: config.color,
        backgroundColor: config.bg,
        border: `1px solid ${config.color}33`,
        fontWeight: 600,
        fontSize: '0.7rem',
        '& .MuiChip-icon': { color: config.color },
        ...(status === VehicleStatus.ACTIVE && {
          '&::before': {
            content: '""',
            position: 'absolute',
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: config.color,
            animation: 'pulse 2s infinite',
          },
        }),
        ...props.sx,
      }}
    />
  );
};

export default VehicleStatusChip;
