import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  alpha,
} from '@mui/material';
import {
  Assessment as ReportIcon,
  Download as DownloadIcon,
  DirectionsCar as FleetIcon,
  Build as MaintenanceIcon,
  Person as DriverIcon,
  DateRange as DateRangeIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format, subDays, subMonths } from 'date-fns';
import { useSnackbar } from 'notistack';
import { reportApi } from '../services/api';
import { FleetReport } from '../types';

interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) =>
  value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null;

const ReportsPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fleetReport, setFleetReport] = useState<FleetReport | null>(null);
  const [maintenanceReport, setMaintenanceReport] = useState<{ records: Array<{ vehicleName: string; totalCost: number; count: number }> } | null>(null);
  const [dateFrom, setDateFrom] = useState(format(subMonths(new Date(), 1), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));

  const fetchFleetReport = async () => {
    setLoading(true);
    try {
      const data = await reportApi.getFleetReport({ from: dateFrom, to: dateTo });
      setFleetReport(data);
    } catch {
      enqueueSnackbar('Failed to generate report', { variant: 'error' });
      // Use mock data
      setFleetReport(generateMockFleetReport());
    } finally {
      setLoading(false);
    }
  };

  const fetchMaintenanceReport = async () => {
    setLoading(true);
    try {
      const data = await reportApi.getMaintenanceReport({ from: dateFrom, to: dateTo });
      setMaintenanceReport(data);
    } catch {
      enqueueSnackbar('Failed to generate report', { variant: 'error' });
      setMaintenanceReport(generateMockMaintenanceReport());
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = () => {
    if (tab === 0) fetchFleetReport();
    else if (tab === 1) fetchMaintenanceReport();
  };

  const handleExportCsv = async (type: string) => {
    try {
      const blob = await reportApi.exportCsv(type, { from: dateFrom, to: dateTo });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-report-${dateFrom}-${dateTo}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      enqueueSnackbar('Export failed', { variant: 'error' });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Reports</Typography>
          <Typography variant="body2" color="text.secondary">Generate and export fleet analytics reports</Typography>
        </Box>
      </Box>

      {/* Date Range + Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', py: 2, '&:last-child': { pb: 2 } }}>
          <TextField
            label="From Date"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 160 }}
          />
          <TextField
            label="To Date"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 160 }}
          />
          {[
            { label: 'Last 7 days', days: 7 },
            { label: 'Last 30 days', days: 30 },
            { label: 'Last 90 days', days: 90 },
          ].map(({ label, days }) => (
            <Chip
              key={label}
              label={label}
              size="small"
              onClick={() => {
                setDateFrom(format(subDays(new Date(), days), 'yyyy-MM-dd'));
                setDateTo(format(new Date(), 'yyyy-MM-dd'));
              }}
              sx={{ cursor: 'pointer', fontSize: '0.72rem', backgroundColor: 'rgba(0,180,216,0.1)', color: '#00B4D8' }}
            />
          ))}
          <Button
            variant="contained"
            onClick={handleGenerate}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <ReportIcon />}
            sx={{ ml: 'auto' }}
          >
            Generate Report
          </Button>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Box sx={{ borderBottom: '1px solid rgba(148,163,184,0.1)', mb: 0 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab icon={<FleetIcon fontSize="small" />} iconPosition="start" label="Fleet Summary" />
          <Tab icon={<MaintenanceIcon fontSize="small" />} iconPosition="start" label="Maintenance Cost" />
          <Tab icon={<DriverIcon fontSize="small" />} iconPosition="start" label="Driver Activity" />
        </Tabs>
      </Box>

      {/* Fleet Summary Tab */}
      <TabPanel value={tab} index={0}>
        {fleetReport ? (
          <Grid container spacing={2.5}>
            {/* Summary Stats */}
            <Grid item xs={12}>
              <Grid container spacing={2}>
                {[
                  { label: 'Total Distance', value: `${fleetReport.totalDistance.toLocaleString()} km`, color: '#00B4D8' },
                  { label: 'Total Fuel', value: `${fleetReport.totalFuelConsumed.toLocaleString()} L`, color: '#f59e0b' },
                  { label: 'Average Speed', value: `${fleetReport.averageSpeed} km/h`, color: '#10b981' },
                  { label: 'Total Trips', value: fleetReport.totalTrips, color: '#3b82f6' },
                ].map(({ label, value, color }) => (
                  <Grid item xs={12} sm={6} md={3} key={label}>
                    <Card>
                      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.68rem', fontWeight: 600 }}>
                          {label}
                        </Typography>
                        <Typography variant="h5" fontWeight={800} sx={{ color, mt: 0.5 }}>{value}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Distance Chart */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader
                  title={<Typography variant="subtitle1" fontWeight={600}>Distance by Vehicle</Typography>}
                  action={<Button size="small" startIcon={<DownloadIcon />} onClick={() => handleExportCsv('fleet')} sx={{ color: '#00B4D8' }}>Export CSV</Button>}
                />
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={fleetReport.vehicleReports.slice(0, 8)} margin={{ left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                      <XAxis dataKey="vehicleName" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} />
                      <RechartsTooltip contentStyle={{ backgroundColor: '#1a2235', border: '1px solid rgba(0,180,216,0.2)', borderRadius: 8, color: '#f1f5f9' }} />
                      <Bar dataKey="distance" fill="#00B4D8" radius={[4, 4, 0, 0]} name="Distance (km)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Fuel Chart */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title={<Typography variant="subtitle1" fontWeight={600}>Fuel Consumption by Vehicle</Typography>} />
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={fleetReport.vehicleReports.slice(0, 8)} margin={{ left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                      <XAxis dataKey="vehicleName" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} />
                      <RechartsTooltip contentStyle={{ backgroundColor: '#1a2235', border: '1px solid rgba(0,180,216,0.2)', borderRadius: 8, color: '#f1f5f9' }} />
                      <Bar dataKey="fuelConsumed" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Fuel (L)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Table */}
            <Grid item xs={12}>
              <Card>
                <CardHeader title={<Typography variant="subtitle1" fontWeight={600}>Vehicle Report Details</Typography>} />
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Vehicle</TableCell>
                        <TableCell>Distance (km)</TableCell>
                        <TableCell>Fuel (L)</TableCell>
                        <TableCell>Avg Speed</TableCell>
                        <TableCell>Trips</TableCell>
                        <TableCell>Online Hours</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {fleetReport.vehicleReports.map((vr) => (
                        <TableRow key={vr.vehicleId}>
                          <TableCell><Typography variant="body2" fontWeight={600}>{vr.vehicleName}</Typography></TableCell>
                          <TableCell><Typography variant="body2">{vr.distance.toLocaleString()}</Typography></TableCell>
                          <TableCell><Typography variant="body2">{vr.fuelConsumed.toLocaleString()}</Typography></TableCell>
                          <TableCell><Typography variant="body2">{vr.avgSpeed} km/h</Typography></TableCell>
                          <TableCell><Typography variant="body2">{vr.trips}</Typography></TableCell>
                          <TableCell><Typography variant="body2">{vr.onlineHours}h</Typography></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            </Grid>
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 10, color: 'text.secondary' }}>
            <ReportIcon sx={{ fontSize: 60, opacity: 0.2, display: 'block', mx: 'auto', mb: 2 }} />
            <Typography>Select a date range and click "Generate Report"</Typography>
          </Box>
        )}
      </TabPanel>

      {/* Maintenance Cost Tab */}
      <TabPanel value={tab} index={1}>
        {maintenanceReport ? (
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <Card>
                <CardHeader
                  title={<Typography variant="subtitle1" fontWeight={600}>Maintenance Cost by Vehicle</Typography>}
                  action={<Button size="small" startIcon={<DownloadIcon />} onClick={() => handleExportCsv('maintenance')} sx={{ color: '#00B4D8' }}>Export CSV</Button>}
                />
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={maintenanceReport.records} margin={{ left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                      <XAxis dataKey="vehicleName" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} />
                      <RechartsTooltip contentStyle={{ backgroundColor: '#1a2235', border: '1px solid rgba(0,180,216,0.2)', borderRadius: 8, color: '#f1f5f9' }} />
                      <Bar dataKey="totalCost" fill="#ef4444" radius={[4, 4, 0, 0]} name="Total Cost ($)" />
                      <Bar dataKey="count" fill="#00B4D8" radius={[4, 4, 0, 0]} name="Count" />
                      <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 10, color: 'text.secondary' }}>
            <ReportIcon sx={{ fontSize: 60, opacity: 0.2, display: 'block', mx: 'auto', mb: 2 }} />
            <Typography>Click "Generate Report" to load maintenance data</Typography>
          </Box>
        )}
      </TabPanel>

      {/* Driver Activity Tab */}
      <TabPanel value={tab} index={2}>
        <Box sx={{ textAlign: 'center', py: 10, color: 'text.secondary' }}>
          <DriverIcon sx={{ fontSize: 60, opacity: 0.2, display: 'block', mx: 'auto', mb: 2 }} />
          <Typography>Click "Generate Report" to load driver activity data</Typography>
        </Box>
      </TabPanel>
    </Box>
  );
};

function generateMockFleetReport(): FleetReport {
  const vehicleNames = ['Truck 01', 'Van 03', 'Car 07', 'Truck 02', 'Bus 01', 'Van 05', 'Car 12', 'Truck 04'];
  return {
    period: { start: format(subMonths(new Date(), 1), 'yyyy-MM-dd'), end: format(new Date(), 'yyyy-MM-dd') },
    totalVehicles: vehicleNames.length,
    totalDistance: 48230,
    totalFuelConsumed: 5620,
    averageSpeed: 72,
    totalTrips: 342,
    vehicleReports: vehicleNames.map((name, i) => ({
      vehicleId: `v-${i}`,
      vehicleName: name,
      distance: Math.floor(Math.random() * 8000 + 2000),
      fuelConsumed: Math.floor(Math.random() * 900 + 200),
      avgSpeed: Math.floor(Math.random() * 30 + 55),
      trips: Math.floor(Math.random() * 60 + 10),
      onlineHours: Math.floor(Math.random() * 200 + 50),
    })),
  };
}

function generateMockMaintenanceReport() {
  const vehicles = ['Truck 01', 'Van 03', 'Car 07', 'Truck 02', 'Bus 01'];
  return {
    records: vehicles.map((name) => ({
      vehicleName: name,
      totalCost: Math.floor(Math.random() * 2000 + 200),
      count: Math.floor(Math.random() * 8 + 1),
    })),
  };
}

export default ReportsPage;
