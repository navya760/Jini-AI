/**
 * WebSocket Service for Real-time Communication
 * Manages WebSocket connections and provides event callbacks
 */

type MessageCallback = (data: any) => void;
type VoidCallback = () => void;
type ErrorCallback = (error: Event) => void;

interface WebSocketCallbacks {
  onOpen?: VoidCallback;
  onMessage?: MessageCallback;
  onClose?: VoidCallback;
  onError?: ErrorCallback;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private isConnected: boolean = false;
  private callbacks: WebSocketCallbacks = {};

  constructor(url: string = 'ws://127.0.0.1:8000/ws') {
    this.url = url;
  }

  /**
   * Register event callbacks
   * @param event - Event name ('onOpen', 'onMessage', 'onClose', 'onError')
   * @param callback - Callback function to execute
   */
  public on(event: keyof WebSocketCallbacks, callback: any): void {
    this.callbacks[event] = callback;
  }

  /**
   * Connect to the WebSocket server
   * @returns Promise that resolves when connected
   */
  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          this.isConnected = true;
          console.log('[WebSocket] Connected');
          this.callbacks.onOpen?.();
          resolve();
        };

        this.ws.onmessage = (event: MessageEvent) => {
          try {
            const data = JSON.parse(event.data);
            this.callbacks.onMessage?.(data);
          } catch (error) {
            console.error('[WebSocket] Failed to parse JSON:', error);
            this.callbacks.onMessage?.(event.data);
          }
        };

        this.ws.onclose = () => {
          this.isConnected = false;
          console.log('[WebSocket] Disconnected');
          this.callbacks.onClose?.();
        };

        this.ws.onerror = (error: Event) => {
          console.error('[WebSocket] Error:', error);
          this.callbacks.onError?.(error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from the WebSocket server
   */
  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }

  /**
   * Send a message to the server
   * @param message - Message to send (string or object)
   */
  public sendMessage(message: any): void {
    if (!this.isConnected || !this.ws) {
      console.warn('[WebSocket] Cannot send - not connected');
      return;
    }

    try {
      const messageString = typeof message === 'string'
        ? message
        : JSON.stringify(message);
      this.ws.send(messageString);
    } catch (error) {
      console.error('[WebSocket] Failed to send message:', error);
    }
  }

  /**
   * Check connection status
   * @returns true if connected to the server
   */
  public isConnectedToServer(): boolean {
    return this.isConnected;
  }
}

// Export singleton instance
export const webSocketService = new WebSocketService();

// Export the class for advanced usage
export default WebSocketService;
