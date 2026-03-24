/**
 * AI运行时客户端 - 借鉴waoowaoo项目的AI执行和任务管理
 * 提供统一的AI步骤执行、错误处理、使用量统计和流式处理
 */

import { AiService } from './types';

export interface AIExecutionOptions {
  /** AI服务类型 */
  service: 'claude' | 'gemini' | 'seedance' | 'kling';
  /** 模型名称 */
  model?: string;
  /** 温度参数 (0-1) */
  temperature?: number;
  /** 最大token数 */
  maxTokens?: number;
  /** 是否为流式响应 */
  stream?: boolean;
  /** 用户ID用于计费 */
  userId?: string;
  /** 项目ID用于跟踪 */
  projectId?: string;
  /** 任务ID用于状态跟踪 */
  taskId?: string;
  /** 请求超时时间 (毫秒) */
  timeout?: number;
  /** 是否启用推理模式 */
  reasoning?: boolean;
  /** 推理努力程度 */
  reasoningEffort?: 'low' | 'medium' | 'high';
  /** 重试次数 */
  retryCount?: number;
}

export interface AIExecutionResult {
  /** 返回的文本内容 */
  text: string;
  /** 推理过程文本 */
  reasoning?: string;
  /** token使用统计 */
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    estimatedCost: number;
  };
  /** 元数据 */
  metadata: {
    model: string;
    service: string;
    latency: number;
    success: boolean;
    retryCount: number;
  };
  /** 原始响应数据 */
  rawResponse?: any;
}

export interface AIVisionInput {
  /** 图片URL列表 */
  imageUrls: string[];
  /** 图片描述提示词 */
  prompt: string;
  /** 是否提取图片特征 */
  extractFeatures?: boolean;
  /** 特征提取类型 */
  featureTypes?: ('character' | 'scene' | 'style' | 'object')[];
}

export interface AIVisionResult extends AIExecutionResult {
  /** 提取的图片特征 */
  features?: {
    characters?: Array<{
      description: string;
      seed?: string;
      consistencyScore?: number;
    }>;
    scenes?: Array<{
      description: string;
      style: string;
      lighting: string;
    }>;
    style?: {
      artisticStyle: string;
      colorPalette: string[];
      mood: string;
    };
  };
}

export class AIRuntimeClient {
  private aiService: AiService;
  private defaultOptions: AIExecutionOptions;

  constructor(aiService: AiService) {
    this.aiService = aiService;
    this.defaultOptions = {
      service: 'claude',
      temperature: 0.7,
      maxTokens: 4000,
      stream: false,
      timeout: 30000,
      retryCount: 3,
    };
  }

