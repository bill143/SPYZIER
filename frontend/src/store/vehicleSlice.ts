import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Vehicle, PaginatedResponse } from '../types';
import { vehicleApi } from '../services/api';

interface VehicleState {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  loading: boolean;
  error: string | null;
  totalCount: number;
}

const initialState: VehicleState = {
  vehicles: [],
  selectedVehicle: null,
  loading: false,
  error: null,
  totalCount: 0,
};

export const fetchVehicles = createAsyncThunk(
  'vehicles/fetchAll',
  async (params: { page?: number; size?: number; status?: string; search?: string } = {}, { rejectWithValue }) => {
    try {
      return await vehicleApi.getAll(params);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch vehicles');
    }
  }
);

export const fetchVehicleById = createAsyncThunk(
  'vehicles/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await vehicleApi.getById(id);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch vehicle');
    }
  }
);

export const updateVehicleStatus = createAsyncThunk(
  'vehicles/updateStatus',
  async ({ id, status }: { id: string; status: string }, { rejectWithValue }) => {
    try {
      return await vehicleApi.updateStatus(id, status);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to update vehicle status');
    }
  }
);

export const createVehicle = createAsyncThunk(
  'vehicles/create',
  async (data: Partial<Vehicle>, { rejectWithValue }) => {
    try {
      return await vehicleApi.create(data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to create vehicle');
    }
  }
);

export const deleteVehicle = createAsyncThunk(
  'vehicles/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await vehicleApi.delete(id);
      return id;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to delete vehicle');
    }
  }
);

const vehicleSlice = createSlice({
  name: 'vehicles',
  initialState,
  reducers: {
    setSelectedVehicle(state, action: PayloadAction<Vehicle | null>) {
      state.selectedVehicle = action.payload;
    },
    updateVehicleLive(state, action: PayloadAction<Partial<Vehicle> & { id: string }>) {
      const idx = state.vehicles.findIndex((v) => v.id === action.payload.id);
      if (idx !== -1) {
        state.vehicles[idx] = { ...state.vehicles[idx], ...action.payload };
      }
      if (state.selectedVehicle?.id === action.payload.id) {
        state.selectedVehicle = { ...state.selectedVehicle, ...action.payload };
      }
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVehicles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as PaginatedResponse<Vehicle> | Vehicle[];
        state.vehicles = Array.isArray(payload) ? payload : payload.content;
        state.totalCount = Array.isArray(payload) ? payload.length : (payload.totalElements ?? payload.content.length);
      })
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchVehicleById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchVehicleById.fulfilled, (state, action: PayloadAction<Vehicle>) => {
        state.loading = false;
        state.selectedVehicle = action.payload;
      })
      .addCase(fetchVehicleById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateVehicleStatus.fulfilled, (state, action: PayloadAction<Vehicle>) => {
        const idx = state.vehicles.findIndex((v) => v.id === action.payload.id);
        if (idx !== -1) state.vehicles[idx] = action.payload;
        if (state.selectedVehicle?.id === action.payload.id) {
          state.selectedVehicle = action.payload;
        }
      })
      .addCase(createVehicle.fulfilled, (state, action: PayloadAction<Vehicle>) => {
        state.vehicles.unshift(action.payload);
        state.totalCount += 1;
      })
      .addCase(deleteVehicle.fulfilled, (state, action: PayloadAction<string>) => {
        state.vehicles = state.vehicles.filter((v) => v.id !== action.payload);
        state.totalCount -= 1;
      });
  },
});

export const { setSelectedVehicle, updateVehicleLive, clearError } = vehicleSlice.actions;
export default vehicleSlice.reducer;
