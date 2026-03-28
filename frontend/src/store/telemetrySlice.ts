import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Telemetry } from '../types';

interface TelemetryState {
  liveTelemetry: Record<string, Telemetry>;
  telemetryHistory: Record<string, Telemetry[]>;
  loadingHistory: Record<string, boolean>;
}

const initialState: TelemetryState = {
  liveTelemetry: {},
  telemetryHistory: {},
  loadingHistory: {},
};

const MAX_HISTORY_POINTS = 100;

const telemetrySlice = createSlice({
  name: 'telemetry',
  initialState,
  reducers: {
    updateLiveTelemetry(state, action: PayloadAction<Telemetry>) {
      const { vehicleId } = action.payload;
      state.liveTelemetry[vehicleId] = action.payload;
      if (!state.telemetryHistory[vehicleId]) {
        state.telemetryHistory[vehicleId] = [];
      }
      state.telemetryHistory[vehicleId].push(action.payload);
      if (state.telemetryHistory[vehicleId].length > MAX_HISTORY_POINTS) {
        state.telemetryHistory[vehicleId] = state.telemetryHistory[vehicleId].slice(-MAX_HISTORY_POINTS);
      }
    },
    setTelemetryHistory(state, action: PayloadAction<{ vehicleId: string; history: Telemetry[] }>) {
      state.telemetryHistory[action.payload.vehicleId] = action.payload.history;
    },
    setLoadingHistory(state, action: PayloadAction<{ vehicleId: string; loading: boolean }>) {
      state.loadingHistory[action.payload.vehicleId] = action.payload.loading;
    },
    clearVehicleTelemetry(state, action: PayloadAction<string>) {
      delete state.liveTelemetry[action.payload];
      delete state.telemetryHistory[action.payload];
    },
  },
});

export const { updateLiveTelemetry, setTelemetryHistory, setLoadingHistory, clearVehicleTelemetry } =
  telemetrySlice.actions;
export default telemetrySlice.reducer;
