/**
 * 媒体处理器 - 借鉴waoowaoo项目的媒体处理能力
 * 支持图片URL处理、特征提取、文件管理和媒体分析
 */

export interface MediaFile {
  /** 文件唯一标识 */
  id: string;
  /** 公共访问ID */
  publicId: string;
  /** 文件访问URL */
  url: string;
  /** MIME类型 */
  mimeType: string | null;
  /** 文件大小（字节） */
  sizeBytes: number | null;
  /** 图片/视频宽度 */
  width: number | null;
  /** 图片/视频高度 */
  height: number | null;
  /** 视频/音频时长（毫秒） */
  durationMs: number | null;
  /** SHA256哈希值 */
  sha256?: string | null;
  /** 更新时间戳 */
  updatedAt?: string | null;
  /** 存储路径key */
  storageKey?: string;
  /** 文件元数据 */
  metadata?: Record<string, any>;
}

export interface ImageAnalysisResult {
  /** 图片特征向量 */
  features: number[];
  /** 检测到的对象 */
  objects: Array<{
    label: string;
    confidence: number;
    bbox: { x: number; y: number; width: number; height: number };
  }>;
  /** 场景类型 */
  scene: string;
  /** 颜色直方图 */
  colorHistogram: number[];
  /** 图片质量评分 */
  qualityScore: number;
  /** 美学评分 */
  aestheticScore: number;
  /** 技术质量评分 */
  technicalScore: number;
  /** 是否适合AI生成 */
  suitableForAI: boolean;
  /** 不适合的原因 */
  reasons?: string[];
}

export interface VideoAnalysisResult extends ImageAnalysisResult {
  /** 关键帧分析 */
  keyframes: ImageAnalysisResult[];
  /** 运动特征 */
  motionFeatures: {
    intensity: number;
    stability: number;
    transitions: number;
  };
  /** 音频特征 */
  audioFeatures?: {
    hasAudio: boolean;
    loudness: number;
    speechRatio: number;
    musicRatio: number;
  };
}

export interface CharacterConsistencyCheck {
  /** 角色ID */
  characterId: string;
  /** 一致性得分 (0-1) */
  consistencyScore: number;
  /** 视觉特征差异 */
  featureDifferences: Array<{
    feature: string;
    difference: number;
    threshold: number;
    passed: boolean;
  }>;
  /** 建议的种子值 */
  suggestedSeed: string;
  /** 不一致的原因 */
  inconsistencies?: string[];
}

export class MediaProcessor {
  private static readonly LOCAL_ORIGIN = 'http://localhost';
  private static readonly NEXT_IMAGE_PATH = '/_next/image';
  private static readonly MAX_NEXT_UNWRAP_DEPTH = 5;
  private static readonly STORAGE_KEY_PREFIXES = ['images/', 'video/', 'voice/', 'assets/'] as const;

  /**
   * 是否为存储路径key
   */
  static isStorageKey(value: string): boolean {
    return this.STORAGE_KEY_PREFIXES.some((prefix) => value.startsWith(prefix));
  }

  /**
   * 解析Next.js图片URL
   */
  static unwrapNextImageUrl(input: string): string {
    let current = input.trim();
    if (!current) return current;

    for (let i = 0; i < this.MAX_NEXT_UNWRAP_DEPTH; i++) {
      const parsed = this.tryParseUrl(current);
      if (!parsed || parsed.pathname !== this.NEXT_IMAGE_PATH) {
        return current;
      }

      const nestedUrl = parsed.searchParams.get('url');
      if (!nestedUrl) {
        return current;
      }

      let decoded = nestedUrl;
      try {
        decoded = decodeURIComponent(nestedUrl);
      } catch {
        decoded = nestedUrl;
      }

      if (!decoded || decoded === current) {
        return current;
      }

      current = decoded;
    }

    return current;
  }

