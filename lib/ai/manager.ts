import { 
  AiService, 
  AiProvider, 
  GenerateRequest, 
  GenerateResponse, 
  ScriptAnalysisResult, 
  ImageGenerationParams, 
  VideoGenerationParams, 
  VoiceSynthesisParams, 
  CostEstimate, 
  AiModel, 
  AiCapability,
  AiApiConfig,
  GeminiConfig,
  ClaudeConfig,
  SeedanceConfig,
  KlingConfig
} from "./types"
import { createGeminiService, GeminiService } from "./gemini"
import { createClaudeService, ClaudeService } from "./claude"

// 模拟的Seedance服务（实际项目中需要实现）
class SeedanceService implements AiService {
  public provider: AiProvider = "seedance"

  async execute(request: {
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
    model: string;
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
  }): Promise<any> {
    return {
      text: `Seedance执行的回复: ${request.messages[request.messages.length - 1]?.content?.substring(0, 100)}...`,
      usage: { input_tokens: 50, output_tokens: 50 }
    }
  }

  async generateText(request: GenerateRequest): Promise<GenerateResponse> {
    // 模拟实现
    return {
      success: true,
      data: `Seedance生成的文本: ${request.prompt.substring(0, 100)}...`,
      usage: { tokens: 100, cost: 0.001, duration: 1000 },
      metadata: { model: request.model, provider: this.provider, timestamp: new Date().toISOString() },
    }
  }
  
  async analyzeScript(script: string): Promise<ScriptAnalysisResult> {
    // 模拟实现
    return {
      summary: "Seedance剧本分析结果",
      characters: [],
      scenes: [],
      emotions: [],
      themes: [],
      estimatedDuration: 60,
      complexity: "medium",
    }
  }
  
  async generateImage(params: ImageGenerationParams): Promise<any> {
    return {
      success: true,
      data: {
        id: `seedance_img_${Date.now()}`,
        url: "https://placehold.co/1024x576/10b981/ffffff?text=Seedance+Image",
        metadata: { prompt: params.prompt, model: "seedance-v2", generationTime: 1500, cost: 0.02 },
      },
    }
  }
  
  async generateVideo(params: VideoGenerationParams): Promise<GenerateResponse> {
    return {
      success: true,
      data: { videoUrl: "https://example.com/seedance-video.mp4" },
      usage: { tokens: 0, cost: 0.1, duration: 5000 },
      metadata: { model: "seedance-video", provider: this.provider, timestamp: new Date().toISOString() },
    }
  }
  
  async synthesizeVoice(params: VoiceSynthesisParams): Promise<GenerateResponse> {
    return {
      success: true,
      data: { audioUrl: "https://example.com/seedance-audio.mp3" },
      usage: { tokens: 0, cost: 0.01, duration: 3000 },
      metadata: { model: "seedance-tts", provider: this.provider, timestamp: new Date().toISOString() },
    }
  }
  
  async estimateCost(request: GenerateRequest): Promise<CostEstimate> {
    return {
      provider: this.provider,
      model: request.model,
      estimatedTokens: 1000,
      estimatedCost: 0.05,
      estimatedTime: 2000,
      capabilities: ["text_generation", "video_generation"],
    }
  }
  
  async getAvailableModels(capability?: AiCapability): Promise<AiModel[]> {
    return [
      {
        id: "seedance-v2",
        name: "Seedance V2",
        provider: this.provider,
        capabilities: ["text_generation", "video_generation"],
        maxTokens: 8192,
        videoMaxDuration: 60,
        costPerToken: 0.00005,
      },
    ]
  }
  
  async testConnection(): Promise<boolean> {
    return true
  }
}

// 模拟的Kling服务（实际项目中需要实现）
class KlingService implements AiService {
  public provider: AiProvider = "kling"

  async execute(request: {
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
    model: string;
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
  }): Promise<any> {
    return {
      text: `Kling执行的回复: ${request.messages[request.messages.length - 1]?.content?.substring(0, 100)}...`,
      usage: { input_tokens: 60, output_tokens: 60 }
    }
  }

  async generateText(request: GenerateRequest): Promise<GenerateResponse> {
    return {
      success: true,
      data: `Kling生成的文本: ${request.prompt.substring(0, 100)}...`,
      usage: { tokens: 100, cost: 0.002, duration: 1500 },
      metadata: { model: request.model, provider: this.provider, timestamp: new Date().toISOString() },
    }
  }
  
  async analyzeScript(script: string): Promise<ScriptAnalysisResult> {
    return {
      summary: "Kling剧本分析结果",
      characters: [],
      scenes: [],
      emotions: [],
      themes: [],
      estimatedDuration: 60,
      complexity: "medium",
    }
  }
  
