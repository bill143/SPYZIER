import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  IconButton,
  Tooltip,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Build as BuildIcon,
  Warning as OverdueIcon,
  CheckCircle as DoneIcon,
  Schedule as ScheduledIcon,
  Autorenew as InProgressIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useForm, Controller } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { AppDispatch, RootState } from '../store';
import {
  fetchMaintenanceRecords,
  createMaintenanceRecord,
  updateMaintenanceRecord,
  deleteMaintenanceRecord,
} from '../store/maintenanceSlice';
import { MaintenanceRecord, MaintenanceStatus, MaintenanceType } from '../types';

const statusConfig: Record<MaintenanceStatus, { color: string; bg: string; icon: React.ReactNode }> = {
  [MaintenanceStatus.SCHEDULED]: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: <ScheduledIcon sx={{ fontSize: 14 }} /> },
  [MaintenanceStatus.IN_PROGRESS]: { color: '#00B4D8', bg: 'rgba(0,180,216,0.12)', icon: <InProgressIcon sx={{ fontSize: 14 }} /> },
  [MaintenanceStatus.COMPLETED]: { color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: <DoneIcon sx={{ fontSize: 14 }} /> },
  [MaintenanceStatus.OVERDUE]: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', icon: <OverdueIcon sx={{ fontSize: 14 }} /> },
};

type FormData = {
  vehicleId: string;
  type: MaintenanceType;
  status: MaintenanceStatus;
  title: string;
  description: string;
  scheduledDate: string;
  cost: string;
  technicianName: string;
  notes: string;
};

const MaintenancePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { enqueueSnackbar } = useSnackbar();
  const { records, loading, totalCount, upcomingRecords } = useSelector((state: RootState) => state.maintenance);
  const { vehicles } = useSelector((state: RootState) => state.vehicles);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState<MaintenanceStatus | 'ALL'>('ALL');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<MaintenanceRecord | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { control, handleSubmit, reset, setValue } = useForm<FormData>({
    defaultValues: {
      vehicleId: '',
      type: MaintenanceType.INSPECTION,
      status: MaintenanceStatus.SCHEDULED,
      title: '',
      description: '',
      scheduledDate: format(new Date(), 'yyyy-MM-dd'),
      cost: '',
      technicianName: '',
      notes: '',
    },
  });

  useEffect(() => {
    dispatch(fetchMaintenanceRecords({ size: 200 }));
  }, [dispatch]);

  const filtered = records.filter((r) => statusFilter === 'ALL' || r.status === statusFilter);
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const summaryStats = {
    dueThisWeek: upcomingRecords.length,
    overdue: records.filter((r) => r.status === MaintenanceStatus.OVERDUE).length,
    inProgress: records.filter((r) => r.status === MaintenanceStatus.IN_PROGRESS).length,
    completedMonth: records.filter((r) => r.status === MaintenanceStatus.COMPLETED).length,
  };

  const openAddDialog = () => {
    setEditRecord(null);
    reset();
    setDialogOpen(true);
  };

  const openEditDialog = (record: MaintenanceRecord) => {
    setEditRecord(record);
    setValue('vehicleId', record.vehicleId);
    setValue('type', record.type);
    setValue('status', record.status);
    setValue('title', record.title);
    setValue('description', record.description || '');
    setValue('scheduledDate', format(new Date(record.scheduledDate), 'yyyy-MM-dd'));
    setValue('cost', record.cost ? String(record.cost) : '');
    setValue('technicianName', record.technicianName || '');
    setValue('notes', record.notes || '');
    setDialogOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    const payload: Partial<MaintenanceRecord> = {
      ...data,
      cost: data.cost ? parseFloat(data.cost) : undefined,
      scheduledDate: new Date(data.scheduledDate).toISOString(),
    };
    if (editRecord) {
      const result = await dispatch(updateMaintenanceRecord({ id: editRecord.id, data: payload }));
      if (updateMaintenanceRecord.fulfilled.match(result)) {
        enqueueSnackbar('Maintenance record updated', { variant: 'success' });
        setDialogOpen(false);
      } else {
        enqueueSnackbar('Failed to update record', { variant: 'error' });
      }
    } else {
      const result = await dispatch(createMaintenanceRecord(payload));
      if (createMaintenanceRecord.fulfilled.match(result)) {
        enqueueSnackbar('Maintenance record created', { variant: 'success' });
        setDialogOpen(false);
      } else {
        enqueueSnackbar('Failed to create record', { variant: 'error' });
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const result = await dispatch(deleteMaintenanceRecord(deleteId));
    if (deleteMaintenanceRecord.fulfilled.match(result)) {
      enqueueSnackbar('Record deleted', { variant: 'success' });
    } else {
      enqueueSnackbar('Failed to delete', { variant: 'error' });
    }
    setDeleteId(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Maintenance Management</Typography>
          <Typography variant="body2" color="text.secondary">Track and schedule vehicle maintenance</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAddDialog}>
          Add Record
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {[
          { label: 'Due This Week', value: summaryStats.dueThisWeek, color: '#f59e0b', icon: <ScheduledIcon /> },
          { label: 'Overdue', value: summaryStats.overdue, color: '#ef4444', icon: <OverdueIcon /> },
          { label: 'In Progress', value: summaryStats.inProgress, color: '#00B4D8', icon: <InProgressIcon /> },
          { label: 'Completed (Month)', value: summaryStats.completedMonth, color: '#10b981', icon: <DoneIcon /> },
        ].map((item) => (
          <Grid item xs={12} sm={6} lg={3} key={item.label}>
            <Card>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2.5,
                    backgroundColor: alpha(item.color, 0.12),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: item.color,
                  }}
                >
                  {item.icon}
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight={800} sx={{ color: item.color, lineHeight: 1 }}>
                    {item.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filter Chips */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2.5, flexWrap: 'wrap' }}>
        {(['ALL', ...Object.values(MaintenanceStatus)] as const).map((s) => {
          const count = s === 'ALL' ? records.length : records.filter((r) => r.status === s).length;
          const cfg = s !== 'ALL' ? statusConfig[s] : null;
          return (
            <Chip
              key={s}
              label={`${s === 'ALL' ? 'All' : s.replace('_', ' ')} (${count})`}
              size="small"
              onClick={() => { setStatusFilter(s); setPage(0); }}
              sx={{
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.72rem',
                backgroundColor: statusFilter === s ? alpha(cfg?.color || '#00B4D8', 0.15) : 'rgba(148,163,184,0.08)',
                color: statusFilter === s ? (cfg?.color || '#00B4D8') : 'text.secondary',
              }}
            />
          );
        })}
      </Box>

      {/* Table */}
      <Card>
        {loading && <Box sx={{ height: 2 }}><CircularProgress size={16} sx={{ display: 'block', m: 'auto', mt: 1 }} /></Box>}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Vehicle</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Scheduled Date</TableCell>
                <TableCell>Cost</TableCell>
                <TableCell>Technician</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                    <BuildIcon sx={{ fontSize: 40, opacity: 0.2, display: 'block', mx: 'auto', mb: 1 }} />
                    No maintenance records found
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((record) => {
                  const cfg = statusConfig[record.status];
                  return (
                    <TableRow key={record.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{record.vehicleName || record.vehicleId}</Typography>
                        {record.licensePlate && (
                          <Typography variant="caption" color="text.secondary">{record.licensePlate}</Typography>
                        )}
                      </TableCell>
                      <TableCell><Typography variant="body2">{record.title}</Typography></TableCell>
                      <TableCell>
                        <Chip label={record.type.replace(/_/g, ' ')} size="small" sx={{ fontSize: '0.65rem', backgroundColor: alpha('#00B4D8', 0.1), color: '#00B4D8' }} />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={cfg?.icon as React.ReactElement}
                          label={record.status.replace('_', ' ')}
                          size="small"
                          sx={{ fontSize: '0.68rem', color: cfg?.color, backgroundColor: cfg?.bg, '& .MuiChip-icon': { color: cfg?.color } }}
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
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => openEditDialog(record)} sx={{ color: 'text.secondary' }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => setDeleteId(record.id)} sx={{ color: '#ef4444' }}>
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
          count={filtered.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(+e.target.value); setPage(0); }}
          rowsPerPageOptions={[10, 25, 50]}
          sx={{ color: 'text.secondary' }}
        />
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>{editRecord ? 'Edit Maintenance Record' : 'Add Maintenance Record'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Controller
              name="vehicleId"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <FormControl fullWidth size="small">
                  <InputLabel>Vehicle</InputLabel>
                  <Select {...field} label="Vehicle">
                    {vehicles.map((v) => (
                      <MenuItem key={v.id} value={v.id}>{v.name} ({v.licensePlate})</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Controller name="type" control={control} render={({ field }) => (
                <FormControl fullWidth size="small">
                  <InputLabel>Type</InputLabel>
                  <Select {...field} label="Type">
                    {Object.values(MaintenanceType).map((t) => (
                      <MenuItem key={t} value={t}>{t.replace(/_/g, ' ')}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )} />
              <Controller name="status" control={control} render={({ field }) => (
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select {...field} label="Status">
                    {Object.values(MaintenanceStatus).map((s) => (
                      <MenuItem key={s} value={s}>{s.replace('_', ' ')}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )} />
            </Box>
            <Controller name="title" control={control} rules={{ required: true }} render={({ field }) => (
              <TextField {...field} label="Title" size="small" fullWidth required />
            )} />
            <Controller name="description" control={control} render={({ field }) => (
              <TextField {...field} label="Description" size="small" fullWidth multiline rows={2} />
            )} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Controller name="scheduledDate" control={control} render={({ field }) => (
                <TextField {...field} label="Scheduled Date" type="date" size="small" fullWidth InputLabelProps={{ shrink: true }} />
              )} />
              <Controller name="cost" control={control} render={({ field }) => (
                <TextField {...field} label="Cost ($)" type="number" size="small" fullWidth />
              )} />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Controller name="technicianName" control={control} render={({ field }) => (
                <TextField {...field} label="Technician" size="small" fullWidth />
              )} />
            </Box>
            <Controller name="notes" control={control} render={({ field }) => (
              <TextField {...field} label="Notes" size="small" fullWidth multiline rows={2} />
            )} />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
            <Button onClick={() => setDialogOpen(false)} variant="outlined" size="small">Cancel</Button>
            <Button type="submit" variant="contained" size="small">{editRecord ? 'Update' : 'Create'}</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs">
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this maintenance record?</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setDeleteId(null)} variant="outlined" size="small">Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error" size="small">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MaintenancePage;
