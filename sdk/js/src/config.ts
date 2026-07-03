import type { JiniConfig } from './index';

export function createWebSocketUrl(serverUrl: string, websocketPath?: string) {
  const normalizedHost = serverUrl.replace(/\/$/, '');
  const path = websocketPath ? websocketPath.replace(/^\//, '') : 'ws';
  const protocol = normalizedHost.startsWith('https') ? 'wss' : 'ws';
  return `${protocol}://${normalizedHost.replace(/^https?:\/\//, '')}/${path}`;
}
