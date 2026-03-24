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
  AiError,
  AiErrorCodes,
  ClaudeConfig
} from "./types"

export class ClaudeService implements AiService {
  public provider: AiProvider = "claude"
  private config: ClaudeConfig
  private apiUrl = "https://api.anthropic.com/v1"

  constructor(config: ClaudeConfig) {
    this.config = {
      timeout: 60000,
      maxRetries: 3,
      rateLimit: {
        requestsPerMinute: 40,
        requestsPerDay: 800,
      },
      ...config,
    }
  }

  async execute(request: {
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
    model: string;
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
  }): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.config.apiKey,
          "anthropic-version": "2023-06-01",
          ...(this.config.organizationId && {
            "anthropic-organization": this.config.organizationId,
          }),
        },
        body: JSON.stringify({
          model: request.model,
          max_tokens: request.maxTokens || 4096,
          temperature: request.temperature || 0.7,
          system: request.messages.find(m => m.role === 'system')?.content || undefined,
          messages: request.messages.filter(m => m.role !== 'system'),
        }),
        signal: AbortSignal.timeout(this.config.timeout!),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new AiError(
          `Claude API error: ${errorData.error?.message || response.statusText}`,
          this.getErrorCode(errorData, response.status),
          this.provider,
          errorData
        )
      }

      return await response.json()
    } catch (error) {
      if (error instanceof AiError) throw error
      throw new AiError(
        `Claude execute error: ${error instanceof Error ? error.message : String(error)}`,
        AiErrorCodes.NETWORK_ERROR,
        this.provider,
        error
      )
    }
  }

  async generateText(request: GenerateRequest): Promise<GenerateResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.config.apiKey,
          "anthropic-version": "2023-06-01",
          ...(this.config.organizationId && {
            "anthropic-organization": this.config.organizationId,
          }),
        },
        body: JSON.stringify({
          model: request.model,
          max_tokens: request.options?.maxTokens || 4096,
          temperature: request.options?.temperature || 0.7,
          system: "你是一个专业的AI短剧创作助手，擅长剧本分析、角色设计和创意写作。",
          messages: [
            {
              role: "user",
              content: request.prompt,
            },
          ],
        }),
        signal: AbortSignal.timeout(this.config.timeout!),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new AiError(
          `Claude API error: ${errorData.error?.message || response.statusText}`,
          this.getErrorCode(errorData, response.status),
          this.provider,
          errorData
        )
      }

      const data = await response.json()
      const text = data.content[0]?.text || ""

      return {
        success: true,
        data: text,
        usage: {
          tokens: data.usage?.input_tokens + data.usage?.output_tokens || 0,
          cost: this.calculateCost(data.usage),
          duration: 0,
        },
        metadata: {
          model: request.model,
          provider: this.provider,
          timestamp: new Date().toISOString(),
        },
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  async analyzeScript(script: string): Promise<ScriptAnalysisResult> {
    const prompt = `请分析以下剧本，提供详细的结构化分析。请确保以纯JSON格式返回，不要包含任何额外文本。

剧本内容：
${script}

分析要求：
1. 总结剧本概要（50-100字）
2. 提取所有角色，包括名称、角色类型（主角/反派/配角/背景）、特征、重要性和对话数量
3. 分析所有场景，包括场景ID、描述、地点、时间、氛围、涉及角色、预计时长和关键时刻
4. 分析情感变化，包括场景ID、主导情感、强度和情感过渡
5. 提取主要主题
6. 估算总时长和复杂度（low/medium/high）

请严格按照以下JSON结构返回：
{
  "summary": "string",
  "characters": [
    {
      "name": "string",
      "role": "string",
      "traits": ["string"],
      "importance": 0.0,
      "dialogueCount": 0
    }
  ],
  "scenes": [
    {
      "id": 0,
      "description": "string",
      "location": "string",
      "timeOfDay": "string",
      "mood": "string",
      "characters": ["string"],
      "estimatedDuration": 0,
      "keyMoments": ["string"]
    }
  ],
  "emotions": [
    {
      "sceneId": 0,
      "dominantEmotion": "string",
      "intensity": 0.0,
      "transition": "string"
    }
  ],
  "themes": ["string"],
  "estimatedDuration": 0,
  "complexity": "string"
}`

    const response = await this.generateText({
      prompt,
      model: "claude-3-5-sonnet-20241022",
      provider: this.provider,
      options: {
        temperature: 0.1,
        maxTokens: 4096,
      },
    })

    if (!response.success) {
      throw new AiError(
        "剧本分析失败",
        response.error || "UNKNOWN_ERROR",
        this.provider
      )
    }

    try {
      // 清理响应，提取JSON
      let jsonString = response.data
      
      // 去除可能的Markdown代码块
      jsonString = jsonString.replace(/```json\n?|\n?```/g, "")
      
      // 去除可能的HTML标签
      jsonString = jsonString.replace(/<\/?[^>]+(>|$)/g, "")
      
      // 尝试解析
      return JSON.parse(jsonString)
    } catch (error) {
      console.error("解析Claude响应失败:", response.data)
      throw new AiError(
        "解析剧本分析结果失败，请检查API响应格式",
        "INVALID_RESPONSE",
        this.provider,
        error
      )
    }
  }

  async generateImage(params: ImageGenerationParams): Promise<any> {
    // Claude当前不支持原生图像生成，这里返回模拟数据
    // 实际项目中可以集成其他图像生成服务
    return {
      success: true,
      data: {
        id: `img_${Date.now()}`,
        url: "https://placehold.co/1024x576/8b5cf6/ffffff?text=Claude+Image",
        thumbnail: "https://placehold.co/300x169/8b5cf6/ffffff?text=Thumbnail",
        metadata: {
          prompt: params.prompt,
          model: "claude-vision",
          seed: params.seed || Math.floor(Math.random() * 1000000),
          generationTime: 2000,
          cost: 0.03,
        },
      },
      usage: {
        tokens: 0,
        cost: 0.03,
        duration: 2000,
      },
      metadata: {
        model: "claude-vision",
        provider: this.provider,
        timestamp: new Date().toISOString(),
      },
    }
  }

  async generateVideo(params: VideoGenerationParams): Promise<GenerateResponse> {
    // Claude当前不支持视频生成，这里返回模拟数据
    const prompt = `基于以下信息生成视频剧本和描述：
剧本：${params.script}
视频风格：${params.style}
分辨率：${params.resolution || "1080p"}
时长：${params.duration || 60}秒

请提供详细的视频生成方案。`

    const response = await this.generateText({
      prompt,
      model: "claude-3-5-sonnet-20241022",
      provider: this.provider,
      options: {
        temperature: 0.7,
        maxTokens: 2048,
      },
    })

    return {
      ...response,
      data: {
        ...response.data,
        videoScript: response.data,
        estimatedGenerationTime: 300,
      },
    }
  }

  async synthesizeVoice(params: VoiceSynthesisParams): Promise<GenerateResponse> {
    // Claude当前不支持语音合成，这里返回模拟数据
    return {
      success: true,
      data: {
        audioUrl: "https://example.com/claude-audio.mp3",
        duration: Math.ceil(params.text.length / 12), // 估算时长
        format: "mp3",
        voiceId: params.voiceId,
      },
      usage: {
        tokens: 0,
        cost: 0.015,
        duration: 6000,
      },
      metadata: {
        model: "text-to-speech",
        provider: this.provider,
        timestamp: new Date().toISOString(),
      },
    }
  }

  async estimateCost(request: GenerateRequest): Promise<CostEstimate> {
    const estimatedTokens = Math.ceil(request.prompt.length / 4)
    
    // Claude 3.5 Sonnet定价：$3/1M input tokens, $15/1M output tokens
    const inputCostPerToken = 0.000003
    const outputCostPerToken = 0.000015
    
    // 假设输出token数为输入的一半
    const estimatedOutputTokens = Math.ceil(estimatedTokens * 0.5)
    const estimatedCost = (estimatedTokens * inputCostPerToken) + (estimatedOutputTokens * outputCostPerToken)

    return {
      provider: this.provider,
      model: request.model,
      estimatedTokens: estimatedTokens + estimatedOutputTokens,
      estimatedCost,
      estimatedTime: Math.ceil(estimatedTokens / 500) * 1000, // 毫秒
      capabilities: [
        "text_generation",
        "text_analysis",
        "character_design",
        "scene_generation",
        "prompt_optimization",
      ],
    }
  }

  async getAvailableModels(capability?: AiCapability): Promise<AiModel[]> {
    const models: AiModel[] = [
      {
        id: "claude-3-5-sonnet-20241022",
        name: "Claude 3.5 Sonnet",
        provider: this.provider,
        capabilities: [
          "text_generation",
          "text_analysis",
          "character_design",
          "scene_generation",
          "prompt_optimization",
        ],
        maxTokens: 200000,
        contextWindow: 200000,
        costPerToken: 0.000003, // 输入tokens
      },
      {
        id: "claude-3-opus-20240229",
        name: "Claude 3 Opus",
        provider: this.provider,
        capabilities: [
          "text_generation",
          "text_analysis",
          "character_design",
          "scene_generation",
          "prompt_optimization",
        ],
        maxTokens: 200000,
        contextWindow: 200000,
        costPerToken: 0.000015, // 输入tokens
      },
      {
        id: "claude-3-haiku-20240307",
        name: "Claude 3 Haiku",
        provider: this.provider,
        capabilities: [
          "text_generation",
          "text_analysis",
          "prompt_optimization",
        ],
        maxTokens: 200000,
        contextWindow: 200000,
        costPerToken: 0.00000025, // 输入tokens
      },
    ]

    if (capability) {
      return models.filter(model => model.capabilities.includes(capability))
    }

    return models
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/models`, {
        headers: {
          "x-api-key": this.config.apiKey,
          "anthropic-version": "2023-06-01",
        },
        signal: AbortSignal.timeout(10000),
      })
      return response.ok
    } catch {
      return false
    }
  }

  private calculateCost(usage: any): number {
    if (!usage) return 0
    
    const inputTokens = usage.input_tokens || 0
    const outputTokens = usage.output_tokens || 0
    
    // Claude 3.5 Sonnet定价
    const inputCostPerToken = 0.000003
    const outputCostPerToken = 0.000015
    
    return (inputTokens * inputCostPerToken) + (outputTokens * outputCostPerToken)
  }

  private getErrorCode(errorData: any, status: number): string {
    if (status === 429) {
      return AiErrorCodes.RATE_LIMITED
    }
    if (status === 401 || status === 403) {
      return AiErrorCodes.INVALID_API_KEY
    }
    if (errorData.error?.message?.includes("context length")) {
      return AiErrorCodes.CLAUDE_CONTEXT_EXCEEDED
    }
    return AiErrorCodes.NETWORK_ERROR
  }

  private handleError(error: any): GenerateResponse {
    const isAiError = error instanceof AiError
    
    return {
      success: false,
      error: isAiError ? error.code : AiErrorCodes.NETWORK_ERROR,
      usage: {
        tokens: 0,
        cost: 0,
        duration: 0,
      },
      metadata: {
        model: "unknown",
        provider: this.provider,
        timestamp: new Date().toISOString(),
      },
    }
  }
}

// 工厂函数
export function createClaudeService(config: ClaudeConfig): ClaudeService {
  return new ClaudeService(config)
}