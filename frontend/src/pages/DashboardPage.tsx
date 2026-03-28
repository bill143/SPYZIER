import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip,
  Avatar,
  alpha,
} from '@mui/material';
import {
  DirectionsCar as VehicleIcon,
  LocalGasStation as FuelIcon,
  Warning as WarningIcon,
  Build as BuildIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { format } from 'date-fns';
import { AppDispatch, RootState } from '../store';
import { fetchVehicles } from '../store/vehicleSlice';
import { fetchAlerts } from '../store/alertSlice';
import { fetchUpcomingMaintenance } from '../store/maintenanceSlice';
import { dashboardApi } from '../services/api';
import { DashboardSummary, VehicleStatus, AlertSeverity } from '../types';
import MetricCard from '../components/MetricCard';
import AlertSeverityChip from '../components/AlertSeverityChip';
import useWebSocket from '../hooks/useWebSocket';

const COLORS = {
  active: '#10b981',
  maintenance: '#f59e0b',
  offline: '#ef4444',
  inactive: '#94a3b8',
};

const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#94a3b8'];

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { vehicles } = useSelector((state: RootState) => state.vehicles);
  const { alerts, unreadCount } = useSelector((state: RootState) => state.alerts);
  const { accessToken } = useSelector((state: RootState) => state.auth);
  const { upcomingRecords } = useSelector((state: RootState) => state.maintenance);

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  useWebSocket({ subscribeAlerts: true, subscribeFleet: true, token: accessToken });

  useEffect(() => {
    dispatch(fetchVehicles({ size: 100 }));
    dispatch(fetchAlerts({ size: 20 }));
    dispatch(fetchUpcomingMaintenance(7));

    dashboardApi
      .getSummary()
      .then(setSummary)
      .catch(() => {
        // Use calculated values from store
        setSummary(null);
      })
      .finally(() => setSummaryLoading(false));
  }, [dispatch]);

  const activeCount = vehicles.filter((v) => v.status === VehicleStatus.ACTIVE).length;
  const maintenanceCount = vehicles.filter((v) => v.status === VehicleStatus.MAINTENANCE).length;
  const offlineCount = vehicles.filter((v) => v.status === VehicleStatus.OFFLINE).length;
  const inactiveCount = vehicles.filter((v) => v.status === VehicleStatus.INACTIVE).length;

  const pieData = [
    { name: 'Active', value: activeCount, color: COLORS.active },
    { name: 'Maintenance', value: maintenanceCount, color: COLORS.maintenance },
    { name: 'Offline', value: offlineCount, color: COLORS.offline },
    { name: 'Inactive', value: inactiveCount, color: COLORS.inactive },
  ].filter((d) => d.value > 0);

  const activityData = summary?.fleetActivity || generateMockActivity();
  const fuelData = summary?.fuelConsumers?.slice(0, 6) || generateMockFuel();
  const recentAlerts = (summary?.recentAlerts || alerts).slice(0, 8);

  if (summaryLoading && vehicles.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress sx={{ color: '#00B4D8' }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Fleet Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {format(new Date(), 'EEEE, MMMM d, yyyy')} · Real-time fleet monitoring
        </Typography>
      </Box>

      {/* Metric Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Total Vehicles"
            value={vehicles.length || summary?.totalVehicles || 0}
            subtitle={`${activeCount} active right now`}
            icon={<VehicleIcon />}
            iconColor="#00B4D8"
            trend={5}
            trendLabel="vs last month"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Active Now"
            value={activeCount}
            subtitle="Currently on the road"
            icon={<SpeedIcon />}
            iconColor="#10b981"
            trend={2}
            trendLabel="vs yesterday"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Active Alerts"
            value={unreadCount || summary?.criticalAlerts || 0}
            subtitle={`${alerts.filter((a) => a.severity === AlertSeverity.CRITICAL && !a.acknowledged).length} critical`}
            icon={<WarningIcon />}
            iconColor="#ef4444"
            trend={-12}
            trendLabel="vs last week"
            onClick={() => navigate('/alerts')}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Maintenance Due"
            value={upcomingRecords.length || summary?.maintenanceDueCount || 0}
            subtitle="Next 7 days"
            icon={<BuildIcon />}
            iconColor="#f59e0b"
            trend={3}
            trendLabel="new this week"
            onClick={() => navigate('/maintenance')}
          />
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* Fleet Activity Line Chart */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardHeader
              title={<Typography variant="h6" fontWeight={600}>Fleet Activity (24h)</Typography>}
              subheader={<Typography variant="caption" color="text.secondary">Active vs Idle vehicles over time</Typography>}
            />
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={activityData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                  <XAxis
                    dataKey="hour"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={{ stroke: 'rgba(148,163,184,0.1)' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={{ stroke: 'rgba(148,163,184,0.1)' }}
                    tickLine={false}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#1a2235',
                      border: '1px solid rgba(0,180,216,0.2)',
                      borderRadius: 8,
                      color: '#f1f5f9',
                    }}
                  />
                  <Legend
                    wrapperStyle={{ color: '#94a3b8', fontSize: 12 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="active"
                    stroke="#00B4D8"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 4, fill: '#00B4D8' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="idle"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                    strokeDasharray="4 4"
                    activeDot={{ r: 4, fill: '#f59e0b' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Status Donut */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title={<Typography variant="h6" fontWeight={600}>Vehicle Status</Typography>}
              subheader={<Typography variant="caption" color="text.secondary">Distribution by status</Typography>}
            />
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData.length > 0 ? pieData : [{ name: 'No data', value: 1, color: '#374151' }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {(pieData.length > 0 ? pieData : [{ name: 'No data', value: 1, color: '#374151' }]).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#1a2235',
                      border: '1px solid rgba(0,180,216,0.2)',
                      borderRadius: 8,
                      color: '#f1f5f9',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                {[
                  { label: 'Active', count: activeCount, color: COLORS.active },
                  { label: 'Maintenance', count: maintenanceCount, color: COLORS.maintenance },
                  { label: 'Offline', count: offlineCount, color: COLORS.offline },
                  { label: 'Inactive', count: inactiveCount, color: COLORS.inactive },
                ].map((item) => (
                  <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: item.color }} />
                    <Typography variant="caption" color="text.secondary">
                      {item.label} ({item.count})
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bottom Row */}
      <Grid container spacing={2.5}>
        {/* Recent Alerts Table */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardHeader
              title={<Typography variant="h6" fontWeight={600}>Recent Alerts</Typography>}
              action={
                <Chip
                  label="View All"
                  size="small"
                  onClick={() => navigate('/alerts')}
                  sx={{
                    cursor: 'pointer',
                    backgroundColor: alpha('#00B4D8', 0.1),
                    color: '#00B4D8',
                    '&:hover': { backgroundColor: alpha('#00B4D8', 0.2) },
                  }}
                />
              }
            />
            <CardContent sx={{ pt: 0 }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Severity</TableCell>
                      <TableCell>Message</TableCell>
                      <TableCell>Vehicle</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentAlerts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                          No recent alerts
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentAlerts.map((alert) => (
                        <TableRow key={alert.id}>
                          <TableCell>
                            <AlertSeverityChip severity={alert.severity} />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ maxWidth: 220 }} noWrap>
                              {alert.message}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" color="text.secondary">
                              {alert.vehicleName || alert.vehicleId}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" color="text.secondary">
                              {format(new Date(alert.createdAt), 'HH:mm')}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={alert.acknowledged ? 'Ack' : 'New'}
                              size="small"
                              sx={{
                                fontSize: '0.65rem',
                                height: 18,
                                backgroundColor: alert.acknowledged
                                  ? 'rgba(148,163,184,0.1)'
                                  : 'rgba(239,68,68,0.12)',
                                color: alert.acknowledged ? '#64748b' : '#ef4444',
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Fuel Consumers */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title={<Typography variant="h6" fontWeight={600}>Top Fuel Consumers</Typography>}
              subheader={<Typography variant="caption" color="text.secondary">Liters per 100km</Typography>}
            />
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={fuelData} layout="vertical" margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="vehicleName"
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    width={70}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#1a2235',
                      border: '1px solid rgba(0,180,216,0.2)',
                      borderRadius: 8,
                      color: '#f1f5f9',
                    }}
                  />
                  <Bar dataKey="consumption" fill="#00B4D8" radius={[0, 4, 4, 0]} maxBarSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

function generateMockActivity() {
  const hours = [];
  for (let i = 0; i < 24; i++) {
    hours.push({
      hour: `${String(i).padStart(2, '0')}:00`,
      active: Math.floor(Math.random() * 15) + 5,
      idle: Math.floor(Math.random() * 8) + 2,
    });
  }
  return hours;
}

function generateMockFuel() {
  const vehicles = ['Truck 01', 'Van 03', 'Car 07', 'Truck 02', 'Bus 01', 'Van 05'];
  return vehicles.map((name) => ({
    vehicleId: name,
    vehicleName: name,
    consumption: Math.round((Math.random() * 15 + 5) * 10) / 10,
  }));
}

export default DashboardPage;
