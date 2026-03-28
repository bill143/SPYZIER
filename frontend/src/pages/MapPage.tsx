import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  TextField,
  InputAdornment,
  Chip,
  Divider,
  alpha,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { AppDispatch, RootState } from '../store';
import { fetchVehicles } from '../store/vehicleSlice';
import { Vehicle, VehicleStatus } from '../types';
import VehicleStatusChip from '../components/VehicleStatusChip';
import useWebSocket from '../hooks/useWebSocket';

const statusColors: Record<VehicleStatus, string> = {
  [VehicleStatus.ACTIVE]: '#10b981',
  [VehicleStatus.MAINTENANCE]: '#f59e0b',
  [VehicleStatus.OFFLINE]: '#ef4444',
  [VehicleStatus.INACTIVE]: '#94a3b8',
};

const createVehicleIcon = (status: VehicleStatus, selected: boolean) => {
  const color = statusColors[status] || '#94a3b8';
  const size = selected ? 38 : 30;
  const border = selected ? '3px solid white' : '2px solid rgba(255,255,255,0.7)';
  return L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;border:${border};box-shadow:0 3px 10px rgba(0,0,0,0.4);transition:all 0.2s">
      <svg width="${selected ? 18 : 14}" height="${selected ? 18 : 14}" fill="white" viewBox="0 0 24 24"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

const FlyToVehicle: React.FC<{ vehicle: Vehicle | null }> = ({ vehicle }) => {
  const map = useMap();
  useEffect(() => {
    if (vehicle?.location) {
      map.flyTo([vehicle.location.lat, vehicle.location.lng], 15, { duration: 1.2 });
    }
  }, [vehicle, map]);
  return null;
};

const MapPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { vehicles } = useSelector((state: RootState) => state.vehicles);
  const { liveTelemetry } = useSelector((state: RootState) => state.telemetry);
  const { accessToken } = useSelector((state: RootState) => state.auth);

  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | 'ALL'>('ALL');
  const vehicleIds = vehicles.map((v) => v.id);

  useWebSocket({ vehicleIds, subscribeFleet: true, token: accessToken });

  useEffect(() => {
    dispatch(fetchVehicles({ size: 200 }));
  }, [dispatch]);

  const getVehicleLocation = (v: Vehicle) => {
    const live = liveTelemetry[v.id];
    if (live) return { lat: live.latitude, lng: live.longitude };
    return v.location;
  };

  const filtered = vehicles.filter((v) => {
    const loc = getVehicleLocation(v);
    if (!loc) return false;
    const matchSearch = !search || v.name.toLowerCase().includes(search.toLowerCase()) || v.licensePlate.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || v.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const selectedVehicle = selectedId ? vehicles.find((v) => v.id === selectedId) || null : null;
  const mapVehicles = filtered.filter((v) => getVehicleLocation(v) !== undefined);

  const DEFAULT_CENTER: [number, number] = [48.8566, 2.3522];
  const mapCenter: [number, number] =
    mapVehicles.length > 0 && getVehicleLocation(mapVehicles[0])
      ? [getVehicleLocation(mapVehicles[0])!.lat, getVehicleLocation(mapVehicles[0])!.lng]
      : DEFAULT_CENTER;

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 140px)', gap: 2 }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: 300,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          overflow: 'hidden',
        }}
      >
        <Typography variant="h6" fontWeight={700}>Live Fleet Map</Typography>

        <TextField
          size="small"
          fullWidth
          placeholder="Search vehicles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
        />

        {/* Status Filters */}
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {(['ALL', VehicleStatus.ACTIVE, VehicleStatus.MAINTENANCE, VehicleStatus.OFFLINE] as const).map((s) => (
            <Chip
              key={s}
              label={s === 'ALL' ? `All (${vehicles.filter(v => getVehicleLocation(v)).length})` : `${s.charAt(0) + s.slice(1).toLowerCase()} (${vehicles.filter(v => v.status === s && getVehicleLocation(v)).length})`}
              size="small"
              onClick={() => setStatusFilter(s)}
              sx={{
                cursor: 'pointer',
                fontSize: '0.65rem',
                fontWeight: 600,
                backgroundColor: statusFilter === s ? alpha(statusColors[s as VehicleStatus] || '#00B4D8', 0.15) : 'rgba(148,163,184,0.08)',
                color: statusFilter === s ? (statusColors[s as VehicleStatus] || '#00B4D8') : 'text.secondary',
              }}
            />
          ))}
        </Box>

        {/* Vehicle List */}
        <Card sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <List dense sx={{ flex: 1, overflow: 'auto', py: 0.5 }}>
            {filtered.map((vehicle, idx) => {
              const loc = getVehicleLocation(vehicle);
              const live = liveTelemetry[vehicle.id];
              const isSelected = vehicle.id === selectedId;
              return (
                <React.Fragment key={vehicle.id}>
                  <ListItemButton
                    selected={isSelected}
                    onClick={() => setSelectedId(isSelected ? null : vehicle.id)}
                    sx={{
                      borderRadius: 2,
                      mx: 0.5,
                      borderLeft: isSelected ? `3px solid ${statusColors[vehicle.status]}` : '3px solid transparent',
                    }}
                  >
                    <ListItemAvatar sx={{ minWidth: 36 }}>
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          backgroundColor: alpha(statusColors[vehicle.status] || '#94a3b8', 0.15),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: statusColors[vehicle.status] || '#94a3b8',
                          }}
                        />
                      </Box>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight={isSelected ? 700 : 500} noWrap>
                          {vehicle.name}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {vehicle.licensePlate}
                          </Typography>
                          {(live?.speed || vehicle.speed) ? (
                            <Typography variant="caption" sx={{ color: '#00B4D8', fontWeight: 600 }}>
                              {live?.speed ?? vehicle.speed} km/h
                            </Typography>
                          ) : null}
                        </Box>
                      }
                    />
                  </ListItemButton>
                  {idx < filtered.length - 1 && <Divider sx={{ borderColor: 'rgba(148,163,184,0.05)', mx: 1 }} />}
                </React.Fragment>
              );
            })}
            {filtered.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                <Typography variant="body2">No vehicles with location data</Typography>
              </Box>
            )}
          </List>
        </Card>
      </Box>

      {/* Map */}
      <Box sx={{ flex: 1, borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(148,163,184,0.1)' }}>
        <MapContainer
          center={mapCenter}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          <FlyToVehicle vehicle={selectedVehicle} />
          {mapVehicles.map((vehicle) => {
            const loc = getVehicleLocation(vehicle);
            if (!loc) return null;
            const live = liveTelemetry[vehicle.id];
            const isSelected = vehicle.id === selectedId;
            return (
              <Marker
                key={vehicle.id}
                position={[loc.lat, loc.lng]}
                icon={createVehicleIcon(vehicle.status, isSelected)}
                eventHandlers={{ click: () => setSelectedId(vehicle.id) }}
              >
                <Popup>
                  <Box sx={{ minWidth: 160 }}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {vehicle.name}
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ color: '#64748b', mb: 0.5 }}>
                      {vehicle.licensePlate}
                    </Typography>
                    <Divider sx={{ my: 0.5 }} />
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5 }}>
                      <Typography variant="caption">Speed: <strong>{live?.speed ?? vehicle.speed ?? 0} km/h</strong></Typography>
                      <Typography variant="caption">Fuel: <strong>{live?.fuelLevel ?? vehicle.fuelLevel ?? 0}%</strong></Typography>
                      {vehicle.driverName && (
                        <Typography variant="caption" sx={{ gridColumn: '1/-1' }}>
                          Driver: <strong>{vehicle.driverName}</strong>
                        </Typography>
                      )}
                    </Box>
                    <Box
                      onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                      sx={{
                        mt: 1,
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        backgroundColor: '#0077B6',
                        color: 'white',
                        fontSize: '0.75rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      View Details
                    </Box>
                  </Box>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </Box>
    </Box>
  );
};

export default MapPage;
