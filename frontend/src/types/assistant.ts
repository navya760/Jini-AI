export type ChatSender = 'user' | 'ai' | 'system';

export type ChatMessage = {
  sender: ChatSender;
  text: string;
};

export type WSClientMessage = {
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
