/**
 * 消息类型定义
 */
export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: number;
  emotion?: EmotionType;
}

/**
 * 情感类型定义
 */
export type EmotionType = 'happy' | 'sad' | 'angry' | 'surprised' | 'neutral';

/**
 * 情感状态
 */
export interface EmotionState {
  type: EmotionType;
  intensity: number; // 0-100
  lastUpdate: number;
}

/**
 * 人设类型
 */
export type PersonaType = 'gentle' | 'cute' | 'playful' | 'loli' | '御姐';

/**
 * 人设配置
 */
export interface PersonaConfig {
  type: PersonaType;
  name: string;
  description: string;
  tone: string; // 语气描述
}

/**
 * 记忆类型
 */
export interface MemoryItem {
  id: string;
  content: string;
  timestamp: number;
  importance: number; // 0-100，重要性评分
  category: 'short-term' | 'long-term';
  keywords: string[];
}

/**
 * 会话记录
 */
export interface Session {
  id: string;
  messages: Message[];
  createdAt: number;
  lastUpdated: number;
}

/**
 * AI模型类型
 */
export type AIModelType = 'qianwen' | 'deepseek' | 'kimi';

/**
 * 聊天请求
 */
export interface ChatRequest {
  message: string;
  sessionId?: string;
  persona?: PersonaType;
}

/**
 * 聊天响应
 */
export interface ChatResponse {
  message: string;
  emotion: EmotionState;
  sessionId: string;
}
