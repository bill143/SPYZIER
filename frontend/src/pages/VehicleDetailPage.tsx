import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Tabs,
  Tab,
  Chip,
  Avatar,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  IconButton,
  Tooltip,
  alpha,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Speed as SpeedIcon,
  LocalGasStation as FuelIcon,
  Thermostat as TempIcon,
  BatteryChargingFull as BatteryIcon,
  LocationOn as LocationIcon,
  Person as DriverIcon,
  DirectionsCar as CarIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, formatDistanceToNow } from 'date-fns';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { AppDispatch, RootState } from '../store';
import { fetchVehicleById } from '../store/vehicleSlice';
import { fetchAlerts } from '../store/alertSlice';
import { fetchMaintenanceRecords } from '../store/maintenanceSlice';
import { setTelemetryHistory } from '../store/telemetrySlice';
import { vehicleApi, telemetryApi } from '../services/api';
import { MaintenanceStatus, Telemetry } from '../types';
import VehicleStatusChip from '../components/VehicleStatusChip';
import AlertSeverityChip from '../components/AlertSeverityChip';
import useWebSocket from '../hooks/useWebSocket';

const vehicleIcon = (color: string) =>
  L.divIcon({
    className: '',
    html: `<div style="width:32px;height:32px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4)">
      <svg width="16" height="16" fill="white" viewBox="0 0 24 24"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) =>
  value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null;

const MetricGauge: React.FC<{ label: string; value: number; unit: string; max: number; color: string; icon: React.ReactNode }> = ({
  label, value, unit, max, color, icon,
}) => (
  <Card>
    <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </Typography>
        <Box sx={{ color }}>{icon}</Box>
      </Box>
      <Typography variant="h4" fontWeight={800} sx={{ color, mb: 1 }}>
        {value}<Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>{unit}</Typography>
      </Typography>
      <LinearProgress
        variant="determinate"
        value={Math.min((value / max) * 100, 100)}
        sx={{
          '& .MuiLinearProgress-bar': { backgroundColor: color },
          backgroundColor: 'rgba(148,163,184,0.1)',
        }}
      />
    </CardContent>
  </Card>
);

const VehicleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { selectedVehicle, loading } = useSelector((state: RootState) => state.vehicles);
  const { alerts } = useSelector((state: RootState) => state.alerts);
  const { records } = useSelector((state: RootState) => state.maintenance);
  const { liveTelemetry, telemetryHistory } = useSelector((state: RootState) => state.telemetry);
  const { accessToken } = useSelector((state: RootState) => state.auth);

  const [tab, setTab] = useState(0);

  const live = id ? liveTelemetry[id] : null;
  const history = id ? (telemetryHistory[id] || []) : [];

  useWebSocket({
    vehicleIds: id ? [id] : [],
    token: accessToken,
  });

  useEffect(() => {
    if (!id) return;
    dispatch(fetchVehicleById(id));
    dispatch(fetchAlerts({ size: 50 }));
    dispatch(fetchMaintenanceRecords({ vehicleId: id, size: 50 }));
    telemetryApi.getHistory(id, { limit: 60 })
      .then((data: Telemetry[]) => {
        dispatch(setTelemetryHistory({ vehicleId: id, history: data }));
      })
      .catch(() => {});
  }, [id, dispatch]);

  const vehicle = selectedVehicle?.id === id ? selectedVehicle : null;
  const vehicleAlerts = alerts.filter((a) => a.vehicleId === id);
  const vehicleMaintenances = records.filter((r) => r.vehicleId === id);

  const markerColor = vehicle?.status === 'ACTIVE' ? '#10b981' : vehicle?.status === 'MAINTENANCE' ? '#f59e0b' : '#ef4444';

  if (loading && !vehicle) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress sx={{ color: '#00B4D8' }} />
      </Box>
    );
  }

  if (!vehicle && !loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography color="text.secondary">Vehicle not found</Typography>
      </Box>
    );
  }

  const currentSpeed = live?.speed ?? vehicle?.speed ?? 0;
  const currentFuel = live?.fuelLevel ?? vehicle?.fuelLevel ?? 0;
  const currentTemp = live?.engineTemperature ?? vehicle?.engineTemperature ?? 0;
  const currentBattery = live?.batteryVoltage ?? vehicle?.batteryVoltage ?? 0;

  const historyChartData = history.slice(-40).map((t) => ({
    time: format(new Date(t.timestamp), 'HH:mm'),
    speed: t.speed,
    fuel: t.fuelLevel,
    temp: t.engineTemperature,
  }));

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate('/fleet')} sx={{ color: 'text.secondary' }}>
          <BackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h5" fontWeight={700}>{vehicle?.name || 'Vehicle Detail'}</Typography>
            {vehicle && <VehicleStatusChip status={vehicle.status} />}
          </Box>
          <Typography variant="body2" color="text.secondary">
            {vehicle?.licensePlate} · {vehicle?.make} {vehicle?.model} {vehicle?.year}
          </Typography>
        </Box>
        {live && (
          <Chip
            label="● LIVE"
            size="small"
            sx={{
              backgroundColor: 'rgba(16,185,129,0.12)',
              color: '#10b981',
              fontWeight: 700,
              fontSize: '0.7rem',
              animation: 'pulse 2s infinite',
            }}
          />
        )}
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: '1px solid rgba(148,163,184,0.1)', mb: 0 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Overview" />
          <Tab label="Telemetry" />
          <Tab label="Maintenance" />
          <Tab label={`Alerts (${vehicleAlerts.length})`} />
        </Tabs>
      </Box>

      {/* Overview */}
      <TabPanel value={tab} index={0}>
        <Grid container spacing={2.5}>
          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <MetricGauge label="Speed" value={currentSpeed} unit="km/h" max={200} color="#00B4D8" icon={<SpeedIcon fontSize="small" />} />
              </Grid>
              <Grid item xs={6}>
                <MetricGauge label="Fuel" value={currentFuel} unit="%" max={100} color={currentFuel > 25 ? '#10b981' : '#ef4444'} icon={<FuelIcon fontSize="small" />} />
              </Grid>
              <Grid item xs={6}>
                <MetricGauge label="Engine Temp" value={currentTemp} unit="°C" max={120} color={currentTemp < 100 ? '#f59e0b' : '#ef4444'} icon={<TempIcon fontSize="small" />} />
              </Grid>
              <Grid item xs={6}>
                <MetricGauge label="Battery" value={currentBattery} unit="V" max={15} color="#3b82f6" icon={<BatteryIcon fontSize="small" />} />
              </Grid>
            </Grid>

            {/* Vehicle Info */}
            <Card sx={{ mt: 2 }}>
              <CardHeader title={<Typography variant="subtitle1" fontWeight={600}>Vehicle Information</Typography>} />
              <CardContent sx={{ pt: 0 }}>
                <Grid container spacing={1.5}>
                  {[
                    { label: 'Make / Model', value: `${vehicle?.make || '—'} ${vehicle?.model || ''}` },
                    { label: 'Year', value: vehicle?.year || '—' },
                    { label: 'VIN', value: vehicle?.vin || '—' },
                    { label: 'Mileage', value: vehicle?.mileage ? `${vehicle.mileage.toLocaleString()} km` : '—' },
                    { label: 'Driver', value: vehicle?.driverName || 'Unassigned' },
                    { label: 'Group', value: vehicle?.groupName || '—' },
                    { label: 'Reg. Expiry', value: vehicle?.registrationExpiry ? format(new Date(vehicle.registrationExpiry), 'dd MMM yyyy') : '—' },
                    { label: 'Insurance Expiry', value: vehicle?.insuranceExpiry ? format(new Date(vehicle.insuranceExpiry), 'dd MMM yyyy') : '—' },
                  ].map(({ label, value }) => (
                    <Grid item xs={6} key={label}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{label}</Typography>
                      <Typography variant="body2" fontWeight={500}>{String(value)}</Typography>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Map */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', minHeight: 400, overflow: 'hidden' }}>
              <CardHeader title={<Typography variant="subtitle1" fontWeight={600}>Current Location</Typography>} />
              <Box sx={{ height: 'calc(100% - 56px)', minHeight: 340 }}>
                {vehicle?.location ? (
                  <MapContainer
                    center={[vehicle.location.lat, vehicle.location.lng]}
                    zoom={14}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; OpenStreetMap contributors'
                    />
                    <Marker
                      position={[vehicle.location.lat, vehicle.location.lng]}
                      icon={vehicleIcon(markerColor)}
                    >
                      <Popup>
                        <Box>
                          <Typography variant="subtitle2">{vehicle.name}</Typography>
                          <Typography variant="caption" display="block">{vehicle.licensePlate}</Typography>
                          <Typography variant="caption" display="block">{currentSpeed} km/h</Typography>
                        </Box>
                      </Popup>
                    </Marker>
                  </MapContainer>
                ) : (
                  <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 1, color: 'text.secondary' }}>
                    <LocationIcon sx={{ fontSize: 40, opacity: 0.3 }} />
                    <Typography variant="body2">No location data available</Typography>
                  </Box>
                )}
              </Box>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Telemetry */}
      <TabPanel value={tab} index={1}>
        <Grid container spacing={2.5}>
          <Grid item xs={12}>
            <Card>
              <CardHeader title={<Typography variant="subtitle1" fontWeight={600}>Speed History</Typography>} />
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={historyChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                    <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#1a2235', border: '1px solid rgba(0,180,216,0.2)', borderRadius: 8, color: '#f1f5f9' }} />
                    <Line type="monotone" dataKey="speed" stroke="#00B4D8" strokeWidth={2} dot={false} name="Speed (km/h)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title={<Typography variant="subtitle1" fontWeight={600}>Fuel Level</Typography>} />
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={historyChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                    <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} domain={[0, 100]} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#1a2235', border: '1px solid rgba(0,180,216,0.2)', borderRadius: 8, color: '#f1f5f9' }} />
                    <Line type="monotone" dataKey="fuel" stroke="#10b981" strokeWidth={2} dot={false} name="Fuel (%)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title={<Typography variant="subtitle1" fontWeight={600}>Engine Temperature</Typography>} />
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={historyChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                    <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#1a2235', border: '1px solid rgba(0,180,216,0.2)', borderRadius: 8, color: '#f1f5f9' }} />
                    <Line type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={2} dot={false} name="Temp (°C)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Maintenance */}
      <TabPanel value={tab} index={2}>
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Scheduled</TableCell>
                  <TableCell>Cost</TableCell>
                  <TableCell>Technician</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vehicleMaintenances.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      No maintenance records
                    </TableCell>
                  </TableRow>
                ) : (
                  vehicleMaintenances.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <Chip label={record.type.replace('_', ' ')} size="small" sx={{ fontSize: '0.68rem', backgroundColor: 'rgba(0,180,216,0.1)', color: '#00B4D8' }} />
                      </TableCell>
                      <TableCell><Typography variant="body2">{record.title}</Typography></TableCell>
                      <TableCell>
                        <Chip
                          label={record.status}
                          size="small"
                          sx={{
                            fontSize: '0.68rem',
                            backgroundColor:
                              record.status === MaintenanceStatus.COMPLETED ? 'rgba(16,185,129,0.1)' :
                              record.status === MaintenanceStatus.OVERDUE ? 'rgba(239,68,68,0.1)' :
                              record.status === MaintenanceStatus.IN_PROGRESS ? 'rgba(0,180,216,0.1)' :
                              'rgba(245,158,11,0.1)',
                            color:
                              record.status === MaintenanceStatus.COMPLETED ? '#10b981' :
                              record.status === MaintenanceStatus.OVERDUE ? '#ef4444' :
                              record.status === MaintenanceStatus.IN_PROGRESS ? '#00B4D8' :
                              '#f59e0b',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{format(new Date(record.scheduledDate), 'dd MMM yyyy')}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{record.cost ? `$${record.cost.toFixed(2)}` : '—'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">{record.technicianName || '—'}</Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </TabPanel>

      {/* Alerts */}
      <TabPanel value={tab} index={3}>
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Severity</TableCell>
                  <TableCell>Message</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vehicleAlerts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      No alerts for this vehicle
                    </TableCell>
                  </TableRow>
                ) : (
                  vehicleAlerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell><AlertSeverityChip severity={alert.severity} /></TableCell>
                      <TableCell><Typography variant="body2">{alert.message}</Typography></TableCell>
                      <TableCell>
                        <Chip label={alert.type.replace(/_/g, ' ')} size="small" sx={{ fontSize: '0.65rem', backgroundColor: 'rgba(148,163,184,0.08)', color: 'text.secondary' }} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {format(new Date(alert.createdAt), 'dd MMM HH:mm')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={alert.acknowledged ? 'Acknowledged' : 'Active'}
                          size="small"
                          sx={{
                            fontSize: '0.65rem',
                            backgroundColor: alert.acknowledged ? 'rgba(148,163,184,0.08)' : 'rgba(239,68,68,0.1)',
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
        </Card>
      </TabPanel>
    </Box>
  );
};

export default VehicleDetailPage;
