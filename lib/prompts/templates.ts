// AI短剧生成Prompt模板库
// 参考：waoowaoo（Hollywood流程）、Jellyfish（资产复用）、BigBanana（首尾帧驱动）

// ======================
// 剧本相关Prompt模板
// ======================

export const scriptPrompts = {
  // 剧本生成
  generateScript: {
    name: "生成完整剧本",
    description: "生成完整的短剧剧本，包含角色、对话、场景描述",
    template: `请创作一个{genre}风格的短剧剧本，具体要求如下：

主题：{theme}
目标受众：{audience}
时长：{duration}分钟
主要角色数量：{characterCount}

剧本要求：
1. 包含完整的起承转合结构
2. 每个场景有明确的场景描述（地点、时间、氛围）
3. 角色对话自然，符合人物性格
4. 包含情感转折和高潮部分
5. 适合视频化呈现

请按照以下格式返回：
标题：[剧本标题]
概要：[50-100字的剧情概要]

角色介绍：
1. [角色名] - [角色描述]，性格：[性格特征]
...

场景列表：
场景1：[场景标题]
- 地点：[具体地点]
- 时间：[白天/夜晚/黄昏等]
- 氛围：[紧张/温馨/悬疑等]
- 描述：[场景详细描述]
- 对话：[角色对话内容]

[继续其他场景...]

结尾：[剧本的结尾描述]`,
    variables: {
      genre: ["爱情", "悬疑", "科幻", "喜剧", "恐怖", "奇幻", "现实", "历史"],
      theme: "输入剧本主题",
      audience: ["青少年", "成年人", "家庭观众", "专业人士"],
      duration: "5-15",
      characterCount: "2-5",
    },
    tags: ["剧本生成", "创意写作", "短剧"],
  },

  // 剧本分析
  analyzeScript: {
    name: "分析剧本结构",
    description: "分析剧本的结构、角色、情感变化",
    template: `请分析以下剧本，提供详细的结构化分析：

{script}

分析要求：
1. 总结剧本概要（50-100字）
2. 提取所有角色，包括：
   - 名称
   - 角色类型（主角/反派/配角/背景）
   - 性格特征（3-5个关键词）
   - 重要性评分（0-1）
   - 对话数量
3. 分析所有场景，包括：
   - 场景ID
   - 场景描述
   - 地点
   - 时间（白天/夜晚）
   - 氛围
   - 涉及角色
   - 预计时长（秒）
   - 关键时刻
4. 分析情感变化：
   - 每个场景的主导情感
   - 情感强度（0-1）
   - 情感过渡
5. 提取主要主题（3-5个）
6. 估算总时长和复杂度（low/medium/high）

请以JSON格式返回分析结果。`,
    variables: {
      script: "粘贴剧本内容",
    },
    tags: ["剧本分析", "结构化分析", "角色提取"],
  },

  // 剧本优化
  optimizeScript: {
    name: "优化剧本",
    description: "优化剧本的节奏、对话和视频化表现",
    template: `请优化以下剧本，使其更适合视频化呈现：

{script}

优化要求：
1. 调整节奏，确保每30秒有视觉亮点
2. 优化对话，使其更自然、更有冲击力
3. 增加视觉描述，方便分镜设计
4. 确保情感曲线合理
5. 检查逻辑连贯性
6. 标记适合特效/音效的部分

请返回优化后的完整剧本，并在修改处添加注释说明优化原因。`,
    variables: {
      script: "需要优化的剧本",
    },
    tags: ["剧本优化", "节奏调整", "视频化"],
  },
}

// ======================
// 角色相关Prompt模板
// ======================

