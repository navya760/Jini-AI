import { JiniClient } from './client';
import { createWebSocketUrl } from './config';

export type JiniConfig = {
  serverUrl: string;
  websocketPath?: string;
  apiKey?: string;
};

class JiniSDK {
  private client: JiniClient | null = null;

  init(config: JiniConfig) {
    const websocketUrl = createWebSocketUrl(config.serverUrl, config.websocketPath);
    this.client = new JiniClient({ websocketUrl, apiKey: config.apiKey });
    return this.client;
  }

  chat(message: string, sessionId = 'default') {
    if (!this.client) {
      throw new Error('Jini SDK is not initialized. Call Jini.init first.');
    }
    return this.client.chat(message, sessionId);
  }

  voice(audioBase64: string, mimeType = 'audio/webm', sessionId = 'default') {
    if (!this.client) {
      throw new Error('Jini SDK is not initialized. Call Jini.init first.');
    }
    return this.client.voice(audioBase64, mimeType, sessionId);
  }
}

export const Jini = new JiniSDK();

if (typeof window !== 'undefined') {
  (window as any).Jini = Jini;
}
