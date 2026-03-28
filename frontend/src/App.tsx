import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const FleetPage = React.lazy(() => import('./pages/FleetPage'));
const VehicleDetailPage = React.lazy(() => import('./pages/VehicleDetailPage'));
const MapPage = React.lazy(() => import('./pages/MapPage'));
const MaintenancePage = React.lazy(() => import('./pages/MaintenancePage'));
const AlertsPage = React.lazy(() => import('./pages/AlertsPage'));
const DriversPage = React.lazy(() => import('./pages/DriversPage'));
const ReportsPage = React.lazy(() => import('./pages/ReportsPage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));

const PageLoader = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
    <CircularProgress sx={{ color: '#00B4D8' }} />
  </Box>
);

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="fleet" element={<FleetPage />} />
          <Route path="vehicles/:id" element={<VehicleDetailPage />} />
          <Route path="map" element={<MapPage />} />
          <Route path="maintenance" element={<MaintenancePage />} />
          <Route path="alerts" element={<AlertsPage />} />
          <Route path="drivers" element={<DriversPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
