// 基于waoowaoo Hollywood流程的工作流引擎
// 实现完整的AI短剧生成流程

import {
  AiService,
  AiProvider,
  GenerateRequest,
  ScriptAnalysisResult,
  VideoGenerationParams,
  CostEstimate
} from "./types";
import { AiManager } from "./manager";
import { scriptPrompts, characterPrompts, scenePrompts } from "../prompts/templates";
import { isJsonArray, isJsonObject } from "@/lib/utils/json-types";
import { prisma } from "@/lib/db";
import type { WorkflowJobData } from "../queue/worker";

export interface HollywoodWorkflowStep {
  id: string;
  name: string;
  description: string;
  required: boolean;
  aiService: AiProvider[];
  timeout: number;
  retryCount: number;
  dependencies: string[]; // 依赖的步骤ID
}

export interface WorkflowExecutionState {
  projectId: string;
  scriptId: string;
  currentStep: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number; // 0-100
  results: Record<string, any>;
  errors: Record<string, string>;
  costEstimate: CostEstimate;
  startedAt: Date;
  completedAt?: Date;
}

export class HollywoodWorkflowEngine {
  private aiManager: AiManager;
  
  // Hollywood标准流程步骤
  private readonly workflowSteps: HollywoodWorkflowStep[] = [
    {
      id: 'script_analysis',
      name: '剧本智能分析',
      description: '分析剧本结构、提取角色、场景、情感变化',
      required: true,
      aiService: ['claude', 'gemini'],
      timeout: 120000, // 2分钟
      retryCount: 3,
      dependencies: []
    },
    {
      id: 'character_extraction',
      name: '角色特征提取',
      description: '从剧本中提取角色特征，创建角色档案',
      required: true,
      aiService: ['claude', 'gemini'],
      timeout: 60000,
      retryCount: 2,
      dependencies: ['script_analysis']
    },
    {
      id: 'character_consistency_seeding',
      name: '角色一致性种子生成',
      description: '为每个角色生成全局种子，确保视觉一致性',
      required: true,
      aiService: ['claude'],
      timeout: 45000,
      retryCount: 2,
      dependencies: ['character_extraction']
    },
    {
      id: 'scene_breakdown',
      name: '场景分解',
      description: '将剧本分解为具体场景，包含时间、地点、氛围',
      required: true,
      aiService: ['gemini', 'claude'],
      timeout: 90000,
      retryCount: 2,
      dependencies: ['script_analysis']
    },
    {
      id: 'storyboard_generation',
      name: '分镜生成',
      description: '为每个场景生成分镜画面描述',
      required: true,
      aiService: ['claude'],
      timeout: 180000,
      retryCount: 3,
      dependencies: ['scene_breakdown', 'character_consistency_seeding']
    },
    {
      id: 'shot_type_design',
      name: '镜头类型设计',
      description: '设计每个分镜的镜头类型、角度、运动',
      required: false,
      aiService: ['claude'],
      timeout: 60000,
      retryCount: 2,
      dependencies: ['storyboard_generation']
    },
    {
      id: 'keyframe_design',
      name: '关键帧设计 (BigBanana方法)',
      description: '设计起始帧和结束帧，避免随机抽卡',
      required: true,
      aiService: ['claude', 'gemini'],
      timeout: 120000,
      retryCount: 3,
      dependencies: ['storyboard_generation']
    },
    {
      id: 'voice_script_preparation',
      name: '配音脚本准备',
      description: '准备配音台词，标注情感和语气',
      required: false,
      aiService: ['gemini'],
      timeout: 30000,
      retryCount: 2,
      dependencies: ['scene_breakdown']
    },
    {
      id: 'video_generation',
      name: '视频生成',
      description: '生成视频片段，使用关键帧驱动',
      required: true,
      aiService: ['seedance', 'kling'],
      timeout: 300000, // 5分钟
      retryCount: 3,
      dependencies: ['keyframe_design']
    },
    {
      id: 'post_processing',
      name: '后期处理',
      description: '视频剪辑、转场、音频合成',
      required: false,
      aiService: [], // 本地处理
      timeout: 180000,
      retryCount: 1,
      dependencies: ['video_generation']
    }
  ];

