import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
}

const emotionColors: Record<string, string> = {
  happy: '#FFE4E1',
  sad: '#E0E0FF',
  angry: '#FFE4E1',
  surprised: '#FFF8DC',
  neutral: '#F5F5F5',
};

const emotionEmojis: Record<string, string> = {
  happy: '😊',
  sad: '😢',
  angry: '😠',
  surprised: '😮',
  neutral: '😌',
};

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.sender === 'user';
  const emotionColor = message.emotion ? emotionColors[message.emotion] : undefined;
  const emotionEmoji = message.emotion ? emotionEmojis[message.emotion] : '';

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div
        className={`max-w-[70%] px-4 py-3 rounded-2xl ${
          isUser
            ? 'bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-br-md'
            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md shadow-sm'
        }`}
        style={!isUser && emotionColor ? { borderLeft: `4px solid ${emotionColor}` } : {}}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        {!isUser && emotionEmoji && (
          <span className="ml-2 text-lg">{emotionEmoji}</span>
        )}
        <div
          className={`text-xs mt-1 ${
            isUser ? 'text-pink-200 text-right' : 'text-gray-400 text-left'
          }`}
        >
          {new Date(message.timestamp).toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </div>
  );
};