export const characterPrompts = {
  // 角色设计
  designCharacter: {
    name: "设计角色",
    description: "设计详细角色档案，包含外观、性格、背景故事",
    template: `请为短剧设计一个角色，具体要求如下：

角色基本信息：
- 姓名：{name}
- 年龄：{age}
- 性别：{gender}
- 职业：{occupation}

角色需求：
- 在故事中的角色：{roleInStory}
- 关键性格特征：{keyTraits}
- 角色弧线：{characterArc}

设计要求：
1. 外观描述（详细描述外貌特征，适合视觉化）
2. 服装风格（日常/正式/特殊场合）
3. 性格深度（核心动机、恐惧、渴望）
4. 背景故事（简要但有意义）
5. 说话风格（用词、语气、口头禅）
6. 视觉关键词（适合AI图像生成的描述词）
7. 一致性种子（用于保持角色视觉一致性的关键词）

请返回完整的角色档案。`,
    variables: {
      name: "角色姓名",
      age: "20-60",
      gender: ["男", "女", "其他"],
      occupation: "角色职业",
      roleInStory: ["主角", "反派", "配角", "导师", "盟友"],
      keyTraits: "输入3-5个关键词，如：勇敢、机智、内向",
      characterArc: "角色的成长或变化",
    },
    tags: ["角色设计", "角色档案", "视觉描述"],
  },

  // 角色一致性
  ensureConsistency: {
    name: "确保角色一致性",
    description: "在不同场景中保持角色特征一致",
    template: `请确保以下角色在不同场景中保持一致性：

角色档案：
{characterProfile}

需要检查的场景：
{scenes}

检查要求：
1. 对话是否符合角色性格和说话风格
2. 行为是否与角色动机一致
3. 情感反应是否合理
4. 视觉描述是否与角色档案匹配
5. 标记所有不一致之处并提供修改建议

请返回一致性检查报告。`,
    variables: {
      characterProfile: "角色详细档案",
      scenes: "需要检查的场景列表",
    },
    tags: ["角色一致性", "质量控制", "连续性"],
  },

  // 角色关系
  designRelationship: {
    name: "设计角色关系",
    description: "设计角色之间的复杂关系",
    template: `请设计以下角色之间的关系：

角色A：{characterA}
角色B：{characterB}

关系类型：{relationshipType}
故事阶段：{storyStage}

设计要求：
1. 关系动态（权力平衡、情感连接、冲突点）
2. 关系发展弧线
3. 关键时刻（关系转折点）
4. 视觉表现建议（如何通过镜头表现关系）
5. 对话风格（两人对话的特点）

请返回详细的关系设计。`,
    variables: {
      characterA: "第一个角色描述",
      characterB: "第二个角色描述",
      relationshipType: ["爱情", "友情", "敌对", "师徒", "家人", "同事"],
      storyStage: ["初始", "发展", "高潮", "结局"],
    },
    tags: ["角色关系", "情感设计", "互动设计"],
  },

  // 从剧本中提取角色
  extractFromScript: {
    name: "从剧本提取角色",
    description: "从剧本分析结果中提取角色信息",
    template: `请从以下剧本分析结果中提取角色信息：

{scriptAnalysis}

请按照以下JSON格式返回：
{
  "characters": [
    {
      "name": "角色名",
      "description": "角色描述",
      "traits": ["特征1", "特征2"],
      "role": "主角/反派/配角"
    }
  ]
}`,
    variables: {
      scriptAnalysis: "剧本分析结果",
    },
    tags: ["角色提取", "剧本分析"],
  },

  // 生成一致性种子
  generateConsistencySeed: {
    name: "生成角色一致性种子",
    description: "为角色生成用于保持视觉一致性的种子",
    template: `请为以下角色生成一致性种子（用于AI图像生成保持角色视觉一致）：

角色名：{characterName}
角色描述：{characterDescription}
角色特征：{characterTraits}

请返回：
1. 一致性种子（一个稳定的字符串或数字）
2. 视觉关键词（3-5个用于描述角色外观的关键词）

格式：种子: [种子值], 关键词: [关键词1, 关键词2, ...]`,
    variables: {
      characterName: "角色名",
      characterDescription: "角色描述",
      characterTraits: "角色特征",
    },
    tags: ["角色一致性", "视觉种子"],
  },
}

// ======================
// 场景和分镜Prompt模板
// ======================

