import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Avatar,
  LinearProgress,
  Skeleton,
  CircularProgress,
  Tooltip,
  alpha,
} from '@mui/material';
import {
  Search as SearchIcon,
  ViewModule as GridViewIcon,
  ViewList as ListViewIcon,
  DirectionsCar as CarIcon,
  LocalGasStation as FuelIcon,
  Speed as SpeedIcon,
  Person as DriverIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import { AppDispatch, RootState } from '../store';
import { fetchVehicles } from '../store/vehicleSlice';
import { VehicleStatus, VehicleType, Vehicle } from '../types';
import VehicleStatusChip from '../components/VehicleStatusChip';

const typeLabels: Record<VehicleType, string> = {
  [VehicleType.TRUCK]: 'Truck',
  [VehicleType.VAN]: 'Van',
  [VehicleType.CAR]: 'Car',
  [VehicleType.MOTORCYCLE]: 'Motorcycle',
  [VehicleType.BUS]: 'Bus',
  [VehicleType.TRAILER]: 'Trailer',
};

const FuelBar: React.FC<{ level: number }> = ({ level }) => {
  const color = level > 50 ? '#10b981' : level > 25 ? '#f59e0b' : '#ef4444';
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <LinearProgress
        variant="determinate"
        value={level}
        sx={{
          flex: 1,
          '& .MuiLinearProgress-bar': { backgroundColor: color },
          backgroundColor: 'rgba(148,163,184,0.1)',
        }}
      />
      <Typography variant="caption" sx={{ color, minWidth: 32, fontWeight: 600 }}>
        {level}%
      </Typography>
    </Box>
  );
};

const FleetPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { vehicles, loading, totalCount } = useSelector((state: RootState) => state.vehicles);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);

  useEffect(() => {
    dispatch(fetchVehicles({ size: 200 }));
  }, [dispatch]);

  const filtered = useMemo(() => {
    return vehicles.filter((v) => {
      const matchSearch =
        !search ||
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.licensePlate.toLowerCase().includes(search.toLowerCase()) ||
        (v.driverName || '').toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || v.status === statusFilter;
      const matchType = typeFilter === 'ALL' || v.type === typeFilter;
      return matchSearch && matchStatus && matchType;
    });
  }, [vehicles, search, statusFilter, typeFilter]);

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const statusCounts = useMemo(() => ({
    ALL: vehicles.length,
    [VehicleStatus.ACTIVE]: vehicles.filter((v) => v.status === VehicleStatus.ACTIVE).length,
    [VehicleStatus.MAINTENANCE]: vehicles.filter((v) => v.status === VehicleStatus.MAINTENANCE).length,
    [VehicleStatus.OFFLINE]: vehicles.filter((v) => v.status === VehicleStatus.OFFLINE).length,
    [VehicleStatus.INACTIVE]: vehicles.filter((v) => v.status === VehicleStatus.INACTIVE).length,
  }), [vehicles]);

  const VehicleCardSkeleton = () => (
    <Card>
      <CardContent>
        <Skeleton variant="rectangular" height={24} width="60%" sx={{ mb: 1 }} />
        <Skeleton variant="rectangular" height={18} width="40%" sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={8} sx={{ mb: 1 }} />
        <Skeleton variant="rectangular" height={8} width="80%" />
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Fleet Overview</Typography>
          <Typography variant="body2" color="text.secondary">
            {totalCount} vehicles total · {statusCounts[VehicleStatus.ACTIVE]} active
          </Typography>
        </Box>
      </Box>

      {/* Status filter pills */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2.5, flexWrap: 'wrap' }}>
        {(['ALL', VehicleStatus.ACTIVE, VehicleStatus.MAINTENANCE, VehicleStatus.OFFLINE, VehicleStatus.INACTIVE] as const).map((s) => {
          const count = statusCounts[s] ?? 0;
          const colors: Record<string, string> = {
            ALL: '#00B4D8',
            ACTIVE: '#10b981',
            MAINTENANCE: '#f59e0b',
            OFFLINE: '#ef4444',
            INACTIVE: '#94a3b8',
          };
          const isSelected = statusFilter === s;
          return (
            <Chip
              key={s}
              label={`${s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()} (${count})`}
              onClick={() => { setStatusFilter(s); setPage(0); }}
              sx={{
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.75rem',
                backgroundColor: isSelected ? alpha(colors[s], 0.15) : 'rgba(148,163,184,0.08)',
                color: isSelected ? colors[s] : 'text.secondary',
                border: `1px solid ${isSelected ? colors[s] + '44' : 'transparent'}`,
                '&:hover': { backgroundColor: alpha(colors[s], 0.12) },
              }}
            />
          );
        })}
      </Box>

      {/* Toolbar */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Search vehicles, plates, drivers..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          sx={{ flex: 1, minWidth: 240 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
        />
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Type</InputLabel>
          <Select value={typeFilter} label="Type" onChange={(e) => { setTypeFilter(e.target.value); setPage(0); }}>
            <MenuItem value="ALL">All Types</MenuItem>
            {Object.values(VehicleType).map((t) => (
              <MenuItem key={t} value={t}>{typeLabels[t]}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, v) => v && setViewMode(v)}
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              border: '1px solid rgba(148,163,184,0.15)',
              color: 'text.secondary',
              '&.Mui-selected': { color: '#00B4D8', backgroundColor: alpha('#00B4D8', 0.1) },
            },
          }}
        >
          <ToggleButton value="grid"><GridViewIcon fontSize="small" /></ToggleButton>
          <ToggleButton value="list"><ListViewIcon fontSize="small" /></ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {loading && vehicles.length === 0 ? (
        <Grid container spacing={2.5}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
              <VehicleCardSkeleton />
            </Grid>
          ))}
        </Grid>
      ) : viewMode === 'grid' ? (
        <>
          <Grid container spacing={2.5}>
            {paginated.map((vehicle) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={vehicle.id}>
                <VehicleCard vehicle={vehicle} onClick={() => navigate(`/vehicles/${vehicle.id}`)} />
              </Grid>
            ))}
            {paginated.length === 0 && (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                  <CarIcon sx={{ fontSize: 48, mb: 1, opacity: 0.3 }} />
                  <Typography>No vehicles found</Typography>
                </Box>
              </Grid>
            )}
          </Grid>
          <TablePagination
            component="div"
            count={filtered.length}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(+e.target.value); setPage(0); }}
            rowsPerPageOptions={[8, 12, 24, 48]}
            sx={{ mt: 2, color: 'text.secondary' }}
          />
        </>
      ) : (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Vehicle</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Driver</TableCell>
                  <TableCell>Fuel</TableCell>
                  <TableCell>Speed</TableCell>
                  <TableCell>Last Update</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginated.map((vehicle) => (
                  <TableRow
                    key={vehicle.id}
                    onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          sx={{
                            width: 34,
                            height: 34,
                            backgroundColor: alpha('#00B4D8', 0.15),
                            color: '#00B4D8',
                          }}
                        >
                          <CarIcon fontSize="small" />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>{vehicle.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{vehicle.licensePlate}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell><VehicleStatusChip status={vehicle.status} /></TableCell>
                    <TableCell>
                      <Typography variant="body2">{typeLabels[vehicle.type]}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {vehicle.driverName || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ minWidth: 120 }}>
                      <FuelBar level={vehicle.fuelLevel ?? 0} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{vehicle.speed ?? 0} km/h</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {vehicle.lastUpdate
                          ? formatDistanceToNow(new Date(vehicle.lastUpdate), { addSuffix: true })
                          : '—'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filtered.length}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(+e.target.value); setPage(0); }}
            rowsPerPageOptions={[10, 25, 50, 100]}
            sx={{ color: 'text.secondary' }}
          />
        </Card>
      )}
    </Box>
  );
};

