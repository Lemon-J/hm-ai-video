// 专业的AI短剧生成Prompt模板库
// 借鉴waoowaoo Hollywood流程和Jellyfish资产复用方法
// 提供更加专业和细化的Prompt模板

import { AiRequestType } from "@prisma/client";

// 基础角色设定模板 (借鉴waoowaoo选角指导)
export const castingDirectorPrompts = {
  extractCharacterProfiles: {
    name: "提取角色档案",
    description: "从剧本中提取所有角色的详细档案信息",
    type: AiRequestType.CHARACTER_DESIGN,
    template: `你是一位专业的"选角指导"。请基于提供的文本（小说、剧本或混合格式），分析并输出所有需要制作形象的角色档案信息。

【文本内容】
{script}

【输出要求】
请以JSON格式返回，每个角色包含以下字段：
- name: 角色姓名（必填）
- description: 角色详细描述（200-500字）
- importance: 重要性等级（main/supporting/background）
- gender: 性别（male/female/other/unknown）
- ageRange: 年龄范围（如"25-30岁"）
- personalityTraits: 性格特征数组（至少3个，如["勇敢", "幽默", "冲动"]）
- keyAppearance: 关键外观特征（至少5个，如["短发", "眼镜", "职业装", "自信姿态", "微笑"]）
- styleKeywords: 风格关键词数组（如["现代", "商务", "休闲", "复古"]）
- emotionalRange: 情感表现范围数组（如["愤怒", "悲伤", "喜悦", "惊讶"]）
- voiceStyle: 配音风格建议（如"沉稳有力"、"轻快活泼"、"成熟稳重"）
- consistencySeeds: 一致性种子建议（用于保持角色视觉一致性）
- referenceImages: 参考图片描述（如"类似演员XXX的形象"）

【分析重点】
1. 角色的核心性格和成长弧线
2. 与其他角色的关系动态
3. 角色的视觉特征和服装变化
4. 角色的情感表达方式
5. 适合的视频化表现手法

返回格式：
{
  "characters": [
    {
      "name": "角色名",
      "description": "...",
      "importance": "main",
      ...
    }
  ],
  "summary": "角色分析总结（100字以内）",
  "recommendations": "选角建议（如"需要多个年龄段的演员"等）"
}`,
    variables: {
      script: "剧本或小说文本"
    },
    aiProviderPreference: ["claude", "gemini"],
    temperature: 0.3,
    maxTokens: 4096
  },

  generateConsistencySeed: {
    name: "生成角色一致性种子",
    description: "为角色生成确保视觉一致性的种子描述",
    type: AiRequestType.CHARACTER_DESIGN,
    template: `你是一位专业的"角色设计师"。请为以下角色生成一个详细的"视觉一致性种子"描述。

【角色信息】
名称：{characterName}
描述：{characterDescription}
性格特征：{personalityTraits}
关键外观：{keyAppearance}

【任务要求】
请生成一个150-300字的描述，包含：
1. 核心视觉特征（面部特征、发型、身材等）
2. 风格定位（服装风格、色彩倾向、材质质感）
3. 表情特征（典型表情、眼神特点、姿态习惯）
4. 动态特征（动作特点、肢体语言、移动方式）
5. 独特标识（最具辨识度的视觉元素）

【一致性要求】
- 描述要具体、可视觉化
- 使用专业的美术术语
- 确保描述在不同场景下可保持一致
- 提供风格参考（如"类似XXX作品中的角色风格"）

【输出格式】
请返回一个JSON对象：
{
  "seedDescription": "详细的种子描述文字",
  "styleReference": ["参考作品1", "参考作品2"],
  "keyVisualElements": ["元素1", "元素2", "元素3"],
  "colorPalette": {
    "primary": "主要颜色",
    "secondary": "次要颜色",
    "accent": "强调颜色"
  },
  "artDirection": "美术方向建议（如"日式动画风格"、"写实电影感"）"
}`,
    variables: {
      characterName: "角色姓名",
      characterDescription: "角色描述",
      personalityTraits: "性格特征数组",
      keyAppearance: "关键外观特征"
    },
    aiProviderPreference: ["claude"],
    temperature: 0.2,
    maxTokens: 1024
  }
};