  constructor(aiManager: AiManager) {
    this.aiManager = aiManager;
  }

  /**
   * 执行完整的Hollywood流程
   */
  async executeHollywoodWorkflow(
    script: string,
    options: {
      projectId: string;
      scriptId: string;
      workflowType: 'short_drama' | 'animation' | 'commercial';
      enableVoice: boolean;
      enablePostProcessing: boolean;
    }
  ): Promise<WorkflowExecutionState> {
    const state: WorkflowExecutionState = {
      projectId: options.projectId,
      scriptId: options.scriptId,
      currentStep: 'script_analysis',
      status: 'running',
      progress: 0,
      results: {},
      errors: {},
      costEstimate: {
        provider: 'claude',
        model: 'claude-3-5-sonnet',
        estimatedTokens: 0,
        estimatedCost: 0,
        estimatedTime: 0,
        capabilities: []
      },
      startedAt: new Date()
    };

    try {
      // 1. 剧本分析
      state.currentStep = 'script_analysis';
      state.progress = 10;
      const scriptAnalysis = await this.executeScriptAnalysis(script);
      state.results.scriptAnalysis = scriptAnalysis;
      this.updateCostEstimate(state, 'script_analysis', 0.05); // 估算成本

      // 2. 角色提取
      state.currentStep = 'character_extraction';
      state.progress = 20;
      const characters = await this.extractCharacters(scriptAnalysis);
      state.results.characters = characters;

      // 3. 角色一致性种子
      state.currentStep = 'character_consistency_seeding';
      state.progress = 30;
      const characterSeeds = await this.generateCharacterSeeds(characters);
      state.results.characterSeeds = characterSeeds;

      // 4. 场景分解
      state.currentStep = 'scene_breakdown';
      state.progress = 40;
      const scenes = await this.breakdownScenes(scriptAnalysis);
      state.results.scenes = scenes;

      // 5. 分镜生成
      state.currentStep = 'storyboard_generation';
      state.progress = 50;
      const storyboards = await this.generateStoryboards(scenes, characters, characterSeeds);
      state.results.storyboards = storyboards;

      // 6. 关键帧设计 (BigBanana方法)
      state.currentStep = 'keyframe_design';
      state.progress = 60;
      const keyframes = await this.designKeyframes(storyboards);
      state.results.keyframes = keyframes;
      this.updateCostEstimate(state, 'keyframe_design', 0.15);

      // 7. 视频生成 (根据需要跳过)
      if (options.workflowType !== 'animation') {
        state.currentStep = 'video_generation';
        state.progress = 70;
        const videoClips = await this.generateVideoClips(keyframes);
        state.results.videoClips = videoClips;
        this.updateCostEstimate(state, 'video_generation', 2.0); // 视频生成成本较高
      }

      // 8. 配音 (可选)
      if (options.enableVoice) {
        state.currentStep = 'voice_script_preparation';
        state.progress = 80;
        const voiceScripts = await this.prepareVoiceScripts(scenes);
        state.results.voiceScripts = voiceScripts;
      }

      // 9. 后期处理 (可选)
      if (options.enablePostProcessing) {
        state.currentStep = 'post_processing';
        state.progress = 90;
        const finalVideo = await this.postProcessVideo(state.results);
        state.results.finalVideo = finalVideo;
      }

      state.currentStep = 'completed';
      state.status = 'completed';
      state.progress = 100;
      state.completedAt = new Date();

    } catch (error) {
      state.status = 'failed';
      state.errors[state.currentStep] = error instanceof Error ? error.message : String(error);
      console.error('Workflow execution failed:', error);
    }

    return state;
  }

  /**
   * 剧本智能分析 (借鉴waoowaoo的剧本分析流程)
   */
  private async executeScriptAnalysis(script: string): Promise<ScriptAnalysisResult> {
    const prompt = scriptPrompts.analyzeScript.template
      .replace('{script}', script)
      .replace('{format}', 'json');

    const request: GenerateRequest = {
      prompt,
      model: 'claude-3-5-sonnet-20241022',
      provider: 'claude',
      options: {
        temperature: 0.2,
        maxTokens: 4096,
        responseFormat: { type: 'json_object' }
      }
    };

    const response = await this.aiManager.generateText(request);

    if (!response.success || !response.data) {
      throw new Error(`Script analysis failed: ${response.error || 'Unknown error'}`);
    }

    try {
      return JSON.parse(response.data);
    } catch (error) {
      console.warn('Failed to parse script analysis JSON, trying to extract structured data');
      return this.extractScriptAnalysisFromText(response.data);
    }
  }

