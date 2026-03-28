import React, { useEffect, useState } from 'react';
import {
  Box,
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
  TablePagination,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Rating,
  CircularProgress,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Star as StarIcon,
  DirectionsCar as CarIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useForm, Controller } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { Driver } from '../types';
import { driverApi } from '../services/api';

const statusConfig: Record<string, { color: string; bg: string }> = {
  ACTIVE: { color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  INACTIVE: { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
  ON_LEAVE: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
};

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
};

const DriversPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDriver, setEditDriver] = useState<Driver | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { control, handleSubmit, reset, setValue } = useForm<FormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      licenseNumber: '',
      licenseExpiry: '',
      status: 'ACTIVE',
    },
  });

  const loadDrivers = async () => {
    setLoading(true);
    try {
      const data = await driverApi.getAll({ page, size: rowsPerPage });
      setDrivers(data.content ?? data as unknown as Driver[]);
      setTotal(data.totalElements ?? (data.content ?? data as unknown as Driver[]).length);
    } catch {
      enqueueSnackbar('Failed to load drivers', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDrivers(); }, [page, rowsPerPage]);

  const filtered = statusFilter === 'ALL' ? drivers : drivers.filter((d) => d.status === statusFilter);

  const openAdd = () => { setEditDriver(null); reset(); setDialogOpen(true); };
  const openEdit = (d: Driver) => {
    setEditDriver(d);
    setValue('firstName', d.firstName);
    setValue('lastName', d.lastName);
    setValue('email', d.email);
    setValue('phone', d.phone);
    setValue('licenseNumber', d.licenseNumber);
    setValue('licenseExpiry', format(new Date(d.licenseExpiry), 'yyyy-MM-dd'));
    setValue('status', d.status);
    setDialogOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    try {
      if (editDriver) {
        const updated = await driverApi.update(editDriver.id, {
          ...data,
          licenseExpiry: new Date(data.licenseExpiry).toISOString(),
        });
        setDrivers((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
        enqueueSnackbar('Driver updated', { variant: 'success' });
      } else {
        const created = await driverApi.create({
          ...data,
          licenseExpiry: new Date(data.licenseExpiry).toISOString(),
        });
        setDrivers((prev) => [created, ...prev]);
        enqueueSnackbar('Driver added', { variant: 'success' });
      }
      setDialogOpen(false);
    } catch {
      enqueueSnackbar('Operation failed', { variant: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await driverApi.delete(deleteId);
      setDrivers((prev) => prev.filter((d) => d.id !== deleteId));
      enqueueSnackbar('Driver deleted', { variant: 'success' });
    } catch {
      enqueueSnackbar('Failed to delete driver', { variant: 'error' });
    }
    setDeleteId(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Drivers</Typography>
          <Typography variant="body2" color="text.secondary">{total} total drivers</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>Add Driver</Button>
      </Box>

      {/* Status Filters */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2.5 }}>
        {(['ALL', 'ACTIVE', 'INACTIVE', 'ON_LEAVE'] as const).map((s) => {
          const count = s === 'ALL' ? drivers.length : drivers.filter((d) => d.status === s).length;
          const cfg = statusConfig[s] || { color: '#00B4D8', bg: '' };
          return (
            <Chip
              key={s}
              label={`${s === 'ALL' ? 'All' : s.replace('_', ' ')} (${count})`}
              size="small"
              onClick={() => setStatusFilter(s)}
              sx={{
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.72rem',
                backgroundColor: statusFilter === s ? alpha(cfg.color, 0.15) : 'rgba(148,163,184,0.08)',
                color: statusFilter === s ? cfg.color : 'text.secondary',
              }}
            />
          );
        })}
      </Box>

      <Card>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={24} sx={{ color: '#00B4D8' }} />
          </Box>
        )}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Driver</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>License</TableCell>
                <TableCell>License Expiry</TableCell>
                <TableCell>Assigned Vehicle</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Total Trips</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                    <PersonIcon sx={{ fontSize: 40, opacity: 0.2, display: 'block', mx: 'auto', mb: 1 }} />
                    No drivers found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((driver) => {
                  const cfg = statusConfig[driver.status] || statusConfig.INACTIVE;
                  const isExpiringSoon = new Date(driver.licenseExpiry) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                  return (
                    <TableRow key={driver.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 36, height: 36, background: 'linear-gradient(135deg, #00B4D8, #0077B6)', fontSize: '0.85rem', fontWeight: 700 }}>
                            {driver.firstName.charAt(0)}{driver.lastName.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {driver.firstName} {driver.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">{driver.email}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={driver.status.replace('_', ' ')}
                          size="small"
                          sx={{ fontSize: '0.68rem', color: cfg.color, backgroundColor: cfg.bg, fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{driver.licenseNumber}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ color: isExpiringSoon ? '#f59e0b' : 'text.primary', fontWeight: isExpiringSoon ? 600 : 400 }}
                        >
                          {format(new Date(driver.licenseExpiry), 'dd MMM yyyy')}
                          {isExpiringSoon && ' ⚠️'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {driver.assignedVehicleName ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CarIcon sx={{ fontSize: 14, color: '#00B4D8' }} />
                            <Typography variant="body2">{driver.assignedVehicleName}</Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.disabled">Unassigned</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Rating value={driver.rating} precision={0.5} size="small" readOnly max={5} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{driver.totalTrips}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => openEdit(driver)} sx={{ color: 'text.secondary' }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => setDeleteId(driver.id)} sx={{ color: '#ef4444' }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(+e.target.value); setPage(0); }}
          rowsPerPageOptions={[10, 25, 50]}
          sx={{ color: 'text.secondary' }}
        />
      </Card>

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>{editDriver ? 'Edit Driver' : 'Add Driver'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Controller name="firstName" control={control} rules={{ required: true }} render={({ field }) => (
                <TextField {...field} label="First Name" size="small" fullWidth required />
              )} />
              <Controller name="lastName" control={control} rules={{ required: true }} render={({ field }) => (
                <TextField {...field} label="Last Name" size="small" fullWidth required />
              )} />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Controller name="email" control={control} rules={{ required: true }} render={({ field }) => (
                <TextField {...field} label="Email" type="email" size="small" fullWidth required />
              )} />
              <Controller name="phone" control={control} render={({ field }) => (
                <TextField {...field} label="Phone" size="small" fullWidth />
              )} />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Controller name="licenseNumber" control={control} render={({ field }) => (
                <TextField {...field} label="License Number" size="small" fullWidth />
              )} />
              <Controller name="licenseExpiry" control={control} render={({ field }) => (
                <TextField {...field} label="License Expiry" type="date" size="small" fullWidth InputLabelProps={{ shrink: true }} />
              )} />
            </Box>
            <Controller name="status" control={control} render={({ field }) => (
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select {...field} label="Status">
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="INACTIVE">Inactive</MenuItem>
                  <MenuItem value="ON_LEAVE">On Leave</MenuItem>
                </Select>
              </FormControl>
            )} />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
            <Button onClick={() => setDialogOpen(false)} variant="outlined" size="small">Cancel</Button>
            <Button type="submit" variant="contained" size="small">{editDriver ? 'Update' : 'Add'}</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs">
        <DialogTitle>Delete Driver</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this driver?</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setDeleteId(null)} variant="outlined" size="small">Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error" size="small">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DriversPage;