// 分镜生成模板 (Hollywood标准流程)
export const storyboardDirectorPrompts = {
  generateStoryboardPanels: {
    name: "生成分镜画面",
    description: "基于场景描述生成详细的分镜画面描述",
    type: AiRequestType.SCENE_GENERATION,
    template: `你是一位专业的"分镜艺术家"。请基于以下场景信息，生成详细的分镜画面描述。

【场景信息】
场景标题：{sceneTitle}
场景描述：{sceneDescription}
地点：{location}
时间：{timeOfDay}
氛围：{mood}
涉及角色：{characters}
对话内容：{dialogue}
关键动作：{keyActions}

【分镜要求】
请为这个场景生成3-5个分镜画面，每个画面包含：

【画面1】
1. 画面编号：Panel 1
2. 镜头类型：{shotType}（如"extreme close-up", "medium shot", "long shot"）
3. 构图描述：{composition}（详细描述画面中的元素布局）
4. 角色状态：{characterState}（角色在画面中的位置、姿态、表情）
5. 摄像机角度：{cameraAngle}（如"eye-level", "high angle", "low angle"）
6. 摄像机运动：{cameraMovement}（如"static", "pan left", "zoom in"）
7. 灯光氛围：{lighting}（如"soft morning light", "dramatic shadows"）
8. 色彩氛围：{colorPalette}（描述主导色调和色彩情绪）
9. 焦点引导：{focusGuide}（观众视线应该关注哪里）
10. 视觉叙事：{visualStorytelling}（这个画面如何推进故事）

【画面2】...（继续其他画面）

【技术参数】
- 每个画面时长：{durationPerPanel}秒
- 画面间过渡：{transitions}（如"cut", "fade", "dissolve"）
- 配乐建议：{musicSuggestions}（如"紧张弦乐"、"轻快钢琴"）
- 音效建议：{soundEffects}（如"脚步声"、"开门声"）

【风格参考】
请参考{styleReference}的风格进行创作。

【输出格式】
请以JSON数组格式返回所有分镜画面。`,
    variables: {
      sceneTitle: "场景标题",
      sceneDescription: "场景描述",
      location: "地点",
      timeOfDay: "时间",
      mood: "氛围",
      characters: "角色列表",
      dialogue: "对话内容",
      keyActions: "关键动作",
      shotType: "镜头类型选项",
      styleReference: "风格参考（如'Hollywood电影风格'）"
    },
    aiProviderPreference: ["claude"],
    temperature: 0.4,
    maxTokens: 3072
  },

  designCinematography: {
    name: "设计电影摄影方案",
    description: "为分镜设计专业的电影摄影方案",
    type: AiRequestType.SCENE_GENERATION,
    template: `你是一位专业的"电影摄影师"。请为以下分镜画面设计详细的摄影方案。

【分镜画面】
画面描述：{panelDescription}
场景氛围：{sceneMood}
故事目的：{storyPurpose}
情感目标：{emotionalGoal}

【摄影方案要求】
请设计完整的摄影方案，包括：

【摄像机设置】
1. 镜头选择：{lensChoice}（如"35mm prime", "50mm anamorphic"）
2. 光圈：{aperture}（如"f/2.8", "f/8"）
3. 快门速度：{shutterSpeed}
4. ISO：{iso}
5. 白平衡：{whiteBalance}
6. 景深效果：{depthOfField}（如"浅景深突出主体"）

【灯光设计】
1. 主光：{keyLight}（类型、位置、强度）
2. 补光：{fillLight}（柔化阴影）
3. 背光：{backLight}（分离主体和背景）
4. 环境光：{ambientLight}（整体氛围）
5. 特效光：{specialLighting}（如有）

【运动设计】
1. 摄像机运动：{cameraMovement}（轨道、摇臂、手持）
2. 演员走位：{actorBlocking}（演员在画面中的移动）
3. 焦点转移：{focusPulling}（焦点变化的节奏）

【视觉风格】
1. 色彩分级：{colorGrading}（描述最终的色彩风格）
2. 画面比例：{aspectRatio}（如"2.39:1"、"16:9"）
3. 视觉特效：{visualEffects}（如有）
4. 滤镜建议：{filterSuggestions}（如"pro mist 1/4"）

【技术挑战】
列出可能的技术挑战和解决方案。

【预算考虑】
考虑拍摄成本和可行性。

【输出格式】
请以JSON格式返回完整的摄影方案。`,
    variables: {
      panelDescription: "分镜画面描述",
      sceneMood: "场景氛围",
      storyPurpose: "故事目的",
      emotionalGoal: "情感目标"
    },
    aiProviderPreference: ["gemini"],
    temperature: 0.3,
    maxTokens: 2048
  }
};

