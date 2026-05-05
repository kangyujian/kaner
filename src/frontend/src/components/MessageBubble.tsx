import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  index?: number;
}

const emotionColors: Record<string, { bg: string; border: string; glow: string }> = {
  happy: { bg: '#FFF0F5', border: '#FFB6C1', glow: 'shadow-pink-200' },
  sad: { bg: '#E6E6FA', border: '#9370DB', glow: 'shadow-purple-200' },
  angry: { bg: '#FFF5EE', border: '#FF6347', glow: 'shadow-red-200' },
  surprised: { bg: '#FFFACD', border: '#FFD700', glow: 'shadow-yellow-200' },
  neutral: { bg: '#F8F8FF', border: '#D3D3D3', glow: 'shadow-gray-200' },
};

const emotionEmojis: Record<string, string> = {
  happy: '😊',
  sad: '😢',
  angry: '😠',
  surprised: '😮',
  neutral: '😌',
};

export const MessageBubble = ({ message, index = 0 }: MessageBubbleProps) => {
  const isUser = message.sender === 'user';
  const emotionData = message.emotion ? emotionColors[message.emotion] : null;
  const emotionEmoji = message.emotion ? emotionEmojis[message.emotion] : '';

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-5 fade-in-up`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isUser && (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center shadow-lg flex-shrink-0">
            <span className="text-lg">💖</span>
          </div>
        )}
        
        <div
          className={`max-w-[70%] relative ${isUser ? 'flex items-end justify-end' : 'flex items-end justify-start'}`}
        >
          <div
            className={`relative px-5 py-4 rounded-3xl shadow-lg ${
              isUser
                ? 'bg-gradient-to-br from-pink-400 via-pink-500 to-purple-500 text-white rounded-br-sm'
                : 'bg-white text-gray-800 rounded-bl-sm border-2'
            }`}
            style={{
              ...(!isUser && emotionData ? { 
                borderColor: emotionData.border,
                boxShadow: `0 4px 20px rgba(${parseInt(emotionData.border.slice(1), 16) >> 16}, ${(parseInt(emotionData.border.slice(3), 16) >> 8) & 255}, ${parseInt(emotionData.border.slice(5), 16)}, 0.15)`
              } : {}),
              ...(!isUser && !emotionData ? { borderColor: '#FFB6C1' } : {})
            }}
          >
            {!isUser && emotionData && (
              <div
                className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-8 rounded-full"
                style={{ backgroundColor: emotionData.border }}
              />
            )}
            
            <div className="flex items-start gap-2">
              <p className="text-base leading-relaxed whitespace-pre-wrap flex-1">
                {message.content}
              </p>
              {!isUser && emotionEmoji && (
                <span className="text-xl mt-0.5 pulse-heart">{emotionEmoji}</span>
              )}
            </div>
            
            <div
              className={`text-xs mt-2 flex items-center gap-1 ${
                isUser ? 'text-pink-200 justify-end' : 'text-gray-400 justify-start'
              }`}
            >
              {new Date(message.timestamp).toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit',
              })}
              {isUser && <span className="text-pink-300">✓✓</span>}
            </div>
          </div>
          
          {isUser && (
            <div className="absolute -right-12 bottom-2 w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-md">
              <span className="text-xs text-white">You</span>
            </div>
          )}
        </div>
        
        {isUser && (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg flex-shrink-0">
            <span className="text-sm text-white">👤</span>
          </div>
        )}
      </div>
    </div>
  );
};