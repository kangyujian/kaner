/**
 * 会话管理模块 - 管理聊天会话的创建、保存和加载
 * 
 * 支持多用户会话，每个会话独立存储消息历史
 */

import { Session, Message } from '../types';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export class SessionManager {
  private sessions: Map<string, Session> = new Map();
  private storageDir: string;

  /**
   * 构造函数
   * @param storageDir 存储目录路径
   */
  constructor(storageDir: string) {
    this.storageDir = storageDir;
    this.loadSessions();
  }

  /**
   * 从文件加载会话
   */
  private loadSessions(): void {
    try {
      const sessionsDir = path.join(this.storageDir, 'sessions');
      if (fs.existsSync(sessionsDir)) {
        const files = fs.readdirSync(sessionsDir);
        files.forEach(file => {
          if (file.endsWith('.json')) {
            const sessionId = file.replace('.json', '');
            const filePath = path.join(sessionsDir, file);
            try {
              const data = fs.readFileSync(filePath, 'utf-8');
              const session: Session = JSON.parse(data);
              this.sessions.set(sessionId, session);
            } catch (error) {
              console.warn(`加载会话 ${sessionId} 失败:`, error);
            }
          }
        });
      }
    } catch (error) {
      console.warn('加载会话失败:', error);
    }
  }

  /**
   * 保存会话到文件
   * @param sessionId 会话ID
   */
  private saveSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    try {
      const sessionsDir = path.join(this.storageDir, 'sessions');
      if (!fs.existsSync(sessionsDir)) {
        fs.mkdirSync(sessionsDir, { recursive: true });
      }
      const filePath = path.join(sessionsDir, `${sessionId}.json`);
      fs.writeFileSync(filePath, JSON.stringify(session, null, 2));
    } catch (error) {
      console.warn(`保存会话 ${sessionId} 失败:`, error);
    }
  }

  /**
   * 创建新会话
   * @returns 新会话ID
   */
  createSession(): string {
    const sessionId = uuidv4();
    const now = Date.now();
    const session: Session = {
      id: sessionId,
      messages: [],
      createdAt: now,
      lastUpdated: now
    };
    this.sessions.set(sessionId, session);
    this.saveSession(sessionId);
    return sessionId;
  }

  /**
   * 获取会话
   * @param sessionId 会话ID
   * @returns 会话对象，如果不存在返回undefined
   */
  getSession(sessionId: string): Session | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * 添加消息到会话
   * @param sessionId 会话ID
   * @param message 消息对象
   */
  addMessage(sessionId: string, message: Message): void {
    let session = this.sessions.get(sessionId);
    
    if (!session) {
      // 如果会话不存在，创建新会话
      const now = Date.now();
      session = {
        id: sessionId,
        messages: [],
        createdAt: now,
        lastUpdated: now
      };
      this.sessions.set(sessionId, session);
    }

    session.messages.push(message);
    session.lastUpdated = Date.now();
    this.saveSession(sessionId);
  }

  /**
   * 获取会话消息列表
   * @param sessionId 会话ID
   * @returns 消息列表，如果会话不存在返回空数组
   */
  getMessages(sessionId: string): Message[] {
    const session = this.sessions.get(sessionId);
    return session?.messages || [];
  }

  /**
   * 删除会话
   * @param sessionId 会话ID
   * @returns 是否删除成功
   */
  deleteSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    try {
      const filePath = path.join(this.storageDir, 'sessions', `${sessionId}.json`);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      this.sessions.delete(sessionId);
      return true;
    } catch (error) {
      console.warn(`删除会话 ${sessionId} 失败:`, error);
      return false;
    }
  }

  /**
   * 获取所有会话列表（仅基本信息）
   * @returns 会话基本信息列表
   */
  getAllSessions(): { id: string; createdAt: number; lastUpdated: number; messageCount: number }[] {
    const result: { id: string; createdAt: number; lastUpdated: number; messageCount: number }[] = [];
    
    this.sessions.forEach(session => {
      result.push({
        id: session.id,
        createdAt: session.createdAt,
        lastUpdated: session.lastUpdated,
        messageCount: session.messages.length
      });
    });

    // 按更新时间排序
    return result.sort((a, b) => b.lastUpdated - a.lastUpdated);
  }

  /**
   * 检查会话是否存在
   * @param sessionId 会话ID
   * @returns 是否存在
   */
  sessionExists(sessionId: string): boolean {
    return this.sessions.has(sessionId);
  }
}
