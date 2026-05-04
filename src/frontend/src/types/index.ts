export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: number;
  emotion?: string;
}

export type EmotionType = 'happy' | 'sad' | 'angry' | 'surprised' | 'neutral';

export interface EmotionState {
  type: EmotionType;
  intensity: number;
  lastUpdate: number;
}

export type PersonaType = 'gentle' | 'cute' | 'playful' | 'loli' | '御姐';

export interface PersonaConfig {
  type: PersonaType;
  name: string;
  emoji: string;
}

export interface ChatRequest {
  message: string;
  sessionId?: string;
  persona?: PersonaType;
}

export interface ChatResponse {
  message: string;
  emotion: EmotionState;
  sessionId: string;
}
