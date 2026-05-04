/**
 * 情感对话机器人服务器
 * 
 * 整合记忆模块、情感模块、AI模块和会话管理模块
 * 提供RESTful API接口
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { MemoryModule } from './memory/MemoryModule';
import { EmotionModule } from './emotion/EmotionModule';
import { AIModule } from './ai/AIModule';
import { SessionManager } from './session/SessionManager';
import { SearchTool } from './tools/SearchTool';
import { Message, ChatRequest, ChatResponse, PersonaType, AIModelType } from './types';

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3000;

// 中间件配置
app.use(cors());
app.use(express.json());

// 初始化模块
const storageDir = process.env.STORAGE_DIR || './data';
const memoryModule = new MemoryModule(storageDir);
const emotionModule = new EmotionModule();
const sessionManager = new SessionManager(storageDir);
const searchTool = new SearchTool();

// AI模块配置
const aiModule = new AIModule({
  qianwen: {
    apiKey: process.env.QIANWEN_API_KEY || '',
    baseURL: 'https://dashscope.aliyuncs.com/api/text/chat',
    model: 'qwen-turbo'
  },
  deepseek: {
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    baseURL: 'https://api.deepseek.com/v1/chat/completions',
    model: 'deepseek-chat'
  },
  kimi: {
    apiKey: process.env.KIMI_API_KEY || '',
    baseURL: 'https://api.moonshot.cn/v1/chat/completions',
    model: 'moonshot-v1-8k'
  }
});

/**
 * 健康检查接口
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

/**
 * 创建新会话
 */
app.post('/api/session', (req, res) => {
  const sessionId = sessionManager.createSession();
  res.json({ sessionId });
});

/**
 * 获取会话列表
 */
app.get('/api/sessions', (req, res) => {
  const sessions = sessionManager.getAllSessions();
  res.json(sessions);
});

/**
 * 获取会话消息
 */
app.get('/api/session/:sessionId/messages', (req, res) => {
  const { sessionId } = req.params;
  const messages = sessionManager.getMessages(sessionId);
  res.json(messages);
});

/**
 * 删除会话
 */
app.delete('/api/session/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const success = sessionManager.deleteSession(sessionId);
  res.json({ success });
});

/**
 * 聊天接口
 */
app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId: reqSessionId, persona }: ChatRequest = req.body;
    
    // 如果没有提供会话ID，创建新会话
    let sessionId = reqSessionId || sessionManager.createSession();
    
    // 创建用户消息
    const userMessage: Message = {
      id: uuidv4(),
      content: message,
      sender: 'user',
      timestamp: Date.now()
    };
    
    // 添加消息到会话
    sessionManager.addMessage(sessionId, userMessage);
    
    // 更新情感状态
    emotionModule.analyzeText(message);
    
    // 添加到短期记忆
    memoryModule.addShortTermMemory(userMessage);
    
    // 获取当前情感状态
    const emotion = emotionModule.getCurrentEmotion();
    const emotionDesc = emotionModule.getEmotionDescription();
    
    // 获取记忆摘要
    const memorySummary = memoryModule.getMemorySummary();
    
    // 获取AI响应
    const aiResponse = await aiModule.getResponse(
      message,
      memorySummary,
      emotionDesc,
      persona || 'gentle'
    );
    
    // 创建机器人消息
    const botMessage: Message = {
      id: uuidv4(),
      content: aiResponse,
      sender: 'bot',
      timestamp: Date.now(),
      emotion: emotion.type
    };
    
    // 添加机器人消息到会话
    sessionManager.addMessage(sessionId, botMessage);
    
    // 更新情感状态（基于机器人响应）
    emotionModule.analyzeText(aiResponse);
    
    // 添加机器人消息到短期记忆
    memoryModule.addShortTermMemory(botMessage);
    
    // 检查是否需要添加到长期记忆（重要信息）
    if (emotion.intensity >= 70 || message.length > 50) {
      memoryModule.addLongTermMemory(message, emotion.intensity);
    }
    
    // 构建响应
    const response: ChatResponse = {
      message: aiResponse,
      emotion: emotion,
      sessionId
    };
    
    res.json(response);
  } catch (error) {
    console.error('聊天接口错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

/**
 * 获取当前情感状态
 */
app.get('/api/emotion', (req, res) => {
  const emotion = emotionModule.getCurrentEmotion();
  const description = emotionModule.getEmotionDescription();
  res.json({ emotion, description });
});

/**
 * 设置人设
 */
app.post('/api/persona', (req, res) => {
  const { persona }: { persona: PersonaType } = req.body;
  const validPersonas: PersonaType[] = ['gentle', 'cute', 'playful', 'loli', '御姐'];
  
  if (!validPersonas.includes(persona)) {
    return res.status(400).json({ error: '无效的人设类型' });
  }
  
  // 在实际应用中，可以将人设存储到会话或用户配置中
  res.json({ success: true, persona });
});

/**
 * 设置AI模型
 */
app.post('/api/model', (req, res) => {
  const { model }: { model: AIModelType } = req.body;
  
  try {
    aiModule.setModel(model);
    res.json({ success: true, model });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

/**
 * 获取可用模型列表
 */
app.get('/api/models', (req, res) => {
  const models = aiModule.getAvailableModels();
  res.json(models);
});

/**
 * 搜索记忆
 */
app.get('/api/memory/search', (req, res) => {
  const { query } = req.query;
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: '缺少搜索关键词' });
  }
  
  const results = memoryModule.searchMemory(query);
  res.json(results);
});

/**
 * 获取记忆摘要
 */
app.get('/api/memory/summary', (req, res) => {
  const summary = memoryModule.getMemorySummary();
  res.json({ summary });
});

/**
 * 联网搜索接口
 */
app.get('/api/search', async (req, res) => {
  const { query } = req.query;
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: '缺少搜索关键词' });
  }

  try {
    const results = await searchTool.search(query);
    res.json(results);
  } catch (error) {
    console.error('搜索接口错误:', error);
    res.status(500).json({ error: '搜索失败' });
  }
});

/**
 * 搜索并格式化结果接口
 */
app.get('/api/search/format', async (req, res) => {
  const { query } = req.query;
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: '缺少搜索关键词' });
  }

  try {
    const formattedResult = await searchTool.searchAndFormat(query);
    res.json({ result: formattedResult });
  } catch (error) {
    console.error('搜索格式化接口错误:', error);
    res.status(500).json({ error: '搜索失败' });
  }
});

/**
 * 启动服务器
 */
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
