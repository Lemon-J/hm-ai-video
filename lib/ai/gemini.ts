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
  GeminiConfig
} from "./types"

export class GeminiService implements AiService {
  public provider: AiProvider = "gemini"
  private config: GeminiConfig
  private apiUrl = "https://generativelanguage.googleapis.com/v1beta"

  constructor(config: GeminiConfig) {
    this.config = {
      timeout: 30000,
      maxRetries: 3,
      rateLimit: {
        requestsPerMinute: 60,
        requestsPerDay: 1000,
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
      const systemMessage = request.messages.find(m => m.role === 'system')
      const userMessages = request.messages.filter(m => m.role !== 'system')

      const response = await fetch(
        `${this.apiUrl}/models/${request.model}:generateContent?key=${this.config.apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            systemInstruction: systemMessage ? {
              parts: [{ text: systemMessage.content }]
            } : undefined,
            contents: userMessages.map(m => ({
              role: m.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: m.content }]
            })),
            generationConfig: {
              temperature: request.temperature ?? 0.7,
              maxOutputTokens: request.maxTokens ?? 2048,
              topP: 0.95,
              topK: 40,
            },
          }),
          signal: AbortSignal.timeout(this.config.timeout!),
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new AiError(
          `Gemini API error: ${errorData.error?.message || response.statusText}`,
          this.getErrorCode(errorData),
          this.provider,
          errorData
        )
      }

      return await response.json()
    } catch (error) {
      if (error instanceof AiError) throw error
      throw new AiError(
        `Gemini execute error: ${error instanceof Error ? error.message : String(error)}`,
        AiErrorCodes.NETWORK_ERROR,
        this.provider,
        error
      )
    }
  }

  async generateText(request: GenerateRequest): Promise<GenerateResponse> {
    try {
      const response = await fetch(
        `${this.apiUrl}/models/${request.model}:generateContent?key=${this.config.apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: request.prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: request.options?.temperature ?? 0.7,
              maxOutputTokens: request.options?.maxTokens ?? 2048,
              topP: 0.95,
              topK: 40,
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
            ],
          }),
          signal: AbortSignal.timeout(this.config.timeout!),
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new AiError(
          `Gemini API error: ${errorData.error?.message || response.statusText}`,
          this.getErrorCode(errorData),
          this.provider,
          errorData
        )
      }

      const data = await response.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ""

      return {
        success: true,
        data: text,
        usage: {
          tokens: data.usageMetadata?.totalTokenCount || 0,
          cost: this.calculateCost(data.usageMetadata?.totalTokenCount || 0),
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
    const prompt = `请分析以下剧本，提供详细的结构化分析：

${script}

请按照以下JSON格式返回分析结果：
{
  "summary": "剧本概要",
  "characters": [
    {
      "name": "角色名",
      "role": "主角/反派/配角/背景",
      "traits": ["特征1", "特征2"],
      "importance": 0.8,
      "dialogueCount": 12
    }
  ],
  "scenes": [
    {
      "id": 1,
      "description": "场景描述",
      "location": "地点",
      "timeOfDay": "时间",
      "mood": "氛围",
      "characters": ["角色名1", "角色名2"],
      "estimatedDuration": 30,
      "keyMoments": ["关键时刻1", "关键时刻2"]
    }
  ],
  "emotions": [
    {
      "sceneId": 1,
      "dominantEmotion": "主导情感",
      "intensity": 0.7,
      "transition": "情感过渡"
    }
  ],
  "themes": ["主题1", "主题2"],
  "estimatedDuration": 300,
  "complexity": "low/medium/high"
}`

    const response = await this.generateText({
      prompt,
      model: "gemini-2.0-flash",
      provider: this.provider,
      options: {
        temperature: 0.2,
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
      const jsonString = response.data.replace(/```json\n?|\n?```/g, "")
      return JSON.parse(jsonString)
    } catch (error) {
      throw new AiError(
        "解析剧本分析结果失败",
        "INVALID_RESPONSE",
        this.provider,
        error
      )
    }
  }

  async generateImage(params: ImageGenerationParams): Promise<any> {
    // Gemini当前不支持图像生成，这里返回模拟数据
    // 实际项目中可以集成其他图像生成服务
    return {
      success: true,
      data: {
        id: `img_${Date.now()}`,
        url: "https://placehold.co/1024x576/3b82f6/ffffff?text=Generated+Image",
        thumbnail: "https://placehold.co/300x169/3b82f6/ffffff?text=Thumbnail",
        metadata: {
          prompt: params.prompt,
          model: "gemini-imagen",
          seed: params.seed || Math.floor(Math.random() * 1000000),
          generationTime: 1500,
          cost: 0.02,
        },
      },
      usage: {
        tokens: 0,
        cost: 0.02,
        duration: 1500,
      },
      metadata: {
        model: "gemini-imagen",
        provider: this.provider,
        timestamp: new Date().toISOString(),
      },
    }
  }

  async generateVideo(params: VideoGenerationParams): Promise<GenerateResponse> {
    // Gemini当前不支持视频生成，这里返回模拟数据
    const prompt = `根据以下剧本生成视频：
剧本：${params.script}
风格：${params.style}
分辨率：${params.resolution || "1080p"}
时长：${params.duration || 60}秒

请生成符合上述要求的视频内容。`

    return {
      success: true,
      data: {
        videoUrl: "https://example.com/generated-video.mp4",
        thumbnail: "https://example.com/video-thumbnail.jpg",
        duration: params.duration || 60,
        resolution: params.resolution || "1080p",
        estimatedGenerationTime: 300,
      },
      usage: {
        tokens: 0,
        cost: 0.5,
        duration: 300000,
      },
      metadata: {
        model: "gemini-video",
        provider: this.provider,
        timestamp: new Date().toISOString(),
      },
    }
  }

  async synthesizeVoice(params: VoiceSynthesisParams): Promise<GenerateResponse> {
    // Gemini当前不支持语音合成，这里返回模拟数据
    return {
      success: true,
      data: {
        audioUrl: "https://example.com/generated-audio.mp3",
        duration: Math.ceil(params.text.length / 15), // 估算时长
        format: "mp3",
        voiceId: params.voiceId,
      },
      usage: {
        tokens: 0,
        cost: 0.01,
        duration: 5000,
      },
      metadata: {
        model: "text-to-speech",
        provider: this.provider,
        timestamp: new Date().toISOString(),
      },
    }
  }

  async estimateCost(request: GenerateRequest): Promise<CostEstimate> {
    // 根据提示词长度估算token数量
    const estimatedTokens = Math.ceil(request.prompt.length / 4)
    const costPerToken = 0.0000005 // Gemini Pro定价（示例）

    return {
      provider: this.provider,
      model: request.model,
      estimatedTokens,
      estimatedCost: estimatedTokens * costPerToken,
      estimatedTime: Math.ceil(estimatedTokens / 1000) * 1000, // 毫秒
      capabilities: [
        "text_generation",
        "text_analysis",
        "prompt_optimization",
      ],
    }
  }

  async getAvailableModels(capability?: AiCapability): Promise<AiModel[]> {
    const models: AiModel[] = [
      {
        id: "gemini-2.0-flash",
        name: "Gemini 2.0 Flash",
        provider: this.provider,
        capabilities: ["text_generation", "text_analysis", "prompt_optimization"],
        maxTokens: 8192,
        contextWindow: 8192,
        costPerToken: 0.0000005,
      },
      {
        id: "gemini-2.0-pro",
        name: "Gemini 2.0 Pro",
        provider: this.provider,
        capabilities: ["text_generation", "text_analysis", "prompt_optimization"],
        maxTokens: 32768,
        contextWindow: 32768,
        costPerToken: 0.000001,
      },
      {
        id: "gemini-imagen",
        name: "Gemini Imagen",
        provider: this.provider,
        capabilities: ["image_generation"],
        imageResolution: "1024x1024",
        costPerToken: 0.02, // 每张图片
      },
    ]

    if (capability) {
      return models.filter(model => model.capabilities.includes(capability))
    }

    return models
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.apiUrl}/models?key=${this.config.apiKey}`,
        {
          signal: AbortSignal.timeout(10000),
        }
      )
      return response.ok
    } catch {
      return false
    }
  }

  private calculateCost(tokens: number): number {
    // Gemini Pro定价：$0.0005 per 1K tokens for input, $0.0015 per 1K tokens for output
    // 这里使用平均值简化计算
    return (tokens / 1000) * 0.001
  }

  private getErrorCode(errorData: any): string {
    if (errorData.error?.code === 429) {
      return AiErrorCodes.RATE_LIMITED
    }
    if (errorData.error?.message?.includes("API key")) {
      return AiErrorCodes.INVALID_API_KEY
    }
    if (errorData.error?.message?.includes("safety")) {
      return AiErrorCodes.GEMINI_SAFETY
    }
    return AiErrorCodes.UNKNOWN_ERROR
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
export function createGeminiService(config: GeminiConfig): GeminiService {
  return new GeminiService(config)
}