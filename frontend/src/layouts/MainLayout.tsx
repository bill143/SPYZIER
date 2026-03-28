import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Badge,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  DirectionsCar as FleetIcon,
  Map as MapIcon,
  Build as MaintenanceIcon,
  NotificationsNone as AlertsIcon,
  People as DriversIcon,
  Assessment as ReportsIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
  ChevronLeft as CollapseIcon,
  Logout as LogoutIcon,
  Person as ProfileIcon,
  FiberManualRecord as OnlineIcon,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { RootState, AppDispatch } from '../store';
import { logout } from '../store/authSlice';

const DRAWER_WIDTH = 260;
const DRAWER_COLLAPSED = 72;

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: number;
}

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { vehicles, totalCount } = useSelector((state: RootState) => state.vehicles);
  const { unreadCount } = useSelector((state: RootState) => state.alerts);

  const [collapsed, setCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const activeVehicles = vehicles.filter((v) => v.status === 'ACTIVE').length;

  const navItems: NavItem[] = [
    { label: 'Dashboard', path: '/', icon: <DashboardIcon /> },
    { label: 'Fleet', path: '/fleet', icon: <FleetIcon />, badge: totalCount },
    { label: 'Live Map', path: '/map', icon: <MapIcon /> },
    { label: 'Maintenance', path: '/maintenance', icon: <MaintenanceIcon /> },
    { label: 'Alerts', path: '/alerts', icon: <AlertsIcon />, badge: unreadCount },
    { label: 'Drivers', path: '/drivers', icon: <DriversIcon /> },
    { label: 'Reports', path: '/reports', icon: <ReportsIcon /> },
    { label: 'Settings', path: '/settings', icon: <SettingsIcon /> },
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const drawerWidth = collapsed ? DRAWER_COLLAPSED : DRAWER_WIDTH;

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          transition: 'width 0.3s ease',
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            overflow: 'hidden',
            transition: 'width 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        {/* Logo */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            px: collapsed ? 1 : 2.5,
            py: 2.5,
            borderBottom: '1px solid rgba(148,163,184,0.08)',
            minHeight: 72,
          }}
        >
          {!collapsed && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #00B4D8, #0077B6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0, 180, 216, 0.4)',
                }}
              >
                <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '1rem' }}>S</Typography>
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: '1.1rem',
                    background: 'linear-gradient(135deg, #00B4D8, #48CAE4)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    lineHeight: 1,
                  }}
                >
                  SPYZIER
                </Typography>
                <Typography sx={{ fontSize: '0.62rem', color: 'text.secondary', letterSpacing: '0.1em' }}>
                  FLEET MONITOR
                </Typography>
              </Box>
            </Box>
          )}
          {collapsed && (
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #00B4D8, #0077B6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0, 180, 216, 0.4)',
              }}
            >
              <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '1rem' }}>S</Typography>
            </Box>
          )}
          {!collapsed && (
            <IconButton size="small" onClick={() => setCollapsed(true)} sx={{ color: 'text.secondary' }}>
              <CollapseIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        {/* Fleet Status Bar */}
        {!collapsed && (
          <Box
            sx={{
              mx: 2,
              my: 1.5,
              p: 1.5,
              borderRadius: 2,
              background: 'rgba(0, 180, 216, 0.06)',
              border: '1px solid rgba(0, 180, 216, 0.12)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Fleet Status
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <OnlineIcon sx={{ fontSize: 8, color: '#10b981', animation: 'pulse 2s infinite' }} />
                <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600 }}>
                  {activeVehicles} Active
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip
                label={`${totalCount} Total`}
                size="small"
                sx={{ fontSize: '0.65rem', height: 20, backgroundColor: 'rgba(0,180,216,0.1)', color: '#00B4D8' }}
              />
            </Box>
          </Box>
        )}

        {/* Navigation */}
        <List sx={{ flex: 1, py: 1, px: 0.5 }}>
          {navItems.map((item) => {
            const isActive =
              item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
            return (
              <Tooltip key={item.path} title={collapsed ? item.label : ''} placement="right">
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  selected={isActive}
                  sx={{
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    px: collapsed ? 1.5 : 1.5,
                    borderLeft: isActive ? '2px solid #00B4D8' : '2px solid transparent',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive ? '#00B4D8' : 'text.secondary',
                      minWidth: collapsed ? 0 : 40,
                      mr: collapsed ? 0 : 0,
                    }}
                  >
                    {item.badge && item.badge > 0 ? (
                      <Badge badgeContent={item.badge} color="error" max={99}>
                        {item.icon}
                      </Badge>
                    ) : (
                      item.icon
                    )}
                  </ListItemIcon>
                  {!collapsed && (
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: '0.875rem',
                        fontWeight: isActive ? 600 : 500,
                        color: isActive ? '#00B4D8' : 'text.primary',
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            );
          })}
        </List>

        {/* Bottom */}
        <Box sx={{ borderTop: '1px solid rgba(148,163,184,0.08)', p: 1.5 }}>
          {!collapsed && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1, py: 1 }}>
              <Avatar
                sx={{
                  width: 34,
                  height: 34,
                  background: 'linear-gradient(135deg, #00B4D8, #0077B6)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                }}
              >
                {user?.fullName?.charAt(0) || 'U'}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{ fontSize: '0.8rem', fontWeight: 600, color: 'text.primary', lineHeight: 1.2 }}
                  noWrap
                >
                  {user?.fullName || 'User'}
                </Typography>
                <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary' }} noWrap>
                  {user?.role || 'VIEWER'}
                </Typography>
              </Box>
            </Box>
          )}
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              textAlign: 'center',
              color: 'text.disabled',
              fontSize: '0.6rem',
              mt: collapsed ? 0 : 0.5,
            }}
          >
            {collapsed ? 'v1.0' : 'SPYZIER v1.0.0'}
          </Typography>
        </Box>
      </Drawer>

      {/* Main area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Top AppBar */}
        <AppBar position="static" elevation={0}>
          <Toolbar sx={{ gap: 1, minHeight: '60px !important' }}>
            <IconButton
              edge="start"
              onClick={() => setCollapsed((c) => !c)}
              sx={{ color: 'text.secondary' }}
              size="small"
            >
              <MenuIcon fontSize="small" />
            </IconButton>

            <Typography
              sx={{
                flex: 1,
                fontSize: '0.9rem',
                fontWeight: 600,
                color: 'text.secondary',
              }}
            >
              {navItems.find((n) => (n.path === '/' ? location.pathname === '/' : location.pathname.startsWith(n.path)))?.label || 'SPYZIER'}
            </Typography>

            {/* Notifications */}
            <Tooltip title="Alerts">
              <IconButton onClick={() => navigate('/alerts')} size="small" sx={{ color: 'text.secondary' }}>
                <Badge badgeContent={unreadCount} color="error" max={99}>
                  <AlertsIcon fontSize="small" />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Avatar menu */}
            <IconButton
              onClick={(e) => setAnchorEl(e.currentTarget)}
              size="small"
              sx={{ ml: 0.5 }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  background: 'linear-gradient(135deg, #00B4D8, #0077B6)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                }}
              >
                {user?.fullName?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                sx: {
                  mt: 0.5,
                  minWidth: 200,
                  background: '#1a2235',
                  border: '1px solid rgba(0,180,216,0.15)',
                },
              }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle2" color="text.primary" fontWeight={700}>
                  {user?.fullName || 'User'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.email || ''}
                </Typography>
              </Box>
              <Divider sx={{ borderColor: 'rgba(148,163,184,0.1)' }} />
              <MenuItem
                onClick={() => { navigate('/settings'); setAnchorEl(null); }}
                sx={{ gap: 1.5, py: 1.2 }}
              >
                <ProfileIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                <Typography variant="body2">Profile</Typography>
              </MenuItem>
              <MenuItem onClick={handleLogout} sx={{ gap: 1.5, py: 1.2, color: '#ef4444' }}>
                <LogoutIcon fontSize="small" />
                <Typography variant="body2">Logout</Typography>
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            overflow: 'auto',
            p: 3,
            backgroundColor: 'background.default',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
