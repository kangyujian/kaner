import { useState, useEffect, useRef } from 'react';
import { Message, PersonaType, EmotionState } from '../types';
import { chatApi } from '../api/chat';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { PersonaSelector } from './PersonaSelector';

const emotionEmojis: Record<string, string> = {
  happy: '😊',
  sad: '😢',
  angry: '😠',
  surprised: '😮',
  neutral: '😌',
};

const emotionDescriptions: Record<string, string> = {
  happy: '开心',
  sad: '难过',
  angry: '生气',
  surprised: '惊讶',
  neutral: '平静',
};

export const ChatBox = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<PersonaType>('gentle');
  const [isLoading, setIsLoading] = useState(false);
  const [emotion, setEmotion] = useState<EmotionState>({
    type: 'neutral',
    intensity: 0,
    lastUpdate: Date.now(),
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 初始化会话
  useEffect(() => {
    const initSession = async () => {
      try {
        const result = await chatApi.createSession();
        setSessionId(result.sessionId);
      } catch (error) {
        console.error('初始化会话失败:', error);
      }
    };
    initSession();
  }, []);

  // 更新情感状态
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const result = await chatApi.getEmotion();
        setEmotion(result.emotion);
      } catch (error) {
        console.error('获取情感状态失败:', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // 发送消息
  const handleSend = async (message: string) => {
    if (!sessionId || isLoading) return;

    setIsLoading(true);

    // 添加用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: 'user',
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      // 发送消息到后端
      const response = await chatApi.sendMessage({
        message,
        sessionId,
        persona: selectedPersona,
      });

      // 添加机器人消息
      const botMessage: Message = {
        id: response.emotion.lastUpdate.toString(),
        content: response.message,
        sender: 'bot',
        timestamp: Date.now(),
        emotion: response.emotion.type,
      };
      setMessages((prev) => [...prev, botMessage]);

      // 更新情感状态
      setEmotion(response.emotion);
    } catch (error) {
      console.error('发送消息失败:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: '抱歉，网络出现问题，请稍后重试~',
        sender: 'bot',
        timestamp: Date.now(),
        emotion: 'sad',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // 切换人设
  const handlePersonaChange = async (persona: PersonaType) => {
    try {
      await chatApi.setPersona(persona);
      setSelectedPersona(persona);
    } catch (error) {
      console.error('设置人设失败:', error);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-pink-50 to-white">
      {/* 头部 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-2xl">💬</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">小桃</h1>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <span>{emotionEmojis[emotion.type]}</span>
                  <span>{emotionDescriptions[emotion.type]}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 人设选择 */}
      <div className="bg-white/80 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <p className="text-sm text-gray-500 mb-2">选择人设：</p>
          <PersonaSelector
            selectedPersona={selectedPersona}
            onSelect={handlePersonaChange}
          />
        </div>
      </div>

      {/* 消息列表 */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <span className="text-6xl mb-4">🌸</span>
              <p className="text-lg">嗨~ 我是小桃</p>
              <p className="text-sm mt-2">来和我聊聊天吧~</p>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* 输入框 */}
      <ChatInput onSend={handleSend} disabled={isLoading} />
    </div>
  );
};