// 视频生成模板 (BigBanana首尾帧驱动)
export const videoDirectorPrompts = {
  designKeyframeAnimation: {
    name: "设计关键帧动画",
    description: "使用BigBanana方法设计起始帧和结束帧",
    type: AiRequestType.VIDEO_GENERATION,
    template: `你是一位专业的"动画导演"。请使用BigBanana方法（首尾帧驱动）为以下分镜设计关键帧动画。

【分镜信息】
画面描述：{panelDescription}
画面时长：{duration}秒
动画风格：{animationStyle}
情感表达：{emotion}

【BigBanana方法要求】
1. **起始帧设计** (Frame A):
   - 完整描述起始画面的所有细节
   - 包括角色位置、表情、姿态
   - 环境元素的状态
   - 灯光和色彩设置
   - 构图和视角

2. **结束帧设计** (Frame B):
   - 完整描述结束画面的所有细节
   - 展示画面中的所有变化
   - 角色状态的演变
   - 环境的变化
   - 情感的表达结果

3. **中间帧指导**:
   - 描述从Frame A到Frame B的主要变化轨迹
   - 关键的运动路径
   - 时间节奏分配（加速/减速）
   - 次要元素的动画建议

4. **动画参数**:
   - 帧率：{fps}
   - 缓动函数：{easingFunction}
   - 运动模糊：{motionBlur}
   - 特效建议：{specialEffects}

【一致性保证】
- 确保角色视觉一致性（使用提供的种子：{characterSeed}）
- 保持场景一致性（使用提供的场景描述：{sceneDescription}）
- 确保动画符合物理规律

【创意空间】
在保证一致性的前提下，可以发挥创意：
- 添加有意义的细节动画
- 设计巧妙的镜头运动
- 创造独特的情感表达方式

【技术约束】
考虑以下技术约束：
- 视频生成模型的限制
- 计算资源限制
- 生成时间的限制

【输出格式】
请以JSON格式返回完整的关键帧设计方案。`,
    variables: {
      panelDescription: "分镜画面描述",
      duration: "画面时长",
      animationStyle: "动画风格",
      emotion: "情感表达",
      characterSeed: "角色一致性种子",
      sceneDescription: "场景描述",
      fps: "帧率（如30）"
    },
    aiProviderPreference: ["claude", "gemini"],
    temperature: 0.35,
    maxTokens: 2560
  },

  generateVideoPrompt: {
    name: "生成视频生成提示词",
    description: "为视频生成AI模型生成优化的提示词",
    type: AiRequestType.VIDEO_GENERATION,
    template: `你是一位专业的"视频生成提示词工程师"。请为以下关键帧设计生成优化的视频生成提示词。

【关键帧设计】
起始帧：{startFrame}
结束帧：{endFrame}
动画要求：{animationRequirements}
风格参考：{styleReference}

【提示词生成原则】
1. **结构化提示**：
   - 主体描述（清晰、具体）
   - 动作描述（准确、可执行）
   - 场景描述（详细、一致）
   - 风格描述（明确、可参考）
   - 技术参数（分辨率、帧率、时长）

2. **优化技巧**：
   - 使用具体的专业术语
   - 避免歧义和模糊描述
   - 包含负面提示词（不要什么）
   - 使用权重标记（如"::1.2"）
   - 分层描述（从主体到细节）

3. **模型适配**：
   - 针对{aiProvider}模型优化
   - 考虑模型的具体能力和限制
   - 使用模型偏好的格式和术语

【生成要求】
请生成3个不同侧重点的提示词变体：

【变体1】注重视觉保真度
- 强调细节和准确性
- 使用具体的视觉描述
- 确保角色和场景一致性

【变体2】注重艺术表现力
- 强调风格和情绪表达
- 使用富有感染力的语言
- 创造独特的视觉效果

【变体3】注重技术可行性
- 考虑生成限制和成功率
- 使用简单清晰的描述
- 优化生成时间和成本

【输出格式】
请以JSON格式返回所有提示词变体。`,
    variables: {
      startFrame: "起始帧描述",
      endFrame: "结束帧描述",
      animationRequirements: "动画要求",
      styleReference: "风格参考",
      aiProvider: "AI提供商（如'seedance'、'kling'）"
    },
    aiProviderPreference: ["gemini"],
    temperature: 0.4,
    maxTokens: 1536
  }
};

