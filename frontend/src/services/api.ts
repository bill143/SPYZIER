import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import {
  User,
  Vehicle,
  Driver,
  Telemetry,
  MaintenanceRecord,
  Alert,
  DashboardSummary,
  FleetReport,
  AuthTokens,
  PaginatedResponse,
} from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('accessToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const res = await axios.post(`${BASE_URL}/api/auth/refresh`, { refreshToken });
          const { accessToken } = res.data;
          localStorage.setItem('accessToken', accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      } else {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (username: string, password: string): Promise<{ user: User; tokens: AuthTokens }> => {
    const res = await api.post('/api/auth/login', { username, password });
    return res.data;
  },
  register: async (data: Partial<User> & { password: string }): Promise<{ user: User; tokens: AuthTokens }> => {
    const res = await api.post('/api/auth/register', data);
    return res.data;
  },
  logout: async (): Promise<void> => {
    await api.post('/api/auth/logout');
  },
  refresh: async (refreshToken: string): Promise<AuthTokens> => {
    const res = await api.post('/api/auth/refresh', { refreshToken });
    return res.data;
  },
  me: async (): Promise<User> => {
    const res = await api.get('/api/auth/me');
    return res.data;
  },
};

export const vehicleApi = {
  getAll: async (params: object = {}): Promise<PaginatedResponse<Vehicle>> => {
    const res = await api.get('/api/vehicles', { params });
    return res.data;
  },
  getById: async (id: string): Promise<Vehicle> => {
    const res = await api.get(`/api/vehicles/${id}`);
    return res.data;
  },
  create: async (data: Partial<Vehicle>): Promise<Vehicle> => {
    const res = await api.post('/api/vehicles', data);
    return res.data;
  },
  update: async (id: string, data: Partial<Vehicle>): Promise<Vehicle> => {
    const res = await api.put(`/api/vehicles/${id}`, data);
    return res.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/vehicles/${id}`);
  },
  updateStatus: async (id: string, status: string): Promise<Vehicle> => {
    const res = await api.patch(`/api/vehicles/${id}/status`, { status });
    return res.data;
  },
  getLocation: async (id: string) => {
    const res = await api.get(`/api/vehicles/${id}/location`);
    return res.data;
  },
  getTelemetryHistory: async (
    id: string,
    params: { from?: string; to?: string; limit?: number } = {}
  ): Promise<Telemetry[]> => {
    const res = await api.get(`/api/vehicles/${id}/telemetry/history`, { params });
    return res.data;
  },
};

export const telemetryApi = {
  ingest: async (data: Partial<Telemetry>): Promise<Telemetry> => {
    const res = await api.post('/api/telemetry', data);
    return res.data;
  },
  getLatest: async (vehicleId: string): Promise<Telemetry> => {
    const res = await api.get(`/api/telemetry/latest/${vehicleId}`);
    return res.data;
  },
  getHistory: async (vehicleId: string, params: object = {}): Promise<Telemetry[]> => {
    const res = await api.get(`/api/telemetry/${vehicleId}/history`, { params });
    return res.data;
  },
};

export const maintenanceApi = {
  getAll: async (params: object = {}): Promise<PaginatedResponse<MaintenanceRecord>> => {
    const res = await api.get('/api/maintenance', { params });
    return res.data;
  },
  getById: async (id: string): Promise<MaintenanceRecord> => {
    const res = await api.get(`/api/maintenance/${id}`);
    return res.data;
  },
  create: async (data: Partial<MaintenanceRecord>): Promise<MaintenanceRecord> => {
    const res = await api.post('/api/maintenance', data);
    return res.data;
  },
  update: async (id: string, data: Partial<MaintenanceRecord>): Promise<MaintenanceRecord> => {
    const res = await api.put(`/api/maintenance/${id}`, data);
    return res.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/maintenance/${id}`);
  },
  getUpcoming: async (days: number = 7): Promise<MaintenanceRecord[]> => {
    const res = await api.get('/api/maintenance/upcoming', { params: { days } });
    return res.data;
  },
};

export const alertApi = {
  getAll: async (params: object = {}): Promise<PaginatedResponse<Alert>> => {
    const res = await api.get('/api/alerts', { params });
    return res.data;
  },
  getById: async (id: string): Promise<Alert> => {
    const res = await api.get(`/api/alerts/${id}`);
    return res.data;
  },
  acknowledge: async (id: string): Promise<Alert> => {
    const res = await api.patch(`/api/alerts/${id}/acknowledge`);
    return res.data;
  },
  acknowledgeAll: async (): Promise<void> => {
    await api.patch('/api/alerts/acknowledge-all');
  },
};

export const dashboardApi = {
  getSummary: async (): Promise<DashboardSummary> => {
    const res = await api.get('/api/dashboard/summary');
    return res.data;
  },
};

export const driverApi = {
  getAll: async (params: object = {}): Promise<PaginatedResponse<Driver>> => {
    const res = await api.get('/api/drivers', { params });
    return res.data;
  },
  getById: async (id: string): Promise<Driver> => {
    const res = await api.get(`/api/drivers/${id}`);
    return res.data;
  },
  create: async (data: Partial<Driver>): Promise<Driver> => {
    const res = await api.post('/api/drivers', data);
    return res.data;
  },
  update: async (id: string, data: Partial<Driver>): Promise<Driver> => {
    const res = await api.put(`/api/drivers/${id}`, data);
    return res.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/drivers/${id}`);
  },
};

export const reportApi = {
  getFleetReport: async (params: { from: string; to: string }): Promise<FleetReport> => {
    const res = await api.get('/api/reports/fleet', { params });
    return res.data;
  },
  getMaintenanceReport: async (params: { from: string; to: string }) => {
    const res = await api.get('/api/reports/maintenance', { params });
    return res.data;
  },
  getDriverReport: async (params: { from: string; to: string; driverId?: string }) => {
    const res = await api.get('/api/reports/driver-activity', { params });
    return res.data;
  },
  exportCsv: async (type: string, params: object = {}): Promise<Blob> => {
    const res = await api.get(`/api/reports/${type}/export`, {
      params,
      responseType: 'blob',
    });
    return res.data;
  },
};

export default api;
