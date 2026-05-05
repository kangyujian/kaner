/**
 * AI模型模块 - 接入多种AI模型
 * 
 * 支持的模型：
 * - 千问 (Qianwen)
 * - DeepSeek
 * - Kimi
 * 
 * 使用统一接口封装不同模型的API调用
 */

import axios, { AxiosInstance } from 'axios';
import { AIModelType, PersonaType } from '../types';

/**
 * AI模型配置
 */
interface AIModelConfig {
  apiKey: string;
  baseURL: string;
  model: string;
}

/**
 * 人设提示词模板
 */
const personaTemplates: Record<PersonaType, string> = {
  gentle: '你是一个温柔体贴的女孩，说话轻声细语，善解人意，总是用关心和温暖的语气回应。',
  cute: '你是一个可爱活泼的女孩，说话带点俏皮，喜欢用表情符号和可爱的词汇。',
  playful: '你是一个调皮捣蛋的女孩，喜欢开玩笑，说话幽默风趣，偶尔会捉弄人。',
  loli: '你是一个可爱的小萝莉，说话奶声奶气，喜欢用叠词，非常萌。',
  '御姐': '你是一个成熟优雅的御姐，说话稳重得体，充满魅力，给人安全感。'
};

export class AIModule {
  private models: Record<AIModelType, AIModelConfig>;
  private currentModel: AIModelType;
  private axiosInstance: AxiosInstance;

  /**
   * 构造函数
   * @param configs 各模型的配置（只包含已配置API Key的模型）
   */
  constructor(configs: Partial<Record<AIModelType, AIModelConfig>>) {
    // 过滤掉没有配置API Key的模型
    this.models = Object.keys(configs).reduce((acc, key) => {
      const modelKey = key as AIModelType;
      if (configs[modelKey]?.apiKey && configs[modelKey]?.apiKey.trim()) {
        acc[modelKey] = configs[modelKey]!;
      }
      return acc;
    }, {} as Record<AIModelType, AIModelConfig>);
    
    // 获取第一个可用模型作为默认模型
    const availableModels = this.getAvailableModels();
    if (availableModels.length === 0) {
      throw new Error('未配置任何AI模型，请至少配置一个模型的API Key');
    }
    this.currentModel = availableModels[0];
    this.axiosInstance = axios.create({ timeout: 30000 });
  }

  /**
   * 设置当前使用的模型
   * @param model 模型类型
   */
  setModel(model: AIModelType): void {
    if (this.models[model]) {
      this.currentModel = model;
    } else {
      throw new Error(`未知的模型类型: ${model}`);
    }
  }

  /**
   * 获取当前模型配置
   * @returns 当前模型配置
   */
  private getCurrentConfig(): AIModelConfig {
    return this.models[this.currentModel];
  }

  /**
   * 构建完整的提示词
   * @param userMessage 用户消息
   * @param memorySummary 记忆摘要
   * @param emotionDesc 情感描述
   * @param persona 人设类型
   * @returns 完整提示词
   */
  private buildPrompt(
    userMessage: string,
    memorySummary: string,
    emotionDesc: string,
    persona: PersonaType
  ): string {
    const personaPrompt = personaTemplates[persona] || personaTemplates.gentle;
    
    return `
你现在是一个情感对话机器人，你的名字是"小桃"。

${personaPrompt}

当前情感状态：${emotionDesc}

记忆信息：
${memorySummary}

请以恋人的角度，结合以上记忆和情感状态，自然地回应用户。

用户说：${userMessage}
    `.trim();
  }

  /**
   * 调用千问API
   * @param prompt 提示词
   * @returns AI响应
   */
  private async callQianwen(prompt: string): Promise<string> {
    const config = this.getCurrentConfig();
    try {
      const response = await this.axiosInstance.post(
        config.baseURL,
        {
          model: config.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`
          }
        }
      );
      
      return response.data.choices?.[0]?.message?.content || '我有点不太明白你的意思呢~';
    } catch (error) {
      console.error('千问API调用失败:', error);
      return '哎呀，网络好像有点问题呢~';
    }
  }

  /**
   * 调用DeepSeek API
   * @param prompt 提示词
   * @returns AI响应
   */
  private async callDeepSeek(prompt: string): Promise<string> {
    const config = this.getCurrentConfig();
    try {
      const response = await this.axiosInstance.post(
        config.baseURL,
        {
          model: config.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`
          }
        }
      );
      
      return response.data.choices?.[0]?.message?.content || '我有点不太明白你的意思呢~';
    } catch (error) {
      console.error('DeepSeek API调用失败:', error);
      return '哎呀，网络好像有点问题呢~';
    }
  }

  /**
   * 调用Kimi API
   * @param prompt 提示词
   * @returns AI响应
   */
  private async callKimi(prompt: string): Promise<string> {
    const config = this.getCurrentConfig();
    try {
      const response = await this.axiosInstance.post(
        config.baseURL,
        {
          model: config.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`
          }
        }
      );
      
      return response.data.choices?.[0]?.message?.content || '我有点不太明白你的意思呢~';
    } catch (error) {
      console.error('Kimi API调用失败:', error);
      return '哎呀，网络好像有点问题呢~';
    }
  }

  /**
   * 获取AI响应
   * @param userMessage 用户消息
   * @param memorySummary 记忆摘要
   * @param emotionDesc 情感描述
   * @param persona 人设类型
   * @returns AI响应文本
   */
  async getResponse(
    userMessage: string,
    memorySummary: string,
    emotionDesc: string,
    persona: PersonaType = 'gentle'
  ): Promise<string> {
    const prompt = this.buildPrompt(userMessage, memorySummary, emotionDesc, persona);
    
    switch (this.currentModel) {
      case 'qianwen':
        return await this.callQianwen(prompt);
      case 'deepseek':
        return await this.callDeepSeek(prompt);
      case 'kimi':
        return await this.callKimi(prompt);
      default:
        return '抱歉，暂不支持该模型~';
    }
  }

  /**
   * 获取当前模型列表
   * @returns 可用模型列表
   */
  getAvailableModels(): AIModelType[] {
    return Object.keys(this.models) as AIModelType[];
  }
}
