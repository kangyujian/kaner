/**
 * 记忆模块 - 管理短期记忆和长期记忆
 * 
 * 短期记忆：当前会话中的最近消息，用于上下文理解
 * 长期记忆：从会话中提取的重要信息，用于长期记忆
 */

import { MemoryItem, Message } from '../types';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export class MemoryModule {
  private shortTermMemory: MemoryItem[] = [];
  private longTermMemory: MemoryItem[] = [];
  private storageDir: string;

  /**
   * 构造函数
   * @param storageDir 存储目录路径
   */
  constructor(storageDir: string) {
    this.storageDir = storageDir;
    this.loadFromStorage();
  }

  /**
   * 从文件加载记忆数据
   */
  private loadFromStorage(): void {
    try {
      const longTermPath = path.join(this.storageDir, 'long-term-memory.json');
      if (fs.existsSync(longTermPath)) {
        const data = fs.readFileSync(longTermPath, 'utf-8');
        this.longTermMemory = JSON.parse(data);
      }
    } catch (error) {
      console.warn('加载长期记忆失败:', error);
    }
  }

  /**
   * 保存长期记忆到文件
   */
  private saveToStorage(): void {
    try {
      if (!fs.existsSync(this.storageDir)) {
        fs.mkdirSync(this.storageDir, { recursive: true });
      }
      const longTermPath = path.join(this.storageDir, 'long-term-memory.json');
      fs.writeFileSync(longTermPath, JSON.stringify(this.longTermMemory, null, 2));
    } catch (error) {
      console.warn('保存长期记忆失败:', error);
    }
  }

  /**
   * 添加短期记忆
   * @param message 消息内容
   */
  addShortTermMemory(message: Message): void {
    const memoryItem: MemoryItem = {
      id: uuidv4(),
      content: message.content,
      timestamp: message.timestamp,
      importance: 50,
      category: 'short-term',
      keywords: this.extractKeywords(message.content)
    };

    this.shortTermMemory.push(memoryItem);
    
    // 限制短期记忆数量，保持最近的100条
    if (this.shortTermMemory.length > 100) {
      this.shortTermMemory.shift();
    }
  }

  /**
   * 添加长期记忆
   * @param content 记忆内容
   * @param importance 重要性评分 (0-100)
   */
  addLongTermMemory(content: string, importance: number = 70): void {
    const memoryItem: MemoryItem = {
      id: uuidv4(),
      content,
      timestamp: Date.now(),
      importance: Math.min(100, Math.max(0, importance)),
      category: 'long-term',
      keywords: this.extractKeywords(content)
    };

    this.longTermMemory.push(memoryItem);
    this.saveToStorage();
  }

  /**
   * 提取关键词
   * @param text 文本内容
   * @returns 关键词数组
   */
  private extractKeywords(text: string): string[] {
    // 简单的关键词提取逻辑，可以扩展使用NLP库
    const words = text.split(/[\s,.!?。，！？、]+/).filter(word => word.length >= 2);
    return [...new Set(words)].slice(0, 10); // 去重并取前10个
  }

  /**
   * 获取短期记忆
   * @param limit 返回数量限制
   * @returns 短期记忆数组
   */
  getShortTermMemory(limit: number = 20): MemoryItem[] {
    return [...this.shortTermMemory].reverse().slice(0, limit);
  }

  /**
   * 获取长期记忆
   * @param limit 返回数量限制
   * @returns 长期记忆数组（按重要性排序）
   */
  getLongTermMemory(limit: number = 50): MemoryItem[] {
    return [...this.longTermMemory]
      .sort((a, b) => b.importance - a.importance)
      .slice(0, limit);
  }

  /**
   * 搜索记忆
   * @param query 搜索关键词
   * @returns 匹配的记忆数组
   */
  searchMemory(query: string): MemoryItem[] {
    const lowerQuery = query.toLowerCase();
    return [...this.shortTermMemory, ...this.longTermMemory]
      .filter(item => 
        item.content.toLowerCase().includes(lowerQuery) ||
        item.keywords.some(keyword => keyword.toLowerCase().includes(lowerQuery))
      )
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * 获取所有记忆的摘要（用于AI上下文）
   * @returns 记忆摘要字符串
   */
  getMemorySummary(): string {
    const longTerm = this.getLongTermMemory(10);
    const shortTerm = this.getShortTermMemory(10);
    
    let summary = '长期记忆：\n';
    longTerm.forEach(item => {
      summary += `- ${item.content}\n`;
    });
    
    summary += '\n近期对话：\n';
    shortTerm.forEach(item => {
      summary += `- ${item.content}\n`;
    });
    
    return summary;
  }

  /**
   * 清空短期记忆（新会话开始时调用）
   */
  clearShortTermMemory(): void {
    this.shortTermMemory = [];
  }
}
