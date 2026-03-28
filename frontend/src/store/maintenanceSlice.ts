import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { MaintenanceRecord, MaintenanceStatus, PaginatedResponse } from '../types';
import { maintenanceApi } from '../services/api';

interface MaintenanceState {
  records: MaintenanceRecord[];
  upcomingRecords: MaintenanceRecord[];
  loading: boolean;
  error: string | null;
  totalCount: number;
}

const initialState: MaintenanceState = {
  records: [],
  upcomingRecords: [],
  loading: false,
  error: null,
  totalCount: 0,
};

export const fetchMaintenanceRecords = createAsyncThunk(
  'maintenance/fetchAll',
  async (
    params: { page?: number; size?: number; status?: MaintenanceStatus; vehicleId?: string } = {},
    { rejectWithValue }
  ) => {
    try {
      return await maintenanceApi.getAll(params);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch maintenance records');
    }
  }
);

export const fetchUpcomingMaintenance = createAsyncThunk(
  'maintenance/fetchUpcoming',
  async (days: number = 7, { rejectWithValue }) => {
    try {
      return await maintenanceApi.getUpcoming(days);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch upcoming maintenance');
    }
  }
);

export const createMaintenanceRecord = createAsyncThunk(
  'maintenance/create',
  async (data: Partial<MaintenanceRecord>, { rejectWithValue }) => {
    try {
      return await maintenanceApi.create(data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to create maintenance record');
    }
  }
);

export const updateMaintenanceRecord = createAsyncThunk(
  'maintenance/update',
  async ({ id, data }: { id: string; data: Partial<MaintenanceRecord> }, { rejectWithValue }) => {
    try {
      return await maintenanceApi.update(id, data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to update maintenance record');
    }
  }
);

export const deleteMaintenanceRecord = createAsyncThunk(
  'maintenance/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await maintenanceApi.delete(id);
      return id;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to delete maintenance record');
    }
  }
);

const maintenanceSlice = createSlice({
  name: 'maintenance',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMaintenanceRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMaintenanceRecords.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as PaginatedResponse<MaintenanceRecord> | MaintenanceRecord[];
        state.records = Array.isArray(payload) ? payload : payload.content;
        state.totalCount = Array.isArray(payload) ? payload.length : (payload.totalElements ?? payload.content.length);
      })
      .addCase(fetchMaintenanceRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchUpcomingMaintenance.fulfilled, (state, action: PayloadAction<MaintenanceRecord[]>) => {
        state.upcomingRecords = action.payload;
      })
      .addCase(createMaintenanceRecord.fulfilled, (state, action: PayloadAction<MaintenanceRecord>) => {
        state.records.unshift(action.payload);
        state.totalCount += 1;
      })
      .addCase(updateMaintenanceRecord.fulfilled, (state, action: PayloadAction<MaintenanceRecord>) => {
        const idx = state.records.findIndex((r) => r.id === action.payload.id);
        if (idx !== -1) state.records[idx] = action.payload;
      })
      .addCase(deleteMaintenanceRecord.fulfilled, (state, action: PayloadAction<string>) => {
        state.records = state.records.filter((r) => r.id !== action.payload);
        state.totalCount -= 1;
      });
  },
});

export const { clearError } = maintenanceSlice.actions;
export default maintenanceSlice.reducer;