export const scenePrompts = {
  // 场景生成
  generateScene: {
    name: "生成详细场景",
    description: "生成适合视频化的详细场景描述",
    template: `请为以下剧本片段生成详细的场景描述：

剧本片段：
{scriptSnippet}

场景要求：
- 地点：{location}
- 时间：{timeOfDay}
- 氛围：{mood}
- 时长：{duration}秒

生成内容：
1. 场景视觉描述（适合AI图像生成的详细描述）
2. 镜头建议（景别、角度、运动）
3. 灯光建议（光源、色调、氛围）
4. 色彩调性
5. 关键动作时刻
6. 转场建议

请返回结构化场景描述。`,
    variables: {
      scriptSnippet: "剧本内容",
      location: "场景地点",
      timeOfDay: ["清晨", "白天", "黄昏", "夜晚", "午夜"],
      mood: ["紧张", "温馨", "悬疑", "欢快", "悲伤", "浪漫"],
      duration: "10-60",
    },
    tags: ["场景生成", "视觉描述", "分镜设计"],
  },

  // 分镜生成
  generateStoryboard: {
    name: "生成分镜",
    description: "根据场景生成详细分镜图描述",
    template: `请为以下场景生成分镜：

场景描述：
{sceneDescription}

分镜要求：
- 总镜头数：{shotCount}
- 主要风格：{style}
- 关键帧：需要设计首尾关键帧

请为每个镜头提供：
1. 镜头编号
2. 画面描述（详细视觉描述）
3. 景别（特写/近景/中景/全景）
4. 角度（平视/俯视/仰视/倾斜）
5. 摄像机运动（固定/推/拉/摇/移）
6. 时长（秒）
7. 转场方式
8. 备注（情感表达、重点元素）

特别要求：为首尾帧提供特别详细的描述，用于关键帧驱动视频生成。`,
    variables: {
      sceneDescription: "场景详细描述",
      shotCount: "3-12",
      style: ["电影感", "动画", "纪录片", "实验", "商业广告"],
    },
    tags: ["分镜生成", "镜头设计", "关键帧"],
  },

  // 关键帧设计（BigBanana方法）
  designKeyframes: {
    name: "设计首尾关键帧",
    description: "使用BigBanana方法设计场景的首尾关键帧",
    template: `使用BigBanana首尾帧驱动方法设计关键帧：

场景描述：
{sceneDescription}

设计要求：
1. 起始关键帧（场景开始的第一帧）
   - 详细视觉描述
   - 构图设计
   - 主要元素位置
   - 情感表达
   - 视觉风格关键词

2. 结束关键帧（场景结束的最后一帧）
   - 详细视觉描述
   - 构图变化
   - 元素状态变化
   - 情感演变
   - 视觉风格关键词

3. 中间帧生成指导
   - 运动轨迹描述
   - 元素变化规律
   - 情感过渡方式
   - AI生成提示词建议

请确保首尾帧提供足够的细节和一致性种子，以便AI能够生成连贯的中间帧。`,
    variables: {
      sceneDescription: "场景详细描述",
    },
    tags: ["关键帧", "BigBanana", "首尾帧驱动", "视频生成"],
  },

  // 剧本场景分解
  breakdownScript: {
    name: "剧本场景分解",
    description: "将剧本分解为具体场景",
    template: `请将以下剧本分析结果分解为具体场景：

{scriptAnalysis}

请按照以下JSON格式返回：
{
  "scenes": [
    {
      "id": "场景ID",
      "description": "场景描述",
      "location": "地点",
      "timeOfDay": "时间",
      "mood": "氛围",
      "characters": ["角色名"],
      "estimatedDuration": 30
    }
  ]
}`,
    variables: {
      scriptAnalysis: "剧本分析结果",
    },
    tags: ["场景分解", "剧本分析"],
  },
}

// ======================
// 视频生成Prompt模板
// ======================

export const videoPrompts = {
  // 视频风格
  videoStyle: {
    name: "定义视频风格",
    description: "定义视频的整体视觉风格",
    template: `请定义以下内容的视频风格：

内容主题：{theme}
目标情感：{targetEmotion}
受众：{audience}
平台：{platform}

风格要求：
1. 视觉风格描述（如：赛博朋克、日式动画、电影感纪录片等）
2. 色彩调性（主色调、对比度、饱和度）
3. 节奏感（快剪/慢节奏/混合）
4. 转场风格
5. 文字/字幕样式
6. 音乐/音效风格建议
7. 参考作品（可选）

请返回详细的风格指南。`,
    variables: {
      theme: "内容主题",
      targetEmotion: ["感动", "兴奋", "思考", "娱乐", "启发"],
      audience: ["年轻人", "专业人士", "家庭", "特定兴趣群体"],
      platform: ["抖音", "YouTube", "B站", "Instagram", "TikTok"],
    },
    tags: ["视频风格", "视觉设计", "风格指南"],
  },

  // AI视频生成
  generateVideoPrompt: {
    name: "生成AI视频提示词",
    description: "为AI视频生成工具创建优化的提示词",
    template: `请为AI视频生成工具创建优化的提示词：

场景内容：{sceneContent}
目标风格：{targetStyle}
视频参数：
- 分辨率：{resolution}
- 时长：{duration}秒
- 帧率：{fps} fps
- 格式：{format}

提示词要求：
1. 主体描述（清晰明确的主体和动作）
2. 风格描述（参考风格、艺术类型）
3. 技术参数（镜头、灯光、构图）
4. 负面提示词（不希望出现的内容）
5. 质量要求（细节水平、一致性）
6. 特殊效果（慢动作、特效等）

请返回适用于{aiModel}的优化提示词。`,
    variables: {
      sceneContent: "场景详细描述",
      targetStyle: "目标视频风格",
      resolution: ["720p", "1080p", "2K", "4K"],
      duration: "5-60",
      fps: ["24", "30", "60"],
      format: ["mp4", "mov", "webm"],
      aiModel: ["Seedance", "Kling", "Runway", "Pika"],
    },
    tags: ["AI视频", "提示词优化", "视频生成"],
  },

  // 资产复用（Jellyfish方法）
  assetReuse: {
    name: "资产复用策略",
    description: "设计资产复用策略以提高一致性和效率",
    template: `请为以下项目设计资产复用策略：

项目信息：
- 类型：{projectType}
- 角色数量：{characterCount}
- 场景数量：{sceneCount}
- 预计视频数量：{videoCount}

Jellyfish方法要求：
1. 识别可复用的资产类型（角色、场景、道具、风格）
2. 设计全局种子策略
3. 制定一致性检查流程
4. 创建资产库管理方案
5. 估算复用带来的效率提升
6. 质量控制措施

请返回详细的资产复用策略报告。`,
    variables: {
      projectType: ["系列短剧", "品牌广告", "教育视频", "社交媒体内容"],
      characterCount: "1-10",
      sceneCount: "5-50",
      videoCount: "1-20",
    },
    tags: ["资产复用", "Jellyfish", "一致性", "效率优化"],
  },
}