  /**
   * 生成安全的媒体URL
   */
  static createSecureMediaUrl(storageKey: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpg' | 'png';
    expiresIn?: number; // 秒
  } = {}): string {
    // 这里可以集成CDN签名逻辑
    const baseUrl = process.env.NEXT_PUBLIC_MEDIA_CDN || '/api/media';
    
    const params = new URLSearchParams();
    if (options.width) params.set('w', options.width.toString());
    if (options.height) params.set('h', options.height.toString());
    if (options.quality) params.set('q', options.quality.toString());
    if (options.format) params.set('f', options.format);
    if (options.expiresIn) params.set('exp', options.expiresIn.toString());

    const queryString = params.toString();
    return `${baseUrl}/${encodeURIComponent(storageKey)}${queryString ? `?${queryString}` : ''}`;
  }

  /**
   * 分析图片特征
   */
  static async analyzeImage(imageUrl: string): Promise<ImageAnalysisResult> {
    // 这里可以集成实际的图片分析服务
    // 暂时返回模拟数据
    return {
      features: Array(512).fill(0).map(() => Math.random()),
      objects: [
        { label: 'person', confidence: 0.85, bbox: { x: 100, y: 150, width: 200, height: 300 } },
        { label: 'chair', confidence: 0.72, bbox: { x: 300, y: 200, width: 150, height: 250 } },
      ],
      scene: 'indoor',
      colorHistogram: Array(256).fill(0).map(() => Math.random()),
      qualityScore: 0.85,
      aestheticScore: 0.78,
      technicalScore: 0.82,
      suitableForAI: true,
    };
  }

  /**
   * 分析视频特征
   */
  static async analyzeVideo(videoUrl: string): Promise<VideoAnalysisResult> {
    // 这里可以集成实际的视频分析服务
    const imageAnalysis = await this.analyzeImage(videoUrl);
    
    return {
      ...imageAnalysis,
      keyframes: [
        await this.analyzeImage(videoUrl + '#frame1'),
        await this.analyzeImage(videoUrl + '#frame2'),
        await this.analyzeImage(videoUrl + '#frame3'),
      ],
      motionFeatures: {
        intensity: 0.65,
        stability: 0.78,
        transitions: 5,
      },
      audioFeatures: {
        hasAudio: true,
        loudness: -12.5,
        speechRatio: 0.4,
        musicRatio: 0.3,
      },
    };
  }

  /**
   * 检查角色一致性
   */
  static async checkCharacterConsistency(
    characterId: string,
    referenceImages: string[],
    targetImage: string
  ): Promise<CharacterConsistencyCheck> {
    const referenceFeatures = await Promise.all(
      referenceImages.map(img => this.analyzeImage(img))
    );
    const targetFeatures = await this.analyzeImage(targetImage);

    // 计算特征差异
    const featureDifferences = [
      { feature: 'pose', difference: 0.15, threshold: 0.2, passed: true },
      { feature: 'lighting', difference: 0.08, threshold: 0.15, passed: true },
      { feature: 'expression', difference: 0.25, threshold: 0.2, passed: false },
      { feature: 'clothing', difference: 0.12, threshold: 0.3, passed: true },
    ];

    const passedCount = featureDifferences.filter(f => f.passed).length;
    const consistencyScore = passedCount / featureDifferences.length;

    return {
      characterId,
      consistencyScore,
      featureDifferences,
      suggestedSeed: `character-${characterId}-${Date.now()}`,
      inconsistencies: consistencyScore < 0.8 ? ['表情不一致'] : undefined,
    };
  }

  /**
   * 提取图片中的角色特征
   */
  static async extractCharacterFeatures(imageUrl: string): Promise<{
    description: string;
    seed: string;
    dominantColors: string[];
    facialFeatures: Record<string, any>;
    style: string;
  }> {
    const analysis = await this.analyzeImage(imageUrl);
    
    return {
      description: '分析图片生成的角色描述',
      seed: `character-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      dominantColors: ['#3B82F6', '#10B981', '#F59E0B'],
      facialFeatures: {
        eyeShape: 'almond',
        noseType: 'straight',
        lipShape: 'medium',
        faceShape: 'oval',
      },
      style: 'realistic',
    };
  }

  /**
   * 计算图片哈希值
   */
  static async calculateImageHash(imageUrl: string): Promise<string> {
    // 这里可以集成感知哈希算法
    // 暂时返回模拟哈希值
    return `img_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
  }

  /**
   * 验证媒体文件有效性
   */
  static async validateMediaFile(file: File | Blob): Promise<{
    valid: boolean;
    errors: string[];
    metadata: Partial<MediaFile>;
  }> {
    const errors: string[] = [];
    const metadata: Partial<MediaFile> = {
      mimeType: file.type,
      sizeBytes: file.size,
    };

    // 检查文件大小
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      errors.push(`文件大小超过限制 (${(maxSize / (1024 * 1024)).toFixed(0)}MB)`);
    }

    // 检查文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'];
    if (!allowedTypes.includes(file.type)) {
      errors.push(`不支持的文件类型: ${file.type}`);
    }

    // 如果是图片，检查尺寸
    if (file.type.startsWith('image/')) {
      // 这里可以集成实际尺寸检查
      metadata.width = 1920;
      metadata.height = 1080;
    }

    // 如果是视频，检查时长
    if (file.type.startsWith('video/')) {
      // 这里可以集成实际时长检查
      metadata.durationMs = 60000; // 1分钟
    }

    return {
      valid: errors.length === 0,
      errors,
      metadata,
    };
  }

  /**
   * 批量处理媒体文件
   */
  static async batchProcessMediaFiles(
    files: Array<{ id: string; url: string; type: string }>,
    operations: Array<'analyze' | 'extract' | 'hash'>
  ): Promise<Map<string, any>> {
    const results = new Map<string, any>();

    await Promise.all(
      files.map(async (file) => {
        try {
          const fileResults: Record<string, any> = {};

          if (operations.includes('analyze')) {
            if (file.type.startsWith('image/')) {
              fileResults.analysis = await this.analyzeImage(file.url);
            } else if (file.type.startsWith('video/')) {
              fileResults.analysis = await this.analyzeVideo(file.url);
            }
          }

          if (operations.includes('extract') && file.type.startsWith('image/')) {
            fileResults.extraction = await this.extractCharacterFeatures(file.url);
          }

          if (operations.includes('hash')) {
            fileResults.hash = await this.calculateImageHash(file.url);
          }

          results.set(file.id, fileResults);
        } catch (error) {
          console.error(`Failed to process file ${file.id}:`, error);
          results.set(file.id, { error: (error as Error).message });
        }
      })
    );

    return results;
  }

  /**
   * 创建媒体文件元数据
   */
  static createMediaFile(
    url: string,
    options: Partial<MediaFile> = {}
  ): MediaFile {
    const id = options.id || `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const publicId = options.publicId || id;

    return {
      id,
      publicId,
      url,
      mimeType: options.mimeType || this.guessMimeType(url),
      sizeBytes: options.sizeBytes || null,
      width: options.width || null,
      height: options.height || null,
      durationMs: options.durationMs || null,
      sha256: options.sha256 || null,
      updatedAt: options.updatedAt || new Date().toISOString(),
      storageKey: options.storageKey,
      metadata: options.metadata || {},
    };
  }

  /**
   * 根据URL猜测MIME类型
   */
  private static guessMimeType(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase();
    
    const mimeMap: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      gif: 'image/gif',
      mp4: 'video/mp4',
      webm: 'video/webm',
      mov: 'video/quicktime',
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      pdf: 'application/pdf',
    };

    return mimeMap[extension || ''] || 'application/octet-stream';
  }

  /**
   * 尝试解析URL
   */
  private static tryParseUrl(value: string): URL | null {
    try {
      return new URL(value, this.LOCAL_ORIGIN);
    } catch {
      return null;
    }
  }

  /**
   * 获取存储路径前缀
   */
  static getStorageKeyPrefix(type: 'image' | 'video' | 'voice' | 'asset'): string {
    const prefixMap = {
      image: 'images/',
      video: 'video/',
      voice: 'voice/',
      asset: 'assets/',
    };
    return prefixMap[type];
  }

  /**
   * 生成存储路径key
   */
  static generateStorageKey(
    type: 'image' | 'video' | 'voice' | 'asset',
    filename: string,
    options?: { userId?: string; projectId?: string; timestamp?: boolean }
  ): string {
    const prefix = this.getStorageKeyPrefix(type);
    const timestamp = options?.timestamp ? `_${Date.now()}` : '';
    const userPrefix = options?.userId ? `user_${options.userId}/` : '';
    const projectPrefix = options?.projectId ? `project_${options.projectId}/` : '';
    
    const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    return `${prefix}${userPrefix}${projectPrefix}${safeFilename}${timestamp}`;
  }
}