  async generateImage(params: ImageGenerationParams): Promise<any> {
    return {
      success: true,
      data: {
        id: `kling_img_${Date.now()}`,
        url: "https://placehold.co/1024x576/ef4444/ffffff?text=Kling+Image",
        metadata: { prompt: params.prompt, model: "kling-v1", generationTime: 2000, cost: 0.025 },
      },
    }
  }
  
  async generateVideo(params: VideoGenerationParams): Promise<GenerateResponse> {
    return {
      success: true,
      data: { videoUrl: "https://example.com/kling-video.mp4" },
      usage: { tokens: 0, cost: 0.15, duration: 8000 },
      metadata: { model: "kling-video", provider: this.provider, timestamp: new Date().toISOString() },
    }
  }
  
  async synthesizeVoice(params: VoiceSynthesisParams): Promise<GenerateResponse> {
    return {
      success: true,
      data: { audioUrl: "https://example.com/kling-audio.mp3" },
      usage: { tokens: 0, cost: 0.012, duration: 4000 },
      metadata: { model: "kling-tts", provider: this.provider, timestamp: new Date().toISOString() },
    }
  }
  
  async estimateCost(request: GenerateRequest): Promise<CostEstimate> {
    return {
      provider: this.provider,
      model: request.model,
      estimatedTokens: 1000,
      estimatedCost: 0.08,
      estimatedTime: 3000,
      capabilities: ["text_generation", "image_generation", "video_generation"],
    }
  }
  
  async getAvailableModels(capability?: AiCapability): Promise<AiModel[]> {
    return [
      {
        id: "kling-v1",
        name: "Kling V1",
        provider: this.provider,
        capabilities: ["text_generation", "image_generation", "video_generation"],
        maxTokens: 4096,
        imageResolution: "1024x576",
        videoMaxDuration: 30,
        costPerToken: 0.00008,
      },
    ]
  }
  
  async testConnection(): Promise<boolean> {
    return true
  }
}

// AI服务管理器配置
export interface AiManagerConfig {
  gemini?: GeminiConfig
  claude?: ClaudeConfig
  seedance?: SeedanceConfig
  kling?: KlingConfig
  openai?: AiApiConfig
  replicate?: AiApiConfig
  stability?: AiApiConfig
  defaultProvider?: AiProvider
  cacheEnabled?: boolean
  cacheTTL?: number
  retryPolicy?: {
    maxRetries: number
    baseDelay: number
    maxDelay: number
  }
}

// AI服务管理器
export class AiManager {
  private services: Map<AiProvider, AiService> = new Map()
  private config: AiManagerConfig
  private cache: Map<string, { data: any; timestamp: number }> = new Map()

  constructor(config: AiManagerConfig) {
    this.config = {
      cacheEnabled: true,
      cacheTTL: 5 * 60 * 1000, // 5分钟
      retryPolicy: {
        maxRetries: 3,
        baseDelay: 1000,
        maxDelay: 10000,
      },
      ...config,
    }

    this.initializeServices()
  }

  private initializeServices() {
    // 初始化Gemini服务
    if (this.config.gemini?.apiKey) {
      this.services.set("gemini", createGeminiService(this.config.gemini))
    }

    // 初始化Claude服务
    if (this.config.claude?.apiKey) {
      this.services.set("claude", createClaudeService(this.config.claude))
    }

    // 初始化Seedance服务（模拟）
    if (this.config.seedance?.apiKey) {
      this.services.set("seedance", new SeedanceService())
    }

    // 初始化Kling服务（模拟）
    if (this.config.kling?.apiKey) {
      this.services.set("kling", new KlingService())
    }

    // 可以继续添加其他服务...
  }

  // 获取服务实例
  getService(provider: AiProvider): AiService | undefined {
    return this.services.get(provider)
  }

  // 获取默认服务
  getDefaultService(): AiService | undefined {
    if (this.config.defaultProvider) {
      return this.getService(this.config.defaultProvider)
    }
    
    // 按优先级返回第一个可用服务
    const priority: AiProvider[] = ["claude", "gemini", "seedance", "kling"]
    for (const provider of priority) {
      const service = this.getService(provider)
      if (service) return service
    }
    
    return undefined
  }

  // 生成文本（自动选择服务）
  async generateText(request: GenerateRequest): Promise<GenerateResponse> {
    const service = this.getService(request.provider) || this.getDefaultService()
    if (!service) {
      throw new Error(`没有可用的AI服务，请配置API密钥`)
    }

    // 检查缓存
    const cacheKey = `text:${request.provider}:${request.model}:${JSON.stringify(request)}`
    const cached = this.getFromCache(cacheKey)
    if (cached) {
      return cached
    }

    // 执行生成
    const result = await this.withRetry(() => service.generateText(request))
    
    // 缓存结果
    if (result.success && this.config.cacheEnabled) {
      this.setCache(cacheKey, result)
    }
    
    return result
  }

