import { JiniClientOptions, WSMessage, WSResponseMessage } from './types';

export class JiniClient {
  private websocketUrl: string;
  private apiKey?: string;
  private socket: WebSocket | null = null;
  private connected = false;
  private eventHandlers: Record<string, Function[]> = {
    open: [],
    message: [],
    close: [],
    error: [],
  };

  constructor(options: JiniClientOptions) {
    this.websocketUrl = options.websocketUrl;
    this.apiKey = options.apiKey;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket) {
        resolve();
        return;
      }

      this.socket = new WebSocket(this.websocketUrl);

      this.socket.onopen = () => {
        this.connected = true;
        this.emit('open');
        resolve();
      };

      this.socket.onmessage = (event: MessageEvent) => {
        let data: any = event.data;
        try {
          data = JSON.parse(event.data);
        } catch {
          // Keep raw text if not JSON
        }
        this.emit('message', data);
      };

      this.socket.onclose = () => {
        this.connected = false;
        this.socket = null;
        this.emit('close');
      };

      this.socket.onerror = (error) => {
        this.emit('error', error);
        reject(error);
      };
    });
  }

  async chat(message: string, sessionId = 'default'): Promise<WSResponseMessage> {
    await this.ensureConnected();
    const payload: WSMessage = {
      type: 'text',
      payload: { message },
      sessionId,
    };
    this.send(payload);
    return this.waitForResponse();
  }

  async voice(audioBase64: string, mimeType = 'audio/webm', sessionId = 'default'): Promise<WSResponseMessage> {
    await this.ensureConnected();
    const payload: WSMessage = {
      type: 'voice',
      payload: { audio: audioBase64, mimeType },
      sessionId,
    };
    this.send(payload);
    return this.waitForResponse();
  }

  on(event: 'open' | 'message' | 'close' | 'error', handler: Function) {
    this.eventHandlers[event].push(handler);
  }

  close() {
    if (this.socket) {
      this.socket.close();
    }
  }

  private send(data: WSMessage) {
    if (!this.socket || !this.connected) {
      throw new Error('WebSocket connection is not open.');
    }
    this.socket.send(JSON.stringify(data));
  }

  private ensureConnected(): Promise<void> {
    if (this.connected) {
      return Promise.resolve();
    }
    return this.connect();
  }

  private waitForResponse(): Promise<WSResponseMessage> {
    return new Promise((resolve, reject) => {
      const listener = (message: WSResponseMessage) => {
        if (message.type === 'assistant.response' || message.type === 'assistant.error') {
          window.clearTimeout(timeout);
          this.off('message', listener);
          resolve(message);
        }
      };

      const timeout = window.setTimeout(() => {
        this.off('message', listener);
        reject(new Error('Timed out waiting for assistant response.'));
      }, 20000);

      this.on('message', listener);
    });
  }

  private emit(event: keyof typeof this.eventHandlers, payload?: any) {
    this.eventHandlers[event].forEach((handler) => handler(payload));
  }

  private off(event: keyof typeof this.eventHandlers, handler: Function) {
    this.eventHandlers[event] = this.eventHandlers[event].filter((cb) => cb !== handler);
  }
}