  /**
   * 执行文本AI步骤
   */
  async executeTextStep(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    options: Partial<AIExecutionOptions> = {}
  ): Promise<AIExecutionResult> {
    const finalOptions = { ...this.defaultOptions, ...options };
    const startTime = Date.now();

    try {
      let result: AIExecutionResult | undefined;
      let retryCount = 0;
      let lastError: Error | undefined;

      while (retryCount <= finalOptions.retryCount!) {
        try {
          const response = await this.aiService.execute({
            messages,
            model: finalOptions.model || this.getDefaultModel(finalOptions.service),
            temperature: finalOptions.temperature,
            maxTokens: finalOptions.maxTokens,
            stream: finalOptions.stream,
          });

          const endTime = Date.now();
          const latency = endTime - startTime;

          // 解析token使用量
          const usage = this.parseUsage(response, finalOptions.service);
          
          // 解析推理文本（如果有）
          const { text, reasoning } = this.extractTextAndReasoning(response);

          result = {
            text,
            reasoning,
            usage: {
              ...usage,
              estimatedCost: this.calculateCost(usage, finalOptions.service),
            },
            metadata: {
              model: finalOptions.model || this.getDefaultModel(finalOptions.service),
              service: finalOptions.service,
              latency,
              success: true,
              retryCount,
            },
            rawResponse: response,
          };

          break; // 成功执行，退出重试循环
        } catch (error) {
          lastError = error as Error;
          retryCount++;
          
          if (retryCount <= finalOptions.retryCount!) {
            // 指数退避重试
            const delay = Math.pow(2, retryCount) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }
      }

      if (!result) {
        throw lastError || new Error('AI execution failed after all retries');
      }

      return result;
    } catch (error) {
      throw this.toAIRuntimeError(error as Error, finalOptions);
    }
  }

  /**
   * 执行视觉AI步骤
   */
  async executeVisionStep(
    visionInput: AIVisionInput,
    options: Partial<AIExecutionOptions> = {}
  ): Promise<AIVisionResult> {
    const finalOptions = { ...this.defaultOptions, ...options };
    const startTime = Date.now();

    try {
      // 这里需要调用支持视觉的AI服务
      // 暂时使用文本服务作为占位
      const messages = [
        {
          role: 'user' as const,
          content: `分析以下图片: ${visionInput.prompt}\n图片URLs: ${visionInput.imageUrls.join(', ')}`,
        },
      ];

      const textResult = await this.executeTextStep(messages, finalOptions);
      
      // 解析图片特征
      const features = this.extractImageFeatures(textResult.text, visionInput);

      return {
        ...textResult,
        features,
      };
    } catch (error) {
      throw this.toAIRuntimeError(error as Error, finalOptions);
    }
  }

  /**
   * 执行批量AI任务
   */
  async executeBatch(
    tasks: Array<{
      id: string;
      messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
      options?: Partial<AIExecutionOptions>;
    }>,
    concurrency = 3
  ): Promise<Map<string, AIExecutionResult>> {
    const results = new Map<string, AIExecutionResult>();
    const queue = [...tasks];
    
    // 创建并发执行器
    const workers = Array(concurrency).fill(null).map(async (_, workerId) => {
      while (queue.length > 0) {
        const task = queue.shift();
        if (!task) continue;

        try {
          console.log(`Worker ${workerId} processing task ${task.id}`);
          const result = await this.executeTextStep(task.messages, task.options);
          results.set(task.id, result);
        } catch (error) {
          console.error(`Worker ${workerId} failed on task ${task.id}:`, error);
          // 记录失败的任务
          results.set(task.id, {
            text: '',
            usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0, estimatedCost: 0 },
            metadata: {
              model: task.options?.model || 'unknown',
              service: task.options?.service || 'claude',
              latency: 0,
              success: false,
              retryCount: 0,
            },
          });
        }
      }
    });

    await Promise.all(workers);
    return results;
  }

  /**
   * 获取流式响应
   */
  async *executeStreamStep(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    options: Partial<AIExecutionOptions> = {}
  ): AsyncGenerator<string, void, unknown> {
    const finalOptions = { ...this.defaultOptions, ...options, stream: true };

    try {
      // 这里需要实现真正的流式处理
      // 暂时模拟流式响应
      const response = await this.executeTextStep(messages, finalOptions);
      
      // 将文本分割成小块模拟流式响应
      const chunks = response.text.match(/.{1,50}/g) || [];
      
      for (const chunk of chunks) {
        yield chunk;
        await new Promise(resolve => setTimeout(resolve, 50)); // 模拟延迟
      }
    } catch (error) {
      throw this.toAIRuntimeError(error as Error, finalOptions);
    }
  }

  /**
   * 私有辅助方法
   */
  private getDefaultModel(service: string): string {
    const modelMap: Record<string, string> = {
      claude: 'claude-3-5-sonnet-latest',
      gemini: 'gemini-2.0-flash-exp',
      seedance: 'sd3-large',
      kling: 'kling-v1',
    };
    return modelMap[service] || 'claude-3-5-sonnet-latest';
  }