  // 剧本分析（自动选择最佳服务）
  async analyzeScript(script: string, options?: any): Promise<ScriptAnalysisResult> {
    // 尝试使用Claude（擅长结构化分析）
    const claudeService = this.getService("claude")
    if (claudeService) {
      try {
        return await claudeService.analyzeScript(script)
      } catch (error) {
        console.warn("Claude剧本分析失败，尝试其他服务:", error)
      }
    }

    // 回退到Gemini
    const geminiService = this.getService("gemini")
    if (geminiService) {
      try {
        return await geminiService.analyzeScript(script)
      } catch (error) {
        console.warn("Gemini剧本分析失败:", error)
      }
    }

    throw new Error("所有AI服务剧本分析均失败")
  }

  // 获取所有可用模型
  async getAvailableModels(capability?: AiCapability): Promise<AiModel[]> {
    const models: AiModel[] = []
    
    for (const [provider, service] of this.services) {
      try {
        const providerModels = await service.getAvailableModels(capability)
        models.push(...providerModels)
      } catch (error) {
        console.warn(`获取${provider}模型失败:`, error)
      }
    }
    
    return models
  }

  // 获取支持特定能力的最佳服务
  getBestServiceForCapability(capability: AiCapability): AiService | undefined {
    const capableServices: { service: AiService; priority: number }[] = []
    
    for (const [provider, service] of this.services) {
      // 这里可以添加更复杂的评分逻辑
      let priority = 0
      
      // 根据能力和供应商特点评分
      switch (capability) {
        case "text_analysis":
          priority = provider === "claude" ? 10 : provider === "gemini" ? 8 : 5
          break
        case "video_generation":
          priority = provider === "seedance" ? 10 : provider === "kling" ? 9 : 3
          break
        case "image_generation":
          priority = provider === "kling" ? 10 : provider === "seedance" ? 8 : 5
          break
        default:
          priority = 5
      }
      
      capableServices.push({ service, priority })
    }
    
    // 按优先级排序
    capableServices.sort((a, b) => b.priority - a.priority)
    
    return capableServices[0]?.service
  }

  // 测试所有服务连接
  async testAllConnections(): Promise<Record<AiProvider, boolean>> {
    const results: Record<string, boolean> = {}
    
    for (const [provider, service] of this.services) {
      try {
        results[provider] = await service.testConnection()
      } catch {
        results[provider] = false
      }
    }
    
    return results
  }

  // 成本估算
  async estimateCost(request: GenerateRequest): Promise<CostEstimate> {
    const service = this.getService(request.provider)
    if (!service) {
      throw new Error(`服务 ${request.provider} 不可用`)
    }
    
    return await service.estimateCost(request)
  }

  // 缓存相关方法
  private getFromCache(key: string): any | null {
    if (!this.config.cacheEnabled) return null
    
    const cached = this.cache.get(key)
    if (!cached) return null
    
    const now = Date.now()
    if (now - cached.timestamp > (this.config.cacheTTL || 0)) {
      this.cache.delete(key)
      return null
    }
    
    return cached.data
  }

  private setCache(key: string, data: any): void {
    if (!this.config.cacheEnabled) return
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    })
    
    // 简单清理过期缓存
    if (this.cache.size > 100) {
      const now = Date.now()
      for (const [key, value] of this.cache.entries()) {
        if (now - value.timestamp > (this.config.cacheTTL || 0)) {
          this.cache.delete(key)
        }
      }
    }
  }

  // 重试机制
  private async withRetry<T>(fn: () => Promise<T>): Promise<T> {
    const { maxRetries = 3, baseDelay = 1000, maxDelay = 10000 } = this.config.retryPolicy || {}
    
    let lastError: Error
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error as Error
        
        // 最后一次尝试，直接抛出错误
        if (attempt === maxRetries) {
          break
        }
        
        // 计算延迟时间（指数退避）
        const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay)
        
        // 等待后重试
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    throw lastError!
  }

  // 清空缓存
  clearCache(): void {
    this.cache.clear()
  }
}

// 全局AI管理器实例（单例模式）
let globalAiManager: AiManager | null = null

export function getAiManager(config?: AiManagerConfig): AiManager {
  if (!globalAiManager) {
    if (!config) {
      throw new Error("首次调用需要提供AI管理器配置")
    }
    globalAiManager = new AiManager(config)
  }
  return globalAiManager
}

export function initializeAiManager(config: AiManagerConfig): AiManager {
  globalAiManager = new AiManager(config)
  return globalAiManager
}