const VehicleCard: React.FC<{ vehicle: Vehicle; onClick: () => void }> = ({ vehicle, onClick }) => {
  const fuelColor = vehicle.fuelLevel > 50 ? '#10b981' : vehicle.fuelLevel > 25 ? '#f59e0b' : '#ef4444';

  return (
    <Card
      sx={{
        height: '100%',
        transition: 'all 0.2s ease',
        '&:hover': { transform: 'translateY(-2px)' },
      }}
    >
      <CardActionArea onClick={onClick} sx={{ height: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                backgroundColor: alpha('#00B4D8', 0.12),
                color: '#00B4D8',
              }}
            >
              <CarIcon />
            </Avatar>
            <VehicleStatusChip status={vehicle.status} />
          </Box>

          <Typography variant="subtitle2" fontWeight={700} noWrap>
            {vehicle.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            {vehicle.licensePlate}
          </Typography>

          {vehicle.driverName && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
              <DriverIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary" noWrap>
                {vehicle.driverName}
              </Typography>
            </Box>
          )}

          <Box sx={{ mb: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <FuelIcon sx={{ fontSize: 11, color: fuelColor }} />
                <Typography variant="caption" color="text.secondary">Fuel</Typography>
              </Box>
              <Typography variant="caption" sx={{ color: fuelColor, fontWeight: 700 }}>
                {vehicle.fuelLevel ?? 0}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={vehicle.fuelLevel ?? 0}
              sx={{
                height: 5,
                '& .MuiLinearProgress-bar': { backgroundColor: fuelColor },
                backgroundColor: 'rgba(148,163,184,0.1)',
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <SpeedIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {vehicle.speed ?? 0} km/h
              </Typography>
            </Box>
            <Typography variant="caption" color="text.disabled">
              {vehicle.lastUpdate
                ? formatDistanceToNow(new Date(vehicle.lastUpdate), { addSuffix: true })
                : '—'}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default FleetPage;