// ======================
// Hollywood流程模板
// ======================

export const hollywoodWorkflow = {
  name: "Hollywood标准工作流",
  description: "完整的短剧生成流程：剧本分析 → 角色提取 → 分镜生成 → 配音合成 → 视频生成",
  steps: [
    {
      step: 1,
      name: "剧本分析",
      prompt: scriptPrompts.analyzeScript.template,
      expectedOutput: "结构化剧本分析报告",
      qualityCheck: ["角色完整性", "场景逻辑", "情感曲线"],
    },
    {
      step: 2,
      name: "角色设计",
      prompt: characterPrompts.designCharacter.template,
      expectedOutput: "详细角色档案",
      qualityCheck: ["视觉可生成性", "性格一致性", "背景合理性"],
    },
    {
      step: 3,
      name: "场景分镜",
      prompt: scenePrompts.generateStoryboard.template,
      expectedOutput: "详细分镜描述",
      qualityCheck: ["镜头连贯性", "视觉表现力", "时长合理性"],
    },
    {
      step: 4,
      name: "关键帧设计",
      prompt: scenePrompts.designKeyframes.template,
      expectedOutput: "首尾关键帧描述",
      qualityCheck: ["细节充分性", "一致性种子", "中间帧可生成性"],
    },
    {
      step: 5,
      name: "视频生成",
      prompt: videoPrompts.generateVideoPrompt.template,
      expectedOutput: "AI视频提示词",
      qualityCheck: ["提示词优化", "参数合理性", "风格一致性"],
    },
    {
      step: 6,
      name: "后期整合",
      prompt: "整合所有生成内容，添加配音、字幕、特效",
      expectedOutput: "完整视频文件",
      qualityCheck: ["音画同步", "节奏感", "整体质量"],
    },
  ],
  estimatedTime: "2-4小时",
  successRate: "85%",
  tags: ["Hollywood", "标准流程", "全自动化"],
}

// ======================
// 实用工具函数
// ======================

// 填充模板变量
export function fillTemplate(template: string, variables: Record<string, string>): string {
  let result = template
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{${key}}`
    result = result.replace(new RegExp(placeholder, 'g'), value)
  }
  return result
}

// 获取所有模板
export function getAllTemplates() {
  return {
    script: scriptPrompts,
    character: characterPrompts,
    scene: scenePrompts,
    video: videoPrompts,
    workflow: hollywoodWorkflow,
  }
}

// 按标签搜索模板
export function searchTemplatesByTag(tag: string) {
  const allTemplates = getAllTemplates()
  const results: Array<{
    category: string
    name: string
    description: string
    template: string
  }> = []

  for (const [category, templates] of Object.entries(allTemplates)) {
    if (category === 'workflow') continue
    
    for (const [key, template] of Object.entries(templates)) {
      if (template.tags?.includes(tag)) {
        results.push({
          category,
          name: template.name,
          description: template.description,
          template: typeof template === 'object' && 'template' in template 
            ? (template as any).template 
            : JSON.stringify(template),
        })
      }
    }
  }

  return results
}

// 获取模板变量类型
export function getTemplateVariables(template: any) {
  if (typeof template === 'object' && template.variables) {
    return template.variables
  }
  return {}
}