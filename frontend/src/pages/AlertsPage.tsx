import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Chip,
  Divider,
  CircularProgress,
  IconButton,
  Tooltip,
  alpha,
} from '@mui/material';
import {
  Warning as CriticalIcon,
  Error as HighIcon,
  Info as MediumIcon,
  Notifications as LowIcon,
  CheckCircle as AckIcon,
  DirectionsCar as CarIcon,
  Speed as SpeedIcon,
  LocalGasStation as FuelIcon,
  Fence as FenceIcon,
  AcUnit as TempIcon,
  Build as MaintenanceIcon,
  Battery0Bar as BatteryIcon,
  NotificationsActive as AlertActiveIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useSnackbar } from 'notistack';
import { AppDispatch, RootState } from '../store';
import { fetchAlerts, acknowledgeAlert, setSeverityFilter } from '../store/alertSlice';
import { Alert, AlertSeverity, AlertType } from '../types';
import AlertSeverityChip from '../components/AlertSeverityChip';
import useWebSocket from '../hooks/useWebSocket';

const severityOrder = [AlertSeverity.CRITICAL, AlertSeverity.HIGH, AlertSeverity.MEDIUM, AlertSeverity.LOW];

const alertTypeIcon: Record<AlertType, React.ReactNode> = {
  [AlertType.SPEED_VIOLATION]: <SpeedIcon fontSize="small" />,
  [AlertType.GEOFENCE_BREACH]: <FenceIcon fontSize="small" />,
  [AlertType.LOW_FUEL]: <FuelIcon fontSize="small" />,
  [AlertType.ENGINE_OVERHEAT]: <TempIcon fontSize="small" />,
  [AlertType.HARSH_BRAKING]: <CarIcon fontSize="small" />,
  [AlertType.VEHICLE_OFFLINE]: <CarIcon fontSize="small" />,
  [AlertType.MAINTENANCE_DUE]: <MaintenanceIcon fontSize="small" />,
  [AlertType.BATTERY_LOW]: <BatteryIcon fontSize="small" />,
  [AlertType.ACCIDENT]: <CriticalIcon fontSize="small" />,
};

const severityIconMap: Record<AlertSeverity, React.ReactNode> = {
  [AlertSeverity.CRITICAL]: <CriticalIcon sx={{ color: '#ef4444' }} />,
  [AlertSeverity.HIGH]: <HighIcon sx={{ color: '#f97316' }} />,
  [AlertSeverity.MEDIUM]: <MediumIcon sx={{ color: '#f59e0b' }} />,
  [AlertSeverity.LOW]: <LowIcon sx={{ color: '#3b82f6' }} />,
};

const severityColors: Record<AlertSeverity, string> = {
  [AlertSeverity.CRITICAL]: '#ef4444',
  [AlertSeverity.HIGH]: '#f97316',
  [AlertSeverity.MEDIUM]: '#f59e0b',
  [AlertSeverity.LOW]: '#3b82f6',
};

const AlertsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { enqueueSnackbar } = useSnackbar();
  const { alerts, loading, severityFilter, unreadCount } = useSelector((state: RootState) => state.alerts);
  const { accessToken } = useSelector((state: RootState) => state.auth);

  useWebSocket({ subscribeAlerts: true, token: accessToken });

  useEffect(() => {
    dispatch(fetchAlerts({ size: 100 }));
  }, [dispatch]);

  const filtered =
    severityFilter === 'ALL' ? alerts : alerts.filter((a) => a.severity === severityFilter);

  const unacknowledged = filtered.filter((a) => !a.acknowledged);

  const severityCounts = {
    ALL: alerts.length,
    [AlertSeverity.CRITICAL]: alerts.filter((a) => a.severity === AlertSeverity.CRITICAL).length,
    [AlertSeverity.HIGH]: alerts.filter((a) => a.severity === AlertSeverity.HIGH).length,
    [AlertSeverity.MEDIUM]: alerts.filter((a) => a.severity === AlertSeverity.MEDIUM).length,
    [AlertSeverity.LOW]: alerts.filter((a) => a.severity === AlertSeverity.LOW).length,
  };

  const pieData = severityOrder
    .filter((s) => severityCounts[s] > 0)
    .map((s) => ({ name: s, value: severityCounts[s], color: severityColors[s] }));

  const handleAcknowledge = async (alert: Alert) => {
    if (alert.acknowledged) return;
    const result = await dispatch(acknowledgeAlert(alert.id));
    if (acknowledgeAlert.fulfilled.match(result)) {
      enqueueSnackbar('Alert acknowledged', { variant: 'success' });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Alerts Center</Typography>
          <Typography variant="body2" color="text.secondary">
            {unreadCount} unread · {alerts.length} total alerts
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* Severity filter tabs */}
        <Grid item xs={12} md={8}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            {(['ALL', ...severityOrder] as const).map((s) => {
              const count = severityCounts[s] ?? 0;
              const color = s === 'ALL' ? '#00B4D8' : severityColors[s];
              const isSelected = severityFilter === s;
              return (
                <Chip
                  key={s}
                  label={`${s === 'ALL' ? 'All' : s} (${count})`}
                  onClick={() => dispatch(setSeverityFilter(s))}
                  sx={{
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    backgroundColor: isSelected ? alpha(color, 0.15) : 'rgba(148,163,184,0.08)',
                    color: isSelected ? color : 'text.secondary',
                    border: `1px solid ${isSelected ? color + '44' : 'transparent'}`,
                  }}
                />
              );
            })}
          </Box>

          {/* Alert List */}
          <Card>
            <CardHeader
              title={<Typography variant="subtitle1" fontWeight={600}>
                {severityFilter === 'ALL' ? 'All Alerts' : `${severityFilter} Alerts`}
              </Typography>}
            />
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress size={24} sx={{ color: '#00B4D8' }} />
              </Box>
            ) : (
              <List dense sx={{ py: 0 }}>
                {filtered.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 5, color: 'text.secondary' }}>
                    <AlertActiveIcon sx={{ fontSize: 40, opacity: 0.2, display: 'block', mx: 'auto', mb: 1 }} />
                    <Typography variant="body2">No alerts</Typography>
                  </Box>
                ) : (
                  filtered.map((alert, idx) => (
                    <React.Fragment key={alert.id}>
                      <ListItem
                        sx={{
                          px: 2.5,
                          py: 1.5,
                          opacity: alert.acknowledged ? 0.6 : 1,
                          backgroundColor: alert.acknowledged ? 'transparent' : alpha(severityColors[alert.severity], 0.03),
                          transition: 'opacity 0.2s',
                        }}
                        secondaryAction={
                          !alert.acknowledged && (
                            <Tooltip title="Acknowledge">
                              <IconButton
                                edge="end"
                                size="small"
                                onClick={() => handleAcknowledge(alert)}
                                sx={{ color: '#10b981', '&:hover': { backgroundColor: alpha('#10b981', 0.1) } }}
                              >
                                <AckIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )
                        }
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          {severityIconMap[alert.severity]}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                              <Typography variant="body2" fontWeight={alert.acknowledged ? 400 : 600}>
                                {alert.message}
                              </Typography>
                              <AlertSeverityChip severity={alert.severity} />
                              {!alert.acknowledged && (
                                <Chip label="NEW" size="small" sx={{ fontSize: '0.6rem', height: 16, backgroundColor: alpha(severityColors[alert.severity], 0.15), color: severityColors[alert.severity], fontWeight: 700 }} />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', gap: 2, mt: 0.3, flexWrap: 'wrap' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                                <CarIcon sx={{ fontSize: 11 }} />
                                <Typography variant="caption">{alert.vehicleName || alert.vehicleId}</Typography>
                              </Box>
                              <Typography variant="caption" color="text.disabled">
                                {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                              </Typography>
                              {alert.acknowledged && alert.acknowledgedBy && (
                                <Typography variant="caption" color="text.disabled">
                                  Ack by {alert.acknowledgedBy}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                      {idx < filtered.length - 1 && <Divider sx={{ borderColor: 'rgba(148,163,184,0.05)' }} />}
                    </React.Fragment>
                  ))
                )}
              </List>
            )}
          </Card>
        </Grid>

        {/* Stats */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 2 }}>
            <CardHeader title={<Typography variant="subtitle1" fontWeight={600}>Alert Distribution</Typography>} />
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={pieData.length > 0 ? pieData : [{ name: 'No alerts', value: 1, color: '#374151' }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={72}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {(pieData.length > 0 ? pieData : [{ name: 'No alerts', value: 1, color: '#374151' }]).map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#1a2235', border: '1px solid rgba(0,180,216,0.2)', borderRadius: 8, color: '#f1f5f9' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {severityOrder.map((s) => (
                  <Box key={s} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: severityColors[s] }} />
                      <Typography variant="caption" color="text.secondary">{s}</Typography>
                    </Box>
                    <Typography variant="caption" fontWeight={700} sx={{ color: severityColors[s] }}>
                      {severityCounts[s]}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Quick stats */}
          <Card>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} mb={1.5}>Summary</Typography>
              {[
                { label: 'Total Alerts', value: alerts.length, color: '#00B4D8' },
                { label: 'Unacknowledged', value: unreadCount, color: '#ef4444' },
                { label: 'Critical', value: severityCounts[AlertSeverity.CRITICAL], color: '#ef4444' },
                { label: 'High', value: severityCounts[AlertSeverity.HIGH], color: '#f97316' },
              ].map(({ label, value, color }) => (
                <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">{label}</Typography>
                  <Typography variant="caption" fontWeight={700} sx={{ color }}>{value}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AlertsPage;