  /**
   * 从文本中提取结构化剧本分析结果
   */
  private extractScriptAnalysisFromText(text: string): ScriptAnalysisResult {
    // 简化版本，实际应该更复杂的解析逻辑
    const lines = text.split('\n');
    const characters: any[] = [];
    const scenes: any[] = [];
    let summary = '';
    let estimatedDuration = 0;

    for (const line of lines) {
      if (line.includes('角色') || line.includes('character')) {
        // 提取角色信息
      } else if (line.includes('场景') || line.includes('scene')) {
        // 提取场景信息
      } else if (line.includes('概要') || line.includes('summary')) {
        summary = line.split(':')[1]?.trim() || '';
      } else if (line.includes('时长') || line.includes('duration')) {
        const durationMatch = line.match(/\d+/);
        estimatedDuration = durationMatch ? parseInt(durationMatch[0]) : 60;
      }
    }

    return {
      summary: summary || '剧本分析完成',
      characters,
      scenes,
      emotions: [],
      themes: [],
      estimatedDuration: estimatedDuration || 60,
      complexity: 'medium' as const
    };
  }

  /**
   * 提取角色特征
   */
  private async extractCharacters(analysis: ScriptAnalysisResult): Promise<any[]> {
    const prompt = characterPrompts.extractFromScript.template
      .replace('{scriptAnalysis}', JSON.stringify(analysis, null, 2));

    const request: GenerateRequest = {
      prompt,
      model: 'claude-3-5-sonnet-20241022',
      provider: 'claude',
      options: {
        temperature: 0.3,
        maxTokens: 2048,
        responseFormat: { type: 'json_object' }
      }
    };

    const response = await this.aiManager.generateText(request);

    if (!response.success || !response.data) {
      throw new Error(`Character extraction failed: ${response.error || 'Unknown error'}`);
    }

    try {
      const result = JSON.parse(response.data);
      return Array.isArray(result.characters) ? result.characters : [];
    } catch {
      return analysis.characters || [];
    }
  }

  /**
   * 生成角色一致性种子 (Jellyfish方法)
   */
  private async generateCharacterSeeds(characters: any[]): Promise<Record<string, string>> {
    const seeds: Record<string, string> = {};
    
    for (const character of characters) {
      const prompt = characterPrompts.generateConsistencySeed.template
        .replace('{characterName}', character.name)
        .replace('{characterDescription}', character.description || '')
        .replace('{characterTraits}', Array.isArray(character.traits) ? character.traits.join(', ') : '');

      const request: GenerateRequest = {
        prompt,
        model: 'gemini-1.5-pro',
        provider: 'gemini',
        options: {
          temperature: 0.1, // 低温度确保一致性
          maxTokens: 100
        }
      };

      const response = await this.aiManager.generateText(request);
      
      if (response.success && response.data) {
        // 提取种子字符串（通常是简短的特征描述）
        const seed = response.data.trim().replace(/["']/g, '');
        seeds[character.name] = seed;
      } else {
        // 使用角色名和特征的哈希作为后备种子
        const fallbackSeed = `${character.name}-${character.traits?.[0] || 'default'}`;
        seeds[character.name] = fallbackSeed;
      }
    }

    return seeds;
  }

  /**
   * 场景分解
   */
  private async breakdownScenes(analysis: ScriptAnalysisResult): Promise<any[]> {
    const prompt = scenePrompts.breakdownScript.template
      .replace('{scriptAnalysis}', JSON.stringify(analysis, null, 2));

    const request: GenerateRequest = {
      prompt,
      model: 'gemini-1.5-pro',
      provider: 'gemini',
      options: {
        temperature: 0.2,
        maxTokens: 3072,
        responseFormat: { type: 'json_object' }
      }
    };

    const response = await this.aiManager.generateText(request);

    if (!response.success || !response.data) {
      throw new Error(`Scene breakdown failed: ${response.error || 'Unknown error'}`);
    }

    try {
      const result = JSON.parse(response.data);
      return Array.isArray(result.scenes) ? result.scenes : [];
    } catch {
      return analysis.scenes || [];
    }
  }

  /**
   * 生成分镜
   */
  private async generateStoryboards(
    scenes: any[], 
    characters: any[], 
    characterSeeds: Record<string, string>
  ): Promise<any[]> {
    const storyboards = [];

    for (const scene of scenes) {
      const prompt = scenePrompts.generateStoryboard.template
        .replace('{scene}', JSON.stringify(scene, null, 2))
        .replace('{characters}', JSON.stringify(characters, null, 2))
        .replace('{characterSeeds}', JSON.stringify(characterSeeds, null, 2));

      const request: GenerateRequest = {
        prompt,
        model: 'claude-3-5-sonnet-20241022',
        provider: 'claude',
        options: {
          temperature: 0.4,
          maxTokens: 1024
        }
      };

      const response = await this.aiManager.generateText(request);
      
      if (response.success && response.data) {
        try {
          const storyboard = JSON.parse(response.data);
          storyboard.sceneId = scene.id || scene.order;
          storyboards.push(storyboard);
        } catch {
          // 如果JSON解析失败，创建简单故事板
          storyboards.push({
            sceneId: scene.id || scene.order,
            description: response.data,
            characters: scene.characters || [],
            location: scene.location,
            shotType: 'medium',
            cameraAngle: 'eye-level'
          });
        }
      }
    }

    return storyboards;
  }

  /**
   * 设计关键帧 (BigBanana方法)
   */
  private async designKeyframes(storyboards: any[]): Promise<any[]> {
    const keyframes = [];

    for (const storyboard of storyboards) {
      const prompt = scenePrompts.designKeyframes.template
        .replace('{storyboard}', JSON.stringify(storyboard, null, 2));

      const request: GenerateRequest = {
        prompt,
        model: 'claude-3-5-sonnet-20241022',
        provider: 'claude',
        options: {
          temperature: 0.3,
          maxTokens: 1536,
          responseFormat: { type: 'json_object' }
        }
      };

      const response = await this.aiManager.generateText(request);
      
      if (response.success && response.data) {
        try {
          const keyframe = JSON.parse(response.data);
          keyframe.storyboardId = storyboard.sceneId;
          keyframes.push(keyframe);
        } catch {
          // 创建简单关键帧
          keyframes.push({
            storyboardId: storyboard.sceneId,
            startFrame: {
              description: storyboard.description,
              characters: storyboard.characters,
              composition: 'balanced'
            },
            endFrame: {
              description: `${storyboard.description} - 结束`,
              transition: 'fade'
            },
            duration: 5 // 默认5秒
          });
        }
      }
    }

    return keyframes;
  }

  /**
   * 生成视频片段
   */
  private async generateVideoClips(keyframes: any[]): Promise<any[]> {
    const videoClips = [];
    
    for (const keyframe of keyframes) {
      // 这里应该调用实际的视频生成服务
      // 使用Seedance或Kling API
      const videoGenerationParams = {
        startFrame: keyframe.startFrame,
        endFrame: keyframe.endFrame,
        duration: keyframe.duration || 5,
        resolution: '1080p',
        fps: 30,
        style: 'cinematic'
      };

      // 实际项目中这里会调用this.aiManager.generateVideo()
      // 现在模拟返回结果
      videoClips.push({
        keyframeId: keyframe.storyboardId,
        url: `https://example.com/video/${Date.now()}.mp4`,
        thumbnail: `https://example.com/thumbnail/${Date.now()}.jpg`,
        duration: videoGenerationParams.duration,
        status: 'generated'
      });
    }

    return videoClips;
  }

  /**
   * 准备配音脚本
   */
  private async prepareVoiceScripts(scenes: any[]): Promise<any[]> {
    const voiceScripts = [];
    
    for (const scene of scenes) {
      if (scene.dialogue) {
        voiceScripts.push({
          sceneId: scene.id || scene.order,
          dialogues: scene.dialogue,
          voiceStyle: 'professional',
          language: 'zh-CN'
        });
      }
    }

    return voiceScripts;
  }

  /**
   * 后期处理
   */
  private async postProcessVideo(results: Record<string, any>): Promise<any> {
    // 模拟后期处理
    return {
      finalVideoUrl: `https://example.com/final/${Date.now()}.mp4`,
      duration: 60,
      resolution: '1080p',
      hasAudio: results.voiceScripts?.length > 0,
      subtitleIncluded: true
    };
  }

  /**
   * 更新成本估算
   */
  private updateCostEstimate(
    state: WorkflowExecutionState, 
    stepId: string, 
    estimatedCost: number
  ): void {
    state.costEstimate.estimatedCost += estimatedCost;
    if (!state.costEstimate.breakdown) {
      state.costEstimate.breakdown = [];
    }
    state.costEstimate.breakdown.push({
      step: stepId,
      cost: estimatedCost,
      provider: this.getStepProvider(stepId),
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 获取步骤的AI提供商
   */
  private getStepProvider(stepId: string): string {
    const step = this.workflowSteps.find(s => s.id === stepId);
    return step?.aiService[0] || 'unknown';
  }

  /**
   * 获取工作流状态
   */
  getWorkflowStatus(workflowId: string): WorkflowExecutionState | null {
    // 实际项目中应该从数据库读取
    return null;
  }

  /**
   * 取消工作流
   */
  cancelWorkflow(workflowId: string): boolean {
    // 实际项目中应该更新数据库状态
    return true;
  }

  /**
   * 重新执行失败的步骤
   */
  async retryStep(workflowId: string, stepId: string): Promise<boolean> {
    try {
      // 获取工作流配置
      const workflow = await prisma.workflow.findUnique({
        where: { id: workflowId },
        include: {
          project: true,
        },
      });

      if (!workflow) {
        throw new Error('工作流不存在');
      }

      // 分析节点依赖关系
      const nodes = isJsonArray(workflow.nodes) ? workflow.nodes : [];
      const edges = isJsonArray(workflow.edges) ? workflow.edges : [];
      const workflowConfig = workflow.config as any;

      // 找到需要重跑的节点及其所有下游节点
      const nodesToRetry = new Set([stepId]);
      const downstreamNodes = new Set<string>();

      // 简单的DAG遍历(实际应用中应使用更高效的算法)
      const traverseDownstream = (nodeId: string) => {
        edges.forEach((edge: unknown) => {
          if (isJsonObject(edge) && typeof edge.source === 'string' && typeof edge.target === 'string') {
            if (edge.source === nodeId && !downstreamNodes.has(edge.target)) {
              downstreamNodes.add(edge.target);
              traverseDownstream(edge.target);
            }
          }
        });
      };

      traverseDownstream(stepId);
      downstreamNodes.forEach(id => nodesToRetry.add(id));

      // 为每个需要重跑的节点创建任务
      const { addWorkflowJob } = await import('../queue');

      const jobs: WorkflowJobData[] = Array.from(nodesToRetry).map(nodeId => {
        const node = nodes.find((n: any) => n.id === nodeId) as any;
        const stepType = node?.data?.type || nodeId;

        return {
          workflowId,
          projectId: workflow.projectId,
          step: stepType,
          config: {
            ...node?.data,
            script: workflowConfig?.script,
            nodes,
            edges,
          },
          priority: stepType === 'video-generation' ? 10 : 5,
          retryCount: 0,
        };
      });

      // 批量添加到队列
      await Promise.all(
        jobs.map(job => addWorkflowJob(job, { priority: job.priority }))
      );

      // 更新工作流状态
      await prisma.workflow.update({
        where: { id: workflowId },
        data: {
          status: 'ACTIVE',
          lastRunAt: new Date(),
        },
      });

      return true;
    } catch (error) {
      console.error('重试步骤失败:', error);
      throw error;
    }
  }
}

// 默认导出 HollywoodWorkflowEngine
export default HollywoodWorkflowEngine