import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Alert, AlertSeverity, PaginatedResponse } from '../types';
import { alertApi } from '../services/api';

interface AlertState {
  alerts: Alert[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  totalCount: number;
  severityFilter: AlertSeverity | 'ALL';
}

const initialState: AlertState = {
  alerts: [],
  unreadCount: 0,
  loading: false,
  error: null,
  totalCount: 0,
  severityFilter: 'ALL',
};

export const fetchAlerts = createAsyncThunk(
  'alerts/fetchAll',
  async (
    params: { page?: number; size?: number; severity?: string; acknowledged?: boolean } = {},
    { rejectWithValue }
  ) => {
    try {
      return await alertApi.getAll(params);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch alerts');
    }
  }
);

export const acknowledgeAlert = createAsyncThunk(
  'alerts/acknowledge',
  async (id: string, { rejectWithValue }) => {
    try {
      return await alertApi.acknowledge(id);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to acknowledge alert');
    }
  }
);

const alertSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    addLiveAlert(state, action: PayloadAction<Alert>) {
      state.alerts.unshift(action.payload);
      if (!action.payload.acknowledged) {
        state.unreadCount += 1;
      }
      state.totalCount += 1;
    },
    setSeverityFilter(state, action: PayloadAction<AlertSeverity | 'ALL'>) {
      state.severityFilter = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
    markAllRead(state) {
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAlerts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAlerts.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as PaginatedResponse<Alert> | Alert[];
        const list = Array.isArray(payload) ? payload : payload.content;
        state.alerts = list;
        state.totalCount = Array.isArray(payload) ? payload.length : (payload.totalElements ?? list.length);
        state.unreadCount = list.filter((a: Alert) => !a.acknowledged).length;
      })
      .addCase(fetchAlerts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(acknowledgeAlert.fulfilled, (state, action: PayloadAction<Alert>) => {
        const idx = state.alerts.findIndex((a) => a.id === action.payload.id);
        if (idx !== -1) {
          state.alerts[idx] = action.payload;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      });
  },
});

export const { addLiveAlert, setSeverityFilter, clearError, markAllRead } = alertSlice.actions;
export default alertSlice.reducer;