// 资产库管理模板 (Jellyfish方法)
export const assetManagerPrompts = {
  analyzeAssetReusability: {
    name: "分析资产可复用性",
    description: "分析角色、场景等资产的复用潜力和一致性",
    type: AiRequestType.IMAGE_GENERATION,
    template: `你是一位专业的"资产管理师"。请分析以下资产的复用潜力和一致性需求。

【资产信息】
资产类型：{assetType}（character/scene/prop/background）
资产名称：{assetName}
资产描述：{assetDescription}
使用场景：{usageContext}
生成历史：{generationHistory}

【复用分析要求】
1. **一致性分析**：
   - 视觉特征的一致性要求
   - 风格的一致性要求
   - 细节的一致性要求
   - 变化允许范围

2. **复用潜力评估**：
   - 在不同场景下的适用性
   - 在不同情感状态下的表现
   - 在不同时间/地点的适应性
   - 扩展性（不同角度、表情、动作）

3. **种子管理建议**：
   - 核心种子定义
   - 变体种子建议
   - 一致性控制参数
   - 质量保证检查点

4. **优化建议**：
   - 如何提高复用率
   - 如何降低生成成本
   - 如何提高生成质量
   - 如何管理版本变更

【Jellyfish方法】
采用Jellyfish的全局种子管理方法：
- 为每个资产定义唯一的"全局种子"
- 记录每次使用的"上下文种子"
- 维护"种子关系图谱"
- 实施"种子验证机制"

【输出格式】
请以JSON格式返回完整的分析报告。`,
    variables: {
      assetType: "资产类型",
      assetName: "资产名称",
      assetDescription: "资产描述",
      usageContext: "使用场景",
      generationHistory: "生成历史"
    },
    aiProviderPreference: ["claude"],
    temperature: 0.25,
    maxTokens: 2048
  },

  generateAssetVariants: {
    name: "生成资产变体",
    description: "基于种子生成资产的合理变体",
    type: AiRequestType.IMAGE_GENERATION,
    template: `你是一位专业的"资产变体设计师"。请基于以下种子信息，生成资产的合理变体描述。

【资产种子】
全局种子：{globalSeed}
资产类型：{assetType}
核心特征：{coreFeatures}
一致性边界：{consistencyBoundary}

【变体生成要求】
请生成以下类型的变体：

【情绪变体】 (3个)
- 不同情感状态下的表现
- 保持核心特征不变
- 调整表情、姿态、氛围

【场景变体】 (3个)
- 不同环境下的表现
- 保持角色/物体特征不变
- 调整背景、灯光、视角

【时间变体】 (3个)
- 不同时间点的表现
- 保持连续性
- 显示合理的变化

【风格变体】 (3个)
- 不同艺术风格的表现
- 保持可识别性
- 适应不同视觉风格

【变体设计原则】
1. 在一致性边界内创新
2. 确保变体之间的逻辑关系
3. 考虑实际生成的技术限制
4. 平衡创意和实用性

【种子管理】
记录每个变体的"衍生种子"，形成种子树：
- 父种子：{globalSeed}
- 子种子：变体特定的参数
- 种子关系：继承和变化的关系

【输出格式】
请以JSON格式返回所有变体描述。`,
    variables: {
      globalSeed: "全局种子描述",
      assetType: "资产类型",
      coreFeatures: "核心特征",
      consistencyBoundary: "一致性边界"
    },
    aiProviderPreference: ["gemini", "claude"],
    temperature: 0.5,
    maxTokens: 3072
  }
};

