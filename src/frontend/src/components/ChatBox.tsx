import { useState, useEffect, useRef, useCallback } from 'react';
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

interface Decoration {
  id: number;
  type: 'heart' | 'flower' | 'star' | 'sparkle';
  left: number;
  top: number;
  size: number;
  delay: number;
  duration: number;
}

interface ChatBoxProps {
  sessionId: string | null;
  isNew: boolean;
  onSessionCreated: (sessionId: string) => void;
}

export const ChatBox = ({ sessionId, isNew, onSessionCreated }: ChatBoxProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(sessionId);
  const [selectedPersona, setSelectedPersona] = useState<PersonaType>('gentle');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [emotion, setEmotion] = useState<EmotionState>({
    type: 'neutral',
    intensity: 0,
    lastUpdate: Date.now(),
  });
  const [decorations, setDecorations] = useState<Decoration[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const generateDecorations = () => {
      const newDecorations: Decoration[] = [];
      const types: ('heart' | 'flower' | 'star' | 'sparkle')[] = ['heart', 'flower', 'star', 'sparkle'];
      
      for (let i = 0; i < 20; i++) {
        newDecorations.push({
          id: i,
          type: types[Math.floor(Math.random() * types.length)],
          left: Math.random() * 100,
          top: Math.random() * 100,
          size: 12 + Math.random() * 16,
          delay: Math.random() * 6,
          duration: 4 + Math.random() * 5,
        });
      }
      setDecorations(newDecorations);
    };
    generateDecorations();
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (!isNew && sessionId) {
      const loadMessages = async () => {
        setIsLoadingMessages(true);
        try {
          const result = await chatApi.getMessages(sessionId);
          setMessages(result);
          setCurrentSessionId(sessionId);
        } catch (error) {
          console.error('加载消息失败:', error);
        } finally {
          setIsLoadingMessages(false);
        }
      };
      loadMessages();
    } else {
      setMessages([]);
    }
  }, [sessionId, isNew]);

  useEffect(() => {
    const initSession = async () => {
      if (isNew && !currentSessionId) {
        try {
          const result = await chatApi.createSession();
          setCurrentSessionId(result.sessionId);
          onSessionCreated(result.sessionId);
        } catch (error) {
          console.error('初始化会话失败:', error);
        }
      }
    };
    initSession();
  }, [isNew, currentSessionId, onSessionCreated]);

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

  const handleSend = async (message: string) => {
    if (!currentSessionId || isLoading) return;

    setIsLoading(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: 'user',
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await chatApi.sendMessage({
        message,
        sessionId: currentSessionId,
        persona: selectedPersona,
      });

      const botMessage: Message = {
        id: response.emotion.lastUpdate.toString(),
        content: response.message,
        sender: 'bot',
        timestamp: Date.now(),
        emotion: response.emotion.type,
      };
      setMessages((prev) => [...prev, botMessage]);

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

  const handlePersonaChange = async (persona: PersonaType) => {
    try {
      await chatApi.setPersona(persona);
      setSelectedPersona(persona);
    } catch (error) {
      console.error('设置人设失败:', error);
    }
  };

  const renderDecoration = (decoration: Decoration) => {
    const emoji = {
      heart: '💕',
      flower: '🌸',
      star: '⭐',
      sparkle: '✨',
    }[decoration.type];

    return (
      <span
        key={decoration.id}
        className="absolute pointer-events-none"
        style={{
          left: `${decoration.left}%`,
          top: `${decoration.top}%`,
          fontSize: `${decoration.size}px`,
          opacity: decoration.type === 'sparkle' ? 0.4 : 0.25,
          animation: decoration.type === 'sparkle' 
            ? `sparkle ${decoration.duration}s ease-in-out infinite`
            : `float ${decoration.duration}s ease-in-out infinite`,
          animationDelay: `${decoration.delay}s`,
        }}
      >
        {emoji}
      </span>
    );
  };

  return (
    <div className="h-full flex flex-col relative overflow-hidden">
      {decorations.map(renderDecoration)}
      
      {!sessionId ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
          <div className="relative mb-8">
            <span className="text-9xl float-animation">💕</span>
            <span className="absolute -top-4 -right-4 text-4xl sparkle-animation">✨</span>
            <span className="absolute -bottom-2 -left-6 text-3xl float-animation" style={{ animationDelay: '0.5s' }}>🌸</span>
            <span className="absolute top-8 -right-8 text-2xl float-animation" style={{ animationDelay: '1s' }}>💖</span>
            <span className="absolute -bottom-4 right-4 text-2xl sparkle-animation" style={{ animationDelay: '1.5s' }}>⭐</span>
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-4">
            欢迎来到小桃的世界 💕
          </h1>
          <p className="text-gray-500 text-lg mb-2">
            我是你的专属恋爱助手
          </p>
          <p className="text-gray-400 mb-8">
            点击左侧"新的对话"开始我们的故事吧~
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/60 rounded-full shadow-sm">
              <span>🌸</span>
              <span className="text-sm text-gray-600">温柔陪伴</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/60 rounded-full shadow-sm">
              <span>💝</span>
              <span className="text-sm text-gray-600">心灵沟通</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/60 rounded-full shadow-sm">
              <span>✨</span>
              <span className="text-sm text-gray-600">浪漫互动</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <span className="text-xl animate-bounce">💕</span>
            <span className="text-xl animate-bounce" style={{ animationDelay: '0.2s' }}>🌸</span>
            <span className="text-xl animate-bounce" style={{ animationDelay: '0.4s' }}>💖</span>
            <span className="text-xl animate-bounce" style={{ animationDelay: '0.6s' }}>✨</span>
          </div>
        </div>
      ) : (
        <>
          <header className="relative z-10 glass-effect border-b border-pink-100">
            <div className="max-w-4xl mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-pink-400 via-pink-500 to-purple-500 rounded-full flex items-center justify-center shadow-xl shadow-pink-300/50 float-animation">
                      <span className="text-2xl">💖</span>
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-pink-400 to-pink-600 rounded-full flex items-center justify-center">
                      <span className="text-xs">💕</span>
                    </div>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold gradient-text">小桃</h1>
                    <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                      <span className="text-lg pulse-heart">{emotionEmojis[emotion.type]}</span>
                      <span>{emotionDescriptions[emotion.type]}</span>
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl flower-decoration float-animation">🌸</span>
                  <span className="text-lg sparkle-animation">✨</span>
                  <span className="text-xl heart-decoration float-animation" style={{ animationDelay: '1s' }}>💖</span>
                </div>
              </div>
            </div>
          </header>

          <div className="relative z-10 glass-effect border-b border-pink-100/50">
            <div className="max-w-4xl mx-auto px-4 py-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <span>💝</span>
                  <span>选择人设：</span>
                </p>
                <span className="text-xs text-pink-400">当前状态：{emotionDescriptions[emotion.type]}</span>
              </div>
              <PersonaSelector
                selectedPersona={selectedPersona}
                onSelect={handlePersonaChange}
              />
            </div>
          </div>

          <main className="flex-1 overflow-y-auto relative z-10">
            <div className="max-w-4xl mx-auto px-4 py-6">
              {isLoadingMessages ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                  <span className="text-4xl float-animation">💕</span>
                  <p className="text-gray-400 mt-4">加载中...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                  <div className="relative mb-6">
                    <span className="text-8xl float-animation">💕</span>
                    <span className="absolute -top-2 -right-2 text-3xl sparkle-animation">✨</span>
                    <span className="absolute -bottom-1 -left-3 text-2xl float-animation" style={{ animationDelay: '1s' }}>🌸</span>
                  </div>
                  <h2 className="text-2xl font-bold gradient-text mb-3">嗨~ 我是小桃</h2>
                  <p className="text-gray-500 mb-2">今天心情不错呢~</p>
                  <p className="text-gray-400 text-sm">来和我聊聊天吧~ 我会一直陪着你 ❤️</p>
                  <div className="flex gap-2 mt-6">
                    <span className="text-lg">🌸</span>
                    <span className="text-sm">🌺</span>
                    <span className="text-lg">🌷</span>
                  </div>
                </div>
              ) : (
                messages.map((message, index) => (
                  <MessageBubble key={message.id} message={message} index={index} />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </main>

          <ChatInput onSend={handleSend} disabled={isLoading} />
        </>
      )}
    </div>
  );
};