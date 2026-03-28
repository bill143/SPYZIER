import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Telemetry, Alert } from '../types';

type TelemetryCallback = (data: Telemetry) => void;
type AlertCallback = (data: Alert) => void;

class WebSocketService {
  private client: Client | null = null;
  private telemetrySubscriptions: Map<string, ReturnType<Client['subscribe']>> = new Map();
  private alertSubscription: ReturnType<Client['subscribe']> | null = null;
  private connected = false;
  private connectPromise: Promise<void> | null = null;

  connect(token: string): Promise<void> {
    if (this.connected && this.client?.connected) return Promise.resolve();
    if (this.connectPromise) return this.connectPromise;

    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';

    this.connectPromise = new Promise((resolve, reject) => {
      this.client = new Client({
        webSocketFactory: () => new SockJS(wsUrl) as WebSocket,
        connectHeaders: { Authorization: `Bearer ${token}` },
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        reconnectDelay: 5000,
        onConnect: () => {
          this.connected = true;
          this.connectPromise = null;
          resolve();
        },
        onStompError: (frame) => {
          console.error('STOMP error', frame);
          this.connected = false;
          this.connectPromise = null;
          reject(new Error(frame.headers['message'] || 'STOMP connection error'));
        },
        onDisconnect: () => {
          this.connected = false;
        },
      });
      this.client.activate();
    });

    return this.connectPromise;
  }

  subscribe(vehicleId: string, callback: TelemetryCallback): () => void {
    if (!this.client || !this.connected) {
      console.warn('WebSocket not connected. Cannot subscribe to telemetry.');
      return () => {};
    }
    if (this.telemetrySubscriptions.has(vehicleId)) {
      this.telemetrySubscriptions.get(vehicleId)?.unsubscribe();
    }
    const sub = this.client.subscribe(`/topic/telemetry/${vehicleId}`, (message: IMessage) => {
      try {
        const data: Telemetry = JSON.parse(message.body);
        callback(data);
      } catch (e) {
        console.error('Failed to parse telemetry message', e);
      }
    });
    this.telemetrySubscriptions.set(vehicleId, sub);
    return () => {
      sub.unsubscribe();
      this.telemetrySubscriptions.delete(vehicleId);
    };
  }

  subscribeToAlerts(callback: AlertCallback): () => void {
    if (!this.client || !this.connected) {
      console.warn('WebSocket not connected. Cannot subscribe to alerts.');
      return () => {};
    }
    if (this.alertSubscription) {
      this.alertSubscription.unsubscribe();
    }
    this.alertSubscription = this.client.subscribe('/topic/alerts', (message: IMessage) => {
      try {
        const data: Alert = JSON.parse(message.body);
        callback(data);
      } catch (e) {
        console.error('Failed to parse alert message', e);
      }
    });
    return () => {
      this.alertSubscription?.unsubscribe();
      this.alertSubscription = null;
    };
  }

  subscribeToFleet(callback: TelemetryCallback): () => void {
    if (!this.client || !this.connected) {
      console.warn('WebSocket not connected. Cannot subscribe to fleet.');
      return () => {};
    }
    const sub = this.client.subscribe('/topic/fleet', (message: IMessage) => {
      try {
        const data: Telemetry = JSON.parse(message.body);
        callback(data);
      } catch (e) {
        console.error('Failed to parse fleet message', e);
      }
    });
    return () => sub.unsubscribe();
  }

  disconnect(): void {
    this.telemetrySubscriptions.forEach((sub) => sub.unsubscribe());
    this.telemetrySubscriptions.clear();
    this.alertSubscription?.unsubscribe();
    this.alertSubscription = null;
    this.client?.deactivate();
    this.client = null;
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected && (this.client?.connected ?? false);
  }
}

const websocketService = new WebSocketService();
export default websocketService;
