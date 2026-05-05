import { useState, useEffect } from 'react';
import { chatApi } from '../api/chat';

interface Session {
  id: string;
  createdAt: number;
  lastUpdated: number;
  messageCount: number;
}

interface SidebarProps {
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onCreateSession: () => void;
}

export const Sidebar = ({ currentSessionId, onSelectSession, onCreateSession }: SidebarProps) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const result = await chatApi.getSessions();
        setSessions(result);
      } catch (error) {
        console.error('获取会话列表失败:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadSessions();
  }, [currentSessionId]);

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await chatApi.deleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (error) {
      console.error('删除会话失败:', error);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;
    
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <div className="w-80 h-screen bg-white/90 backdrop-blur-lg border-r border-pink-100 flex flex-col">
      <div className="p-4 border-b border-pink-100">
        <button
          onClick={onCreateSession}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-xl font-medium hover:from-pink-500 hover:to-pink-600 transition-all duration-200 shadow-lg shadow-pink-200/50"
        >
          <span className="text-xl">✨</span>
          <span>新的对话</span>
          <span className="text-lg">💕</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <span className="text-2xl float-animation">💕</span>
            <p className="text-sm mt-2">加载中...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <span className="text-4xl mb-3 float-animation">🌸</span>
            <p className="text-gray-400 text-sm">还没有对话记录</p>
            <p className="text-gray-300 text-xs mt-1">点击上方按钮开始新对话</p>
          </div>
        ) : (
          <div className="space-y-1 px-2">
            {sessions.map((session, index) => (
              <div
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={`group relative flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all duration-200 ${
                  currentSessionId === session.id
                    ? 'bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200'
                    : 'hover:bg-gray-50'
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    currentSessionId === session.id
                      ? 'bg-gradient-to-br from-pink-400 to-purple-500 shadow-md'
                      : 'bg-gray-100'
                  }`}
                >
                  <span className="text-lg">
                    {currentSessionId === session.id ? '💖' : '💬'}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium truncate ${
                      currentSessionId === session.id
                        ? 'text-pink-700'
                        : 'text-gray-700'
                    }`}
                  >
                    对话 {sessions.length - index}
                  </p>
                  <p className="text-xs text-gray-400 flex items-center gap-2">
                    <span>{session.messageCount} 条消息</span>
                    <span>·</span>
                    <span>{formatTime(session.lastUpdated)}</span>
                  </p>
                </div>
                
                <button
                  onClick={(e) => handleDeleteSession(session.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all duration-200"
                  title="删除会话"
                >
                  <span>🗑️</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-pink-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
            <span className="text-lg">💖</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700">小桃</p>
            <p className="text-xs text-gray-400">恋爱助手</p>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-pink-400">💕</span>
            <span className="text-xs text-purple-400">🌸</span>
          </div>
        </div>
      </div>
    </div>
  );
};