import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import vehicleReducer from './vehicleSlice';
import telemetryReducer from './telemetrySlice';
import alertReducer from './alertSlice';
import maintenanceReducer from './maintenanceSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    vehicles: vehicleReducer,
    telemetry: telemetryReducer,
    alerts: alertReducer,
    maintenance: maintenanceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
