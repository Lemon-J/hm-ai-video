// AI提供商类型
export type AiProvider = "gemini" | "claude" | "seedance" | "kling" | "openai" | "replicate" | "stability" | "local"

// AI模型配置
export interface AiModel {
  id: string
  name: string
  provider: AiProvider
  capabilities: AiCapability[]
  maxTokens?: number
  contextWindow?: number
  costPerToken?: number
  imageResolution?: string
  videoMaxDuration?: number
  supportedFormats?: string[]
}

// AI能力类型
export type AiCapability = 
  | "text_generation"
  | "text_analysis"
  | "image_generation"
  | "video_generation"
  | "voice_synthesis"
  | "character_design"
  | "scene_generation"
  | "storyboard_generation"
  | "prompt_optimization"

// 生成请求参数
export interface GenerateRequest {
  prompt: string
  model: string
  provider: AiProvider
  parameters?: Record<string, any>
  context?: any
  options?: {
    temperature?: number
    maxTokens?: number
    seed?: number
    style?: string
    quality?: "standard" | "hd"
    responseFormat?: { type: string }
  }
}

// 生成响应
export interface GenerateResponse {
  success: boolean
  data?: any
  error?: string
  usage?: {
    tokens: number
    cost: number
    duration: number
  }
  metadata?: {
    model: string
    provider: string
    timestamp: string
  }
}

// 视频生成参数
export interface VideoGenerationParams {
  script: string
  characters?: CharacterConfig[]
  scenes?: SceneConfig[]
  style: VideoStyle
  duration?: number
  resolution?: string
  fps?: number
  audio?: boolean
  subtitles?: boolean
}

export interface CharacterConfig {
  name: string
  description: string
  appearance?: string
  voiceStyle?: string
  seed?: string
}

export interface SceneConfig {
  id: string
  description: string
  location?: string
  timeOfDay?: string
  mood?: string
  characters?: string[]
}

export type VideoStyle = 
  | "cinematic"
  | "anime"
  | "realistic"
  | "cartoon"
  | "watercolor"
  | "cyberpunk"
  | "fantasy"

// 语音合成参数
export interface VoiceSynthesisParams {
  text: string
  voiceId: string
  language?: string
  emotion?: string
  speed?: number
  pitch?: number
}

// 图像生成参数
export interface ImageGenerationParams {
  prompt: string
  negativePrompt?: string
  width: number
  height: number
  numImages?: number
  seed?: number
  style?: string
}

// 剧本分析结果
export interface ScriptAnalysisResult {
  summary: string
  characters: CharacterAnalysis[]
  scenes: SceneAnalysis[]
  emotions: EmotionAnalysis[]
  themes: string[]
  estimatedDuration: number
  complexity: "low" | "medium" | "high"
}

export interface CharacterAnalysis {
  name: string
  role: "protagonist" | "antagonist" | "supporting" | "background"
  traits: string[]
  importance: number
  dialogueCount: number
}

export interface SceneAnalysis {
  id: number
  description: string
  location: string
  timeOfDay: string
  mood: string
  characters: string[]
  estimatedDuration: number
  keyMoments: string[]
}

export interface EmotionAnalysis {
  sceneId: number
  dominantEmotion: string
  intensity: number
  transition: string
}

// 资产生成结果
export interface AssetGenerationResult {
  id: string
  type: "character" | "scene" | "prop" | "background"
  url: string
  thumbnail?: string
  metadata: {
    prompt: string
    model: string
    seed: string
    generationTime: number
    cost: number
  }
}

// 成本估算
export interface CostEstimate {
  provider: AiProvider
  model: string
  estimatedTokens: number
  estimatedCost: number
  estimatedTime: number
  capabilities: AiCapability[]
  breakdown?: CostBreakdownItem[]
}

// 成本分解项
export interface CostBreakdownItem {
  step: string
  cost: number
  provider: string
  timestamp: string
}

// API配置
export interface AiApiConfig {
  apiKey: string
  baseUrl?: string
  timeout?: number
  maxRetries?: number
  rateLimit?: {
    requestsPerMinute: number
    requestsPerDay: number
  }
}

// 供应商特定的配置
export interface GeminiConfig extends AiApiConfig {
  projectId?: string
  location?: string
}

export interface ClaudeConfig extends AiApiConfig {
  organizationId?: string
}

export interface SeedanceConfig extends AiApiConfig {
  workspace?: string
}

export interface KlingConfig extends AiApiConfig {
  workspace?: string
  defaultStyle?: string
}

// 统一的AI服务接口
export interface AiService {
  provider: AiProvider

  // 执行通用AI请求
  execute(request: {
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
    model: string;
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
  }): Promise<any>

  // 文本生成
  generateText(request: GenerateRequest): Promise<GenerateResponse>

  // 剧本分析
  analyzeScript(script: string, options?: any): Promise<ScriptAnalysisResult>

  // 图像生成
  generateImage(params: ImageGenerationParams): Promise<AssetGenerationResult>

  // 视频生成
  generateVideo(params: VideoGenerationParams): Promise<GenerateResponse>

  // 语音合成
  synthesizeVoice(params: VoiceSynthesisParams): Promise<GenerateResponse>

  // 成本估算
  estimateCost(request: GenerateRequest): Promise<CostEstimate>

  // 获取可用模型
  getAvailableModels(capability?: AiCapability): Promise<AiModel[]>

  // 测试连接
  testConnection(): Promise<boolean>
}

// 错误类型
export class AiError extends Error {
  constructor(
    message: string,
    public code: string,
    public provider: AiProvider,
    public originalError?: any
  ) {
    super(message)
    this.name = "AiError"
  }
}

// 供应商错误码
export const AiErrorCodes = {
  // 通用错误
  INVALID_API_KEY: "INVALID_API_KEY",
  RATE_LIMITED: "RATE_LIMITED",
  NETWORK_ERROR: "NETWORK_ERROR",
  TIMEOUT: "TIMEOUT",
  INVALID_PARAMETERS: "INVALID_PARAMETERS",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",

  // 供应商特定错误
  GEMINI_SAFETY: "GEMINI_SAFETY",
  CLAUDE_CONTEXT_EXCEEDED: "CLAUDE_CONTEXT_EXCEEDED",
  SEEDANCE_QUOTA_EXCEEDED: "SEEDANCE_QUOTA_EXCEEDED",
  KLING_STYLE_NOT_SUPPORTED: "KLING_STYLE_NOT_SUPPORTED",
  
  // 内容相关错误
  CONTENT_VIOLATION: "CONTENT_VIOLATION",
  CONTENT_TOO_LONG: "CONTENT_TOO_LONG",
  UNSUPPORTED_FORMAT: "UNSUPPORTED_FORMAT",
} as const