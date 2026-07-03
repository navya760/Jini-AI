import { WSClientMessage } from '../types/assistant';

type MessageCallback = (data: any) => void;
type VoidCallback = () => void;
type ErrorCallback = (error: Event) => void;

interface WebSocketCallbacks {
  open?: VoidCallback;
  message?: MessageCallback;
  close?: VoidCallback;
  error?: ErrorCallback;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private isConnected = false;
  private callbacks: WebSocketCallbacks = {};

constructor(url: string = 'ws://127.0.0.1:8000/ws')   {
    this.url = url;
  }

  public on(event: keyof WebSocketCallbacks, callback: any): void {
    this.callbacks[event] = callback;
  }

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          this.isConnected = true;
          this.callbacks.open?.();
          resolve();
        };

        this.ws.onmessage = (event: MessageEvent<string>) => {
          let payload: any = event.data;
          try {
            payload = JSON.parse(event.data);
          } catch (error) {
            console.warn('[WebSocket] Received non-JSON payload');
          }
          this.callbacks.message?.(payload);
        };

        this.ws.onclose = () => {
          this.isConnected = false;
          this.callbacks.close?.();
        };

        this.ws.onerror = (event: Event) => {
          this.isConnected = false;
          this.callbacks.error?.(event);
          reject(event);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }

  public sendMessage(message: WSClientMessage | string): void {
    if (!this.isConnected || !this.ws) {
      console.warn('[WebSocket] Cannot send - no active connection');
      return;
    }

    const payload = typeof message === 'string' ? message : JSON.stringify(message);
    this.ws.send(payload);
  }

  public isConnectedToServer(): boolean {
    return this.isConnected;
  }
}

export const webSocketService = new WebSocketService();
export default WebSocketService;
