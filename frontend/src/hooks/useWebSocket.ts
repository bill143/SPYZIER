import { useEffect, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import websocketService from '../services/websocket';
import { updateLiveTelemetry } from '../store/telemetrySlice';
import { addLiveAlert } from '../store/alertSlice';
import { updateVehicleLive } from '../store/vehicleSlice';
import { Telemetry, Alert } from '../types';
import { AppDispatch } from '../store';

interface UseWebSocketOptions {
  vehicleIds?: string[];
  subscribeAlerts?: boolean;
  subscribeFleet?: boolean;
  token: string | null;
}

export const useWebSocket = ({
  vehicleIds = [],
  subscribeAlerts = false,
  subscribeFleet = false,
  token,
}: UseWebSocketOptions) => {
  const dispatch = useDispatch<AppDispatch>();
  const unsubscribeFns = useRef<Array<() => void>>([]);

  const handleTelemetry = useCallback(
    (data: Telemetry) => {
      dispatch(updateLiveTelemetry(data));
      dispatch(
        updateVehicleLive({
          id: data.vehicleId,
          speed: data.speed,
          fuelLevel: data.fuelLevel,
          engineTemperature: data.engineTemperature,
          batteryVoltage: data.batteryVoltage,
          location: {
            lat: data.latitude,
            lng: data.longitude,
            speed: data.speed,
            heading: data.heading,
          },
          lastUpdate: data.timestamp,
        })
      );
    },
    [dispatch]
  );

  const handleAlert = useCallback(
    (data: Alert) => {
      dispatch(addLiveAlert(data));
    },
    [dispatch]
  );

  useEffect(() => {
    if (!token) return;

    let mounted = true;

    const setup = async () => {
      try {
        await websocketService.connect(token);
        if (!mounted) return;

        const fns: Array<() => void> = [];

        vehicleIds.forEach((id) => {
          const unsub = websocketService.subscribe(id, handleTelemetry);
          fns.push(unsub);
        });

        if (subscribeAlerts) {
          const unsub = websocketService.subscribeToAlerts(handleAlert);
          fns.push(unsub);
        }

        if (subscribeFleet) {
          const unsub = websocketService.subscribeToFleet(handleTelemetry);
          fns.push(unsub);
        }

        unsubscribeFns.current = fns;
      } catch (err) {
        console.error('WebSocket connection failed:', err);
      }
    };

    setup();

    return () => {
      mounted = false;
      unsubscribeFns.current.forEach((fn) => fn());
      unsubscribeFns.current = [];
    };
  }, [token, vehicleIds.join(','), subscribeAlerts, subscribeFleet, handleTelemetry, handleAlert]);
};

export default useWebSocket;
