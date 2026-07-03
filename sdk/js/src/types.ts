export type WSMessage = {
  type: 'text' | 'voice';
  payload: {
    message?: string;
    audio?: string;
    mimeType?: string;
  };
  sessionId: string;
};

export type WSResponseMessage = {
  type: 'assistant.response' | 'assistant.error' | string;
  sessionId?: string;
  payload: {
    message: string;
  };
};

export type JiniClientOptions = {
  websocketUrl: string;
  apiKey?: string;
};