// 语音合成模板
export const voiceDirectorPrompts = {
  generateVoiceScript: {
    name: "生成配音脚本",
    description: "为对话生成专业的配音脚本和表演指导",
    type: AiRequestType.VOICE_SYNTHESIS,
    template: `你是一位专业的"配音导演"。请为以下对话生成详细的配音脚本和表演指导。

【对话内容】
{conversationText}
说话者：{speakers}
场景氛围：{sceneMood}
情感状态：{emotionalState}

【配音脚本要求】
请为每个对话行生成：

【说话者】{speakerName}
1. **台词文本**：{dialogueText}
2. **情感表达**：{emotion}（具体描述情感状态）
3. **语气语调**：{tone}（如"愤怒但克制"、"温柔中带着忧伤"）
4. **节奏控制**：{pace}（语速快慢、停顿位置、重音单词）
5. **音色调整**：{voiceQuality}（如"明亮清澈"、"低沉沙哑"）
6. **呼吸控制**：{breathing}（呼吸声的位置和强度）
7. **口腔动作**：{mouthMovement}（发音特点、口型变化）
8. **表演提示**：{actingNotes}（角色此刻的心理活动、潜台词）

【技术参数】
1. 音量水平：{volumeLevel}（0-100）
2. 音高范围：{pitchRange}（最低-最高）
3. 共振峰：{formants}（如"温暖"、"清脆"）
4. 效果处理：{effects}（如"轻微回声"、"电话音效"）
5. 混音建议：{mixingSuggestions}（相对于背景音的音量平衡）

【多角色处理】
如果涉及多个角色：
- 区分每个角色的声音特点
- 确保对话的自然节奏
- 处理重叠对话（如有）
- 保持情感的一致性

【语言处理】
语言：{language}
方言/口音：{dialect}
文化适应：{culturalAdaptation}

【输出格式】
请以JSON格式返回完整的配音脚本。`,
    variables: {
      conversationText: "对话文本",
      speakers: "说话者列表",
      sceneMood: "场景氛围",
      emotionalState: "情感状态",
      language: "语言（如'zh-CN'）"
    },
    aiProviderPreference: ["claude"],
    temperature: 0.4,
    maxTokens: 2048
  }
};

// 所有模板的分类索引
export const promptCatalog = {
  castingDirector: castingDirectorPrompts,
  storyboardDirector: storyboardDirectorPrompts,
  videoDirector: videoDirectorPrompts,
  assetManager: assetManagerPrompts,
  voiceDirector: voiceDirectorPrompts,
};

// 根据任务类型获取模板
export function getPromptTemplate(
  taskType: AiRequestType,
  provider?: string
): { template: string; config: any } | null {
  const catalogs = [
    castingDirectorPrompts,
    storyboardDirectorPrompts,
    videoDirectorPrompts,
    assetManagerPrompts,
    voiceDirectorPrompts,
  ];

  for (const catalog of catalogs) {
    for (const [key, prompt] of Object.entries(catalog)) {
      if (prompt.type === taskType) {
        // 如果指定了提供商，检查偏好
        if (provider && prompt.aiProviderPreference) {
          if (prompt.aiProviderPreference.includes(provider)) {
            return { template: prompt.template, config: prompt };
          }
        } else {
          return { template: prompt.template, config: prompt };
        }
      }
    }
  }

  return null;
}

// 模板使用统计
export const templateUsageStats = {
  castingDirector: { used: 0, success: 0, averageTokens: 0 },
  storyboardDirector: { used: 0, success: 0, averageTokens: 0 },
  videoDirector: { used: 0, success: 0, averageTokens: 0 },
  assetManager: { used: 0, success: 0, averageTokens: 0 },
  voiceDirector: { used: 0, success: 0, averageTokens: 0 },
};