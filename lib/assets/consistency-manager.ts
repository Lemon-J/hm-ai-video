// 角色一致性管理系统 (Jellyfish方法)
// 借鉴waoowaoo的角色一致性管理最佳实践

import { Character, Asset } from "@prisma/client";
import { prisma } from "@/lib/db";
import { AiManager } from "@/lib/ai/manager";
import { assetManagerPrompts } from "@/lib/prompts/professional-templates";
import { isJsonObject, getJsonProperty } from "@/lib/utils/json-types";

export interface CharacterConsistencySeed {
  characterId: string;
  globalSeed: string; // 全局一致性种子
  variantSeeds: string[]; // 变体种子
  visualFeatures: {
    facialFeatures: string[]; // 面部特征
    hairstyle: string; // 发型
    bodyType: string; // 体型
    posture: string; // 姿态习惯
    styleKeywords: string[]; // 风格关键词
  };
  colorPalette: {
    primary: string; // 主要颜色
    secondary: string; // 次要颜色
    accent: string; // 强调色
  };
  referenceEmbeddings: string[]; // 参考图像嵌入
  consistencyRules: {
    allowedVariations: string[]; // 允许的变化范围
    strictFeatures: string[]; // 必须保持的特征
    flexibleFeatures: string[]; // 可以灵活变化的特征
  };
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssetReusabilityScore {
  assetId: string;
  characterId?: string;
  reusabilityScore: number; // 0-100
  usageCount: number;
  successRate: number; // 0-1
  costEfficiency: number; // 0-1
  consistencyScore: number; // 0-1
  tags: string[];
  recommendedContexts: string[]; // 推荐使用场景
}

export class ConsistencyManager {
  private aiManager: AiManager;

  constructor(aiManager: AiManager) {
    this.aiManager = aiManager;
  }

  /**
   * 为角色生成全局一致性种子 (Jellyfish核心功能)
   */
  async generateCharacterSeed(character: Character): Promise<CharacterConsistencySeed> {
    const prompt = assetManagerPrompts.analyzeAssetReusability.template
      .replace("{assetType}", "character")
      .replace("{assetName}", character.name)
      .replace("{assetDescription}", character.description || "")
      .replace("{usageContext}", "跨多个场景的短剧视频生成")
      .replace("{generationHistory}", "新角色，无历史数据");

    const request = {
      prompt,
      model: "claude-3-5-sonnet-20241022",
      provider: "claude" as const,
      options: {
        temperature: 0.2,
        maxTokens: 2048,
        responseFormat: { type: "json_object" }
      }
    };

    const response = await this.aiManager.generateText(request);

    if (!response.success || !response.data) {
      throw new Error(`Failed to generate character seed: ${response.error}`);
    }

    const analysis = JSON.parse(response.data);

    // 生成全局种子描述
    const globalSeedPrompt = `
请为角色"${character.name}"生成一个全局一致性种子描述。

角色信息：
- 姓名：${character.name}
- 描述：${character.description || "暂无详细描述"}
- 特征：${character.traits?.join(", ") || "未知"}
- 外观：${character.appearance ? JSON.stringify(character.appearance) : "未知"}

生成要求：
1. 150-200字的详细描述
2. 包含核心视觉特征
3. 包含风格定位
4. 包含可重复使用的特征定义
5. 为AI图像生成优化的描述

请返回纯文本的种子描述。`;

    const seedResponse = await this.aiManager.generateText({
      prompt: globalSeedPrompt,
      model: "gemini-1.5-pro",
      provider: "gemini" as const,
      options: {
        temperature: 0.1,
        maxTokens: 300
      }
    });

    const globalSeed = seedResponse.success && seedResponse.data 
      ? seedResponse.data.trim()
      : `Character: ${character.name}, Traits: ${character.traits?.join(", ") || "general"}`;

    // 创建一致性种子记录
    const seed: CharacterConsistencySeed = {
      characterId: character.id,
      globalSeed,
      variantSeeds: [],
      visualFeatures: {
        facialFeatures: this.extractFacialFeatures(character),
        hairstyle: this.extractHairstyle(character),
        bodyType: this.extractBodyType(character),
        posture: "neutral",
        styleKeywords: this.extractStyleKeywords(character)
      },
      colorPalette: {
        primary: "#4f46e5", // 默认紫色
        secondary: "#64748b",
        accent: "#f59e0b"
      },
      referenceEmbeddings: [],
      consistencyRules: {
        allowedVariations: [
          "表情变化",
          "轻微角度变化",
          "服装变化",
          "环境光变化"
        ],
        strictFeatures: [
          "面部结构",
          "发型基本特征",
          "体型比例",
          "核心风格特征"
        ],
        flexibleFeatures: [
          "服装细节",
          "配饰",
          "背景环境",
          "光线强度"
        ]
      },
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // 保存到数据库
    await prisma.character.update({
      where: { id: character.id },
      data: {
        seed: globalSeed,
        appearance: isJsonObject(character.appearance)
          ? { ...character.appearance, consistencySeed: seed } as any
          : { consistencySeed: seed } as any
      }
    });

    return seed;
  }

  /**
   * 生成角色变体种子
   */
  async generateCharacterVariants(
    character: Character, 
    seed: CharacterConsistencySeed,
    context: {
      emotion?: string;
      sceneType?: string;
      timeOfDay?: string;
      style?: string;
    }
  ): Promise<string[]> {
    const prompt = assetManagerPrompts.generateAssetVariants.template
      .replace("{globalSeed}", seed.globalSeed)
      .replace("{assetType}", "character")
      .replace("{coreFeatures}", JSON.stringify(seed.visualFeatures))
      .replace("{consistencyBoundary}", JSON.stringify(seed.consistencyRules.allowedVariations));

    const request = {
      prompt,
      model: "claude-3-5-sonnet-20241022",
      provider: "claude" as const,
      options: {
        temperature: 0.4,
        maxTokens: 1024,
        responseFormat: { type: "json_object" }
      }
    };

    const response = await this.aiManager.generateText(request);

    if (!response.success || !response.data) {
      console.warn("Failed to generate character variants, using fallback seeds");
      return this.generateFallbackVariants(character, context);
    }

    const variants = JSON.parse(response.data);
    return variants.variants?.slice(0, 3) || [];
  }

  /**
   * 验证生成图像的一致性
   */
  async validateImageConsistency(
    imageUrl: string,
    character: Character,
    seed: CharacterConsistencySeed
  ): Promise<{
    isConsistent: boolean;
    confidence: number;
    issues: string[];
    suggestions: string[];
  }> {
    // 这里应该集成图像分析AI
    // 暂时模拟验证逻辑
    return {
      isConsistent: true,
      confidence: 0.85,
      issues: [],
      suggestions: []
    };
  }

  /**
   * 计算资产复用性得分
   */
  async calculateReusabilityScore(asset: Asset): Promise<AssetReusabilityScore> {
    const usageHistory = await prisma.asset.findUnique({
      where: { id: asset.id },
      include: {
        character: true,
        // 这里应该关联使用记录
      }
    });

    // 计算基础得分
    const baseScore = 50; // 基础分

    // 根据使用历史调整
    const usageBonus = Math.min(asset.usageCount * 2, 30); // 使用次数加分
    const successBonus = asset.isGlobal ? 20 : 0; // 全局资产加分
    const tagsBonus = asset.tags.length * 2; // 标签加分

    const totalScore = baseScore + usageBonus + successBonus + tagsBonus;

    return {
      assetId: asset.id,
      characterId: asset.characterId || undefined,
      reusabilityScore: Math.min(totalScore, 100),
      usageCount: asset.usageCount,
      successRate: 0.85, // 假设成功率
      costEfficiency: 0.7, // 成本效率
      consistencyScore: 0.8, // 一致性得分
      tags: asset.tags,
      recommendedContexts: this.suggestUsageContexts(asset)
    };
  }

  /**
   * 管理全局资产库
   */
  async manageGlobalAssetLibrary() {
    // 获取所有全局资产
    const globalAssets = await prisma.asset.findMany({
      where: { isGlobal: true },
      include: { character: true },
      orderBy: { usageCount: "desc" }
    });

    // 计算并更新复用性得分
    for (const asset of globalAssets) {
      const score = await this.calculateReusabilityScore(asset);
      // TODO: 需要在 Asset 模型中添加 metadata 字段来存储复用性得分
      // await prisma.asset.update({
      //   where: { id: asset.id },
      //   data: {
      //     metadata: isJsonObject(asset.metadata)
      //       ? { ...asset.metadata, reusabilityScore: score }
      //       : { reusabilityScore: score }
      //   }
      // });
    }

    return {
      totalAssets: globalAssets.length,
      averageScore: globalAssets.length > 0 
        ? globalAssets.reduce((sum, a) => sum + (a.usageCount || 0), 0) / globalAssets.length 
        : 0,
      topAssets: globalAssets.slice(0, 10)
    };
  }

  /**
   * 为场景推荐资产
   */
  async recommendAssetsForScene(scene: any): Promise<{
    characters: Character[];
    backgrounds: Asset[];
    props: Asset[];
  }> {
    // 提取场景关键词
    const sceneKeywords = this.extractSceneKeywords(scene);
    
    // 匹配角色
    const characterCandidates = await prisma.character.findMany({
      where: {
        OR: [
          { tags: { hasSome: sceneKeywords } },
          { description: { contains: sceneKeywords[0] } }
        ]
      },
      take: 5
    });

    // 匹配背景资产
    const backgroundCandidates = await prisma.asset.findMany({
      where: {
        type: "IMAGE",
        category: "BACKGROUND",
        tags: { hasSome: sceneKeywords },
        OR: [
          { isGlobal: true },
          { projectId: scene.projectId }
        ]
      },
      take: 3
    });

    // 匹配道具资产
    const propCandidates = await prisma.asset.findMany({
      where: {
        type: "IMAGE",
        category: "PROP",
        tags: { hasSome: sceneKeywords },
        OR: [
          { isGlobal: true },
          { projectId: scene.projectId }
        ]
      },
      take: 5
    });

    return {
      characters: characterCandidates,
      backgrounds: backgroundCandidates,
      props: propCandidates
    };
  }

  /**
   * 创建资产复用报告
   */
  async generateAssetReuseReport(projectId: string): Promise<{
    summary: any;
    characterReuse: any[];
    costSavings: number;
    recommendations: string[];
  }> {
    const projectAssets = await prisma.asset.findMany({
      where: { projectId },
      include: { character: true }
    });

    const reusedAssets = projectAssets.filter(asset => asset.usageCount > 1);
    const uniqueAssets = projectAssets.filter(asset => asset.usageCount === 1);

    // 计算成本节省（假设每次复用节省0.5美元）
    const estimatedCostSavings = reusedAssets.reduce((sum, asset) => {
      return sum + (asset.usageCount - 1) * 0.5;
    }, 0);

    // 分析角色复用情况
    const characterReuse = await Promise.all(
      projectAssets
        .filter(asset => asset.characterId)
        .map(async asset => {
          const character = asset.character;
          const allCharacterAssets = await prisma.asset.findMany({
            where: { characterId: asset.characterId }
          });
          
          return {
            characterName: character?.name,
            assetCount: allCharacterAssets.length,
            reuseCount: allCharacterAssets.filter(a => a.usageCount > 1).length,
            consistencyScore: 0.8 // 需要实际计算
          };
        })
    );

    return {
      summary: {
        totalAssets: projectAssets.length,
        reusedAssets: reusedAssets.length,
        reuseRate: projectAssets.length > 0 ? reusedAssets.length / projectAssets.length : 0,
        uniqueAssets: uniqueAssets.length
      },
      characterReuse,
      costSavings: estimatedCostSavings,
      recommendations: this.generateReuseRecommendations(reusedAssets, uniqueAssets)
    };
  }

  // ====================== 私有方法 ======================

  private extractFacialFeatures(character: Character): string[] {
    // 从角色描述中提取面部特征
    const description = character.description || "";
    const appearance = isJsonObject(character.appearance) ? character.appearance : {};
    
    const features: string[] = [];
    
    if (description.includes("眼睛") || description.includes("eye")) {
      features.push(description.match(/眼睛[：:]([^，。]+)/)?.[1] || "标准眼型");
    }
    
    if (description.includes("鼻子") || description.includes("nose")) {
      features.push(description.match(/鼻子[：:]([^，。]+)/)?.[1] || "标准鼻型");
    }
    
    if (description.includes("嘴巴") || description.includes("mouth")) {
      features.push(description.match(/嘴巴[：:]([^，。]+)/)?.[1] || "标准嘴型");
    }

    if (appearance?.facialFeatures && Array.isArray(appearance.facialFeatures)) {
      features.push(...appearance.facialFeatures.filter((f): f is string => typeof f === 'string'));
    }
    
    return features.length > 0 ? features : ["标准面部特征"];
  }

  private extractHairstyle(character: Character): string {
    const description = character.description || "";
    const appearance = isJsonObject(character.appearance) ? character.appearance : {};
    
    const hairMatch = description.match(/发型[：:]([^，。]+)/);
    if (hairMatch) return hairMatch[1];

    if (appearance?.hairstyle && typeof appearance.hairstyle === 'string') return appearance.hairstyle;

    return "标准发型";
  }

  private extractBodyType(character: Character): string {
    const description = character.description || "";
    const appearance = isJsonObject(character.appearance) ? character.appearance : {};
    
    const bodyMatch = description.match(/身材[：:]([^，。]+)/);
    if (bodyMatch) return bodyMatch[1];

    if (appearance?.bodyType && typeof appearance.bodyType === 'string') return appearance.bodyType;

    return "标准体型";
  }

  private extractStyleKeywords(character: Character): string[] {
    const description = character.description || "";
    const traits = character.traits || [];
    const appearance = isJsonObject(character.appearance) ? character.appearance : {};
    
    const keywords: string[] = [];
    
    // 从性格特征推断风格
    if (traits.includes("优雅") || traits.includes("elegant")) keywords.push("优雅");
    if (traits.includes("活泼") || traits.includes("lively")) keywords.push("活泼");
    if (traits.includes("严肃") || traits.includes("serious")) keywords.push("严肃");
    if (traits.includes("时尚") || traits.includes("fashionable")) keywords.push("时尚");
    
    // 从描述中提取
    if (description.includes("现代")) keywords.push("现代");
    if (description.includes("复古")) keywords.push("复古");
    if (description.includes("职业")) keywords.push("职业");
    if (description.includes("休闲")) keywords.push("休闲");

    // 从外观中提取
    if (appearance?.styleKeywords && Array.isArray(appearance.styleKeywords)) {
      keywords.push(...appearance.styleKeywords.filter((k): k is string => typeof k === 'string'));
    }

    return keywords.length > 0 ? keywords : ["通用风格"];
  }

  private generateFallbackVariants(
    character: Character, 
    context: any
  ): string[] {
    const baseSeed = `Character: ${character.name}`;
    
    const variants = [
      `${baseSeed}, 开心表情, 正面角度`,
      `${baseSeed}, 严肃表情, 侧面角度`,
      `${baseSeed}, ${context.emotion || "中性"}表情, 3/4角度`
    ];
    
    if (context.sceneType) {
      variants.push(`${baseSeed}, ${context.sceneType}场景适配`);
    }
    
    if (context.timeOfDay) {
      variants.push(`${baseSeed}, ${context.timeOfDay}光线`);
    }
    
    return variants;
  }

  private suggestUsageContexts(asset: Asset): string[] {
    const contexts: string[] = [];
    
    // 根据资产类型推荐场景
    switch (asset.category) {
      case "CHARACTER":
        contexts.push("角色近景", "对话场景", "情感特写");
        break;
      case "SCENE":
        contexts.push("背景环境", "场景过渡", "氛围营造");
        break;
      case "BACKGROUND":
        contexts.push("远景背景", "环境展示", "场景设定");
        break;
      case "PROP":
        contexts.push("道具特写", "场景细节", "叙事元素");
        break;
      default:
        contexts.push("通用场景");
    }
    
    // 根据标签添加更多推荐
    if (asset.tags.includes("室内")) contexts.push("室内场景");
    if (asset.tags.includes("室外")) contexts.push("室外场景");
    if (asset.tags.includes("现代")) contexts.push("现代场景");
    if (asset.tags.includes("复古")) contexts.push("复古场景");
    
    return Array.from(new Set(contexts)); // 去重
  }

  private extractSceneKeywords(scene: any): string[] {
    const keywords: string[] = [];
    
    if (scene.location) keywords.push(scene.location);
    if (scene.timeOfDay) keywords.push(scene.timeOfDay);
    if (scene.mood) keywords.push(scene.mood);
    
    // 从描述中提取关键词
    const description = scene.description || "";
    const commonKeywords = ["室内", "室外", "城市", "乡村", "现代", "古代", "白天", "夜晚", "雨天", "晴天"];
    
    commonKeywords.forEach(keyword => {
      if (description.includes(keyword)) {
        keywords.push(keyword);
      }
    });
    
    return Array.from(new Set(keywords));
  }

  private generateReuseRecommendations(reusedAssets: Asset[], uniqueAssets: Asset[]): string[] {
    const recommendations: string[] = [];
    
    if (reusedAssets.length / (reusedAssets.length + uniqueAssets.length) < 0.3) {
      recommendations.push("建议提高资产复用率，可以通过创建模板和建立资产库来实现");
    }
    
    if (uniqueAssets.length > 10) {
      recommendations.push("检测到较多一次性资产，建议审查是否可转化为可复用资产");
    }
    
    const highValueAssets = reusedAssets.filter(asset => asset.usageCount > 3);
    if (highValueAssets.length > 0) {
      recommendations.push(`发现${highValueAssets.length}个高复用资产，建议标记为重点资产`);
    }
    
    // 检查是否有未标记为全局的常用资产
    const potentialGlobalAssets = reusedAssets.filter(asset => !asset.isGlobal && asset.usageCount >= 2);
    if (potentialGlobalAssets.length > 0) {
      recommendations.push(`有${potentialGlobalAssets.length}个常用资产未标记为全局资产，建议审查`);
    }
    
    return recommendations;
  }
}