import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Tabs,
  Tab,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Avatar,
  Grid,
  Alert,
  Chip,
  alpha,
} from '@mui/material';
import {
  Person as ProfileIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Settings as SystemIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { AppDispatch, RootState } from '../store';
import { setUser } from '../store/authSlice';

interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) =>
  value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null;

const SettingsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useSelector((state: RootState) => state.auth);
  const [tab, setTab] = useState(0);

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushAlerts: true,
    smsAlerts: false,
    criticalOnly: false,
    dailyDigest: true,
    maintenanceReminders: true,
  });

  const { control: profileControl, handleSubmit: handleProfileSubmit } = useForm({
    defaultValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      username: user?.username || '',
    },
  });

  const { control: passwordControl, handleSubmit: handlePasswordSubmit, reset: resetPassword, watch } = useForm({
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });
  const newPassword = watch('newPassword');

  const onProfileSave = (data: { fullName: string; email: string; username: string }) => {
    if (user) {
      dispatch(setUser({ ...user, ...data }));
      enqueueSnackbar('Profile updated successfully', { variant: 'success' });
    }
  };

  const onPasswordSave = (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    if (data.newPassword !== data.confirmPassword) {
      enqueueSnackbar('Passwords do not match', { variant: 'error' });
      return;
    }
    enqueueSnackbar('Password changed successfully', { variant: 'success' });
    resetPassword();
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Settings</Typography>
        <Typography variant="body2" color="text.secondary">Manage your account and system preferences</Typography>
      </Box>

      <Box sx={{ borderBottom: '1px solid rgba(148,163,184,0.1)', mb: 0 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab icon={<ProfileIcon fontSize="small" />} iconPosition="start" label="Profile" />
          <Tab icon={<NotificationsIcon fontSize="small" />} iconPosition="start" label="Notifications" />
          <Tab icon={<SecurityIcon fontSize="small" />} iconPosition="start" label="Security" />
          {user?.role === 'ADMIN' && (
            <Tab icon={<SystemIcon fontSize="small" />} iconPosition="start" label="System" />
          )}
        </Tabs>
      </Box>

      {/* Profile Tab */}
      <TabPanel value={tab} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    background: 'linear-gradient(135deg, #00B4D8, #0077B6)',
                    fontSize: '2rem',
                    fontWeight: 700,
                    mb: 2,
                  }}
                >
                  {user?.fullName?.charAt(0) || 'U'}
                </Avatar>
                <Typography variant="h6" fontWeight={700}>{user?.fullName}</Typography>
                <Typography variant="body2" color="text.secondary" mb={1}>{user?.email}</Typography>
                <Chip
                  label={user?.role}
                  size="small"
                  sx={{ backgroundColor: alpha('#00B4D8', 0.15), color: '#00B4D8', fontWeight: 600 }}
                />
                {user?.lastLogin && (
                  <Typography variant="caption" color="text.disabled" sx={{ mt: 2 }}>
                    Last login: {new Date(user.lastLogin).toLocaleString()}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={8}>
            <Card>
              <CardHeader title={<Typography variant="subtitle1" fontWeight={600}>Profile Information</Typography>} />
              <CardContent>
                <form onSubmit={handleProfileSubmit(onProfileSave)}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <Controller name="fullName" control={profileControl} render={({ field }) => (
                      <TextField {...field} label="Full Name" fullWidth size="small" />
                    )} />
                    <Controller name="username" control={profileControl} render={({ field }) => (
                      <TextField {...field} label="Username" fullWidth size="small" />
                    )} />
                    <Controller name="email" control={profileControl} render={({ field }) => (
                      <TextField {...field} label="Email Address" type="email" fullWidth size="small" />
                    )} />
                    <Button type="submit" variant="contained" startIcon={<SaveIcon />} sx={{ alignSelf: 'flex-start' }}>
                      Save Changes
                    </Button>
                  </Box>
                </form>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Notifications Tab */}
      <TabPanel value={tab} index={1}>
        <Card sx={{ maxWidth: 600 }}>
          <CardHeader title={<Typography variant="subtitle1" fontWeight={600}>Notification Preferences</Typography>} />
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {(
                [
                  { key: 'emailAlerts', label: 'Email Alerts', desc: 'Receive alerts via email' },
                  { key: 'pushAlerts', label: 'Push Notifications', desc: 'Browser push notifications' },
                  { key: 'smsAlerts', label: 'SMS Alerts', desc: 'Text message notifications' },
                  { key: 'criticalOnly', label: 'Critical Alerts Only', desc: 'Only receive critical severity alerts' },
                  { key: 'dailyDigest', label: 'Daily Digest', desc: 'Daily summary email' },
                  { key: 'maintenanceReminders', label: 'Maintenance Reminders', desc: 'Upcoming maintenance reminders' },
                ] as const
              ).map(({ key, label, desc }) => (
                <Box key={key}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5 }}>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>{label}</Typography>
                      <Typography variant="caption" color="text.secondary">{desc}</Typography>
                    </Box>
                    <Switch
                      checked={notifications[key]}
                      onChange={(e) => setNotifications((prev) => ({ ...prev, [key]: e.target.checked }))}
                      sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#00B4D8' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#00B4D8' } }}
                    />
                  </Box>
                  <Divider sx={{ borderColor: 'rgba(148,163,184,0.06)' }} />
                </Box>
              ))}
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                sx={{ mt: 1, alignSelf: 'flex-start' }}
                onClick={() => enqueueSnackbar('Notification preferences saved', { variant: 'success' })}
              >
                Save Preferences
              </Button>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Security Tab */}
      <TabPanel value={tab} index={2}>
        <Card sx={{ maxWidth: 500 }}>
          <CardHeader title={<Typography variant="subtitle1" fontWeight={600}>Change Password</Typography>} />
          <CardContent>
            <form onSubmit={handlePasswordSubmit(onPasswordSave)}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Controller name="currentPassword" control={passwordControl} render={({ field }) => (
                  <TextField {...field} label="Current Password" type="password" fullWidth size="small" />
                )} />
                <Controller name="newPassword" control={passwordControl} rules={{ minLength: 8 }} render={({ field }) => (
                  <TextField {...field} label="New Password" type="password" fullWidth size="small" helperText="Minimum 8 characters" />
                )} />
                <Controller name="confirmPassword" control={passwordControl} render={({ field }) => (
                  <TextField {...field} label="Confirm New Password" type="password" fullWidth size="small" />
                )} />
                <Button type="submit" variant="contained" startIcon={<SecurityIcon />} sx={{ alignSelf: 'flex-start' }}>
                  Update Password
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      </TabPanel>

      {/* System Tab (Admin only) */}
      {user?.role === 'ADMIN' && (
        <TabPanel value={tab} index={3}>
          <Card sx={{ maxWidth: 600 }}>
            <CardHeader title={<Typography variant="subtitle1" fontWeight={600}>System Configuration</Typography>} />
            <CardContent>
              <Alert severity="info" sx={{ mb: 2 }}>System configuration changes affect all users.</Alert>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField label="Session Timeout (minutes)" type="number" defaultValue={60} size="small" fullWidth />
                <TextField label="Data Retention (days)" type="number" defaultValue={90} size="small" fullWidth />
                <TextField label="Telemetry Interval (seconds)" type="number" defaultValue={30} size="small" fullWidth />
                <TextField label="Geofence Alert Cooldown (minutes)" type="number" defaultValue={15} size="small" fullWidth />
                <Button variant="contained" startIcon={<SaveIcon />} sx={{ alignSelf: 'flex-start' }}
                  onClick={() => enqueueSnackbar('System configuration saved', { variant: 'success' })}>
                  Save Configuration
                </Button>
              </Box>
            </CardContent>
          </Card>
        </TabPanel>
      )}
    </Box>
  );
};

export default SettingsPage;
