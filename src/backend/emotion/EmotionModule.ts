/**
 * 情感状态机模块 - 管理情感状态转换
 * 
 * 支持的情感类型：happy(开心)、sad(悲伤)、angry(生气)、surprised(惊讶)、neutral(平静)
 * 情感强度：0-100
 * 
 * 情感转换规则：
 * - 积极词汇 → 增加开心情感
 * - 消极词汇 → 增加悲伤或生气情感
 * - 感叹词/疑问词 → 增加惊讶情感
 * - 时间衰减 → 情感强度随时间逐渐降低
 */

import { EmotionType, EmotionState } from '../types';

export class EmotionModule {
  private currentEmotion: EmotionState;
  private lastUpdateTime: number;
  private readonly decayRate: number = 0.1; // 每分钟衰减率

  /**
   * 积极词汇列表
   */
  private positiveWords: string[] = [
    '开心', '高兴', '快乐', '幸福', '喜欢', '爱', '好', '棒', '美',
    '赞', '优秀', '成功', '顺利', '满足', '温暖', '甜蜜', '可爱',
    'happy', 'joy', 'love', 'great', 'good', 'nice', 'wonderful', 'amazing'
  ];

  /**
   * 消极词汇列表
   */
  private negativeWords: string[] = [
    '难过', '伤心', '痛苦', '失望', '生气', '愤怒', '讨厌', '烦',
    '糟糕', '失败', '困难', '累', '孤独', '失落', '无奈', '哭',
    'sad', 'angry', 'hate', 'bad', 'terrible', 'awful', 'worried', 'upset'
  ];

  /**
   * 惊讶词汇列表
   */
  private surpriseWords: string[] = [
    '哇', '哦', '啊', '呀', '真的', '竟然', '没想到', '突然',
    '惊喜', '意外', '震惊', '吓', '哇塞', 'OMG', 'wow', 'surprise'
  ];

  /**
   * 构造函数
   */
  constructor() {
    this.currentEmotion = {
      type: 'neutral',
      intensity: 0,
      lastUpdate: Date.now()
    };
    this.lastUpdateTime = Date.now();
  }

  /**
   * 获取当前情感状态
   * @returns 当前情感状态
   */
  getCurrentEmotion(): EmotionState {
    this.applyDecay();
    return { ...this.currentEmotion };
  }

  /**
   * 更新情感状态
   * @param newEmotion 新的情感类型
   * @param intensity 情感强度 (0-100)
   */
  updateEmotion(newEmotion: EmotionType, intensity: number): void {
    this.applyDecay();
    
    const clampedIntensity = Math.min(100, Math.max(0, intensity));
    
    // 如果是同一种情感，叠加强度
    if (this.currentEmotion.type === newEmotion) {
      this.currentEmotion.intensity = Math.min(100, this.currentEmotion.intensity + clampedIntensity);
    } else {
      // 不同情感，取最大强度
      if (clampedIntensity > this.currentEmotion.intensity) {
        this.currentEmotion.type = newEmotion;
        this.currentEmotion.intensity = clampedIntensity;
      }
    }
    
    this.currentEmotion.lastUpdate = Date.now();
    this.lastUpdateTime = Date.now();
  }

  /**
   * 从文本分析情感
   * @param text 输入文本
   */
  analyzeText(text: string): void {
    const lowerText = text.toLowerCase();
    
    let positiveScore = 0;
    let negativeScore = 0;
    let surpriseScore = 0;

    // 统计各情感词汇出现次数
    this.positiveWords.forEach(word => {
      if (lowerText.includes(word.toLowerCase())) {
        positiveScore += 1;
      }
    });

    this.negativeWords.forEach(word => {
      if (lowerText.includes(word.toLowerCase())) {
        negativeScore += 1;
      }
    });

    this.surpriseWords.forEach(word => {
      if (lowerText.includes(word.toLowerCase())) {
        surpriseScore += 1;
      }
    });

    // 根据得分更新情感
    const maxScore = Math.max(positiveScore, negativeScore, surpriseScore);
    
    if (maxScore === 0) {
      // 没有明显情感词汇，趋向平静
      this.updateEmotion('neutral', 20);
    } else if (positiveScore === maxScore) {
      this.updateEmotion('happy', positiveScore * 20);
    } else if (negativeScore === maxScore) {
      // 根据上下文判断是悲伤还是生气
      const isAngry = lowerText.includes('生气') || lowerText.includes('愤怒') || 
                      lowerText.includes('讨厌') || lowerText.includes('烦');
      if (isAngry) {
        this.updateEmotion('angry', negativeScore * 20);
      } else {
        this.updateEmotion('sad', negativeScore * 20);
      }
    } else if (surpriseScore === maxScore) {
      this.updateEmotion('surprised', surpriseScore * 25);
    }
  }

  /**
   * 应用时间衰减
   */
  private applyDecay(): void {
    const now = Date.now();
    const minutesPassed = (now - this.lastUpdateTime) / (1000 * 60);
    
    if (minutesPassed > 0) {
      const decayAmount = minutesPassed * this.decayRate * 10;
      this.currentEmotion.intensity = Math.max(0, this.currentEmotion.intensity - decayAmount);
      
      // 如果强度很低，转为平静状态
      if (this.currentEmotion.intensity < 10) {
        this.currentEmotion.type = 'neutral';
        this.currentEmotion.intensity = 0;
      }
      
      this.lastUpdateTime = now;
      this.currentEmotion.lastUpdate = now;
    }
  }

  /**
   * 获取情感描述文本
   * @returns 情感描述
   */
  getEmotionDescription(): string {
    const emotion = this.getCurrentEmotion();
    const intensity = emotion.intensity;
    
    let description = '';
    
    switch (emotion.type) {
      case 'happy':
        if (intensity >= 80) description = '非常开心';
        else if (intensity >= 50) description = '开心';
        else if (intensity >= 20) description = '有点开心';
        break;
      case 'sad':
        if (intensity >= 80) description = '非常难过';
        else if (intensity >= 50) description = '难过';
        else if (intensity >= 20) description = '有点难过';
        break;
      case 'angry':
        if (intensity >= 80) description = '非常生气';
        else if (intensity >= 50) description = '生气';
        else if (intensity >= 20) description = '有点生气';
        break;
      case 'surprised':
        if (intensity >= 80) description = '非常惊讶';
        else if (intensity >= 50) description = '惊讶';
        else if (intensity >= 20) description = '有点惊讶';
        break;
      case 'neutral':
        description = '平静';
        break;
    }
    
    return description || '平静';
  }
}