  private parseUsage(response: any, service: string) {
    // 根据不同的AI服务解析token使用量
    let promptTokens = 0;
    let completionTokens = 0;
    
    if (service === 'claude') {
      promptTokens = response.usage?.input_tokens || 0;
      completionTokens = response.usage?.output_tokens || 0;
    } else if (service === 'gemini') {
      promptTokens = response.usageMetadata?.promptTokenCount || 0;
      completionTokens = response.usageMetadata?.candidatesTokenCount || 0;
    } else {
      // 默认估算
      promptTokens = Math.floor(response.text?.length / 4) || 0;
      completionTokens = Math.floor(response.text?.length / 4) || 0;
    }

    const totalTokens = promptTokens + completionTokens;

    return { promptTokens, completionTokens, totalTokens };
  }

  private extractTextAndReasoning(response: any): { text: string; reasoning: string } {
    let text = '';
    let reasoning = '';

    if (typeof response === 'string') {
      text = response;
    } else if (response?.choices?.[0]?.message?.content) {
      text = response.choices[0].message.content;
    } else if (response?.text) {
      text = response.text;
    } else if (response?.candidates?.[0]?.content?.parts?.[0]?.text) {
      text = response.candidates[0].content.parts[0].text;
    }

    // 尝试提取推理文本（Claude等模型支持）
    if (response?.reasoning_content) {
      reasoning = response.reasoning_content;
    }

    return { text, reasoning };
  }

  private calculateCost(usage: { promptTokens: number; completionTokens: number }, service: string): number {
    // 成本估算（美元）
    const costMap: Record<string, { input: number; output: number }> = {
      claude: { input: 0.000003, output: 0.000015 }, // $3/M input, $15/M output
      gemini: { input: 0.000000125, output: 0.000000375 }, // $0.125/M input, $0.375/M output
      seedance: { input: 0.0005, output: 0.0005 }, // 图片生成成本估算
      kling: { input: 0.001, output: 0.001 }, // 视频生成成本估算
    };

    const rates = costMap[service] || costMap.claude;
    const inputCost = (usage.promptTokens / 1_000_000) * rates.input;
    const outputCost = (usage.completionTokens / 1_000_000) * rates.output;

    return inputCost + outputCost;
  }

  private extractImageFeatures(text: string, visionInput: AIVisionInput) {
    // 从文本中提取图片特征
    // 这里可以集成专门的图片分析服务
    return {
      characters: [
        {
          description: text.includes('人物') ? '检测到人物形象' : '未检测到人物',
          seed: 'generic-character',
          consistencyScore: 0.7,
        },
      ],
      scenes: [
        {
          description: text.includes('场景') ? '检测到场景描述' : '通用场景',
          style: 'realistic',
          lighting: 'neutral',
        },
      ],
      style: {
        artisticStyle: 'photorealistic',
        colorPalette: ['#3B82F6', '#10B981', '#F59E0B'],
        mood: 'neutral',
      },
    };
  }

  private toAIRuntimeError(error: Error, options: AIExecutionOptions): Error {
    const enhancedError = new Error(`AI Runtime Error [${options.service}]: ${error.message}`);
    (enhancedError as any).originalError = error;
    (enhancedError as any).options = options;
    (enhancedError as any).timestamp = new Date().toISOString();
    
    return enhancedError;
  }

  /**
   * 性能监控方法
   */
  getPerformanceMetrics() {
    // 这里可以集成性能监控系统
    return {
      totalRequests: 0,
      successRate: 1.0,
      averageLatency: 0,
      totalCost: 0,
      serviceBreakdown: {},
    };
  }

  /**
   * 成本估算方法
   */
  estimateCost(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    options: Partial<AIExecutionOptions> = {}
  ): { estimatedTokens: number; estimatedCost: number; currency: string } {
    const contentLength = messages.reduce((sum, msg) => sum + msg.content.length, 0);
    const estimatedTokens = Math.ceil(contentLength / 4) * 2; // 粗略估算
    
    const finalOptions = { ...this.defaultOptions, ...options };
    const estimatedCost = this.calculateCost(
      { promptTokens: estimatedTokens, completionTokens: estimatedTokens },
      finalOptions.service
    );

    return {
      estimatedTokens,
      estimatedCost,
      currency: 'USD',
    };
  }
}