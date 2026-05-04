import axios from 'axios';
import { Message, ChatRequest, ChatResponse, EmotionState, PersonaType } from '../types';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export const chatApi = {
  /**
   * 创建新会话
   */
  createSession: async (): Promise<{ sessionId: string }> => {
    const response = await api.post('/session');
    return response.data;
  },

  /**
   * 获取会话列表
   */
  getSessions: async (): Promise<Array<{
    id: string;
    createdAt: number;
    lastUpdated: number;
    messageCount: number;
  }>> => {
    const response = await api.get('/sessions');
    return response.data;
  },

  /**
   * 获取会话消息
   */
  getMessages: async (sessionId: string): Promise<Message[]> => {
    const response = await api.get(`/session/${sessionId}/messages`);
    return response.data;
  },

  /**
   * 删除会话
   */
  deleteSession: async (sessionId: string): Promise<{ success: boolean }> => {
    const response = await api.delete(`/session/${sessionId}`);
    return response.data;
  },

  /**
   * 发送消息
   */
  sendMessage: async (request: ChatRequest): Promise<ChatResponse> => {
    const response = await api.post('/chat', request);
    return response.data;
  },

  /**
   * 获取当前情感状态
   */
  getEmotion: async (): Promise<{ emotion: EmotionState; description: string }> => {
    const response = await api.get('/emotion');
    return response.data;
  },

  /**
   * 设置人设
   */
  setPersona: async (persona: PersonaType): Promise<{ success: boolean; persona: PersonaType }> => {
    const response = await api.post('/persona', { persona });
    return response.data;
  },

  /**
   * 获取可用模型列表
   */
  getModels: async (): Promise<string[]> => {
    const response = await api.get('/models');
    return response.data;
  },

  /**
   * 设置AI模型
   */
  setModel: async (model: string): Promise<{ success: boolean; model: string }> => {
    const response = await api.post('/model', { model });
    return response.data;
  },
};
