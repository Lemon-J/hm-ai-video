// import { createClient } from '@supabase/supabase-js';
import type { Character, Scene, Asset } from '@prisma/client';

// 图像相似度阈值
const SIMILARITY_THRESHOLDS = {
  strict: 0.95,    // 严格模式: 角色/场景核心特征
  medium: 0.85,   // 中等模式: 服装/道具
  flexible: 0.70, // 宽松模式: 背景/光照
};

/**
 * 基于CLIP模型的图像嵌入生成
 * 使用OpenAI CLIP模型或替代方案
 */
async function generateImageEmbedding(imageUrl: string): Promise<number[]> {
  // TODO: 集成实际的CLIP模型
  // 方案1: OpenAI CLIP API
  // 方案2: 开源Transformers.js (浏览器端)
  // 方案3: 本地ONNX模型 (服务端)
  
  // 临时返回模拟嵌入向量
  return new Array(512).fill(0).map(() => Math.random());
}

/**
 * 计算余弦相似度
 */
function cosineSimilarity(embedding1: number[], embedding2: number[]): number {
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < embedding1.length; i++) {
    dotProduct += embedding1[i] * embedding2[i];
    norm1 += embedding1[i] * embedding1[i];
    norm2 += embedding2[i] * embedding2[i];
  }

  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

/**
 * 验证角色一致性
 */
export interface CharacterConsistencyReport {
  characterId: string;
  characterName: string;
  sceneCount: number;
  consistentScenes: number;
  inconsistentScenes: number;
  similarityScores: number[];
  overallScore: number;
  issues: ConsistencyIssue[];
}

export interface ConsistencyIssue {
  type: 'facial' | 'hair' | 'body' | 'clothing' | 'environment';
  severity: 'high' | 'medium' | 'low';
  sceneId: string;
  description: string;
  suggestion: string;
}

export async function validateCharacterConsistency(
  character: Character & { assets: Asset[] },
  scenes: (Scene & { assets: Asset[] })[]
): Promise<CharacterConsistencyReport> {
  const report: CharacterConsistencyReport = {
    characterId: character.id,
    characterName: character.name,
    sceneCount: scenes.length,
    consistentScenes: 0,
    inconsistentScenes: 0,
    similarityScores: [],
    overallScore: 0,
    issues: [],
  };

  if (scenes.length === 0) {
    return report;
  }

  // 获取角色的参考嵌入(第一次出现)
  const referenceAssets = character.assets.filter(a => a.category === 'CHARACTER');
  if (referenceAssets.length === 0) {
    report.issues.push({
      type: 'facial',
      severity: 'high',
      sceneId: '',
      description: '缺少角色参考图像',
      suggestion: '请上传角色的参考图像(正视图、侧视图)',
    });
    return report;
  }

  const referenceEmbedding = await generateImageEmbedding(referenceAssets[0].url);

  // 检查每个场景中的角色图像
  for (const scene of scenes) {
    const sceneCharacterAssets = scene.assets.filter(
      a => a.category === 'CHARACTER' && a.name?.includes(character.name)
    );

    if (sceneCharacterAssets.length === 0) {
      report.issues.push({
        type: 'facial',
        severity: 'medium',
        sceneId: scene.id,
        description: `场景 ${scene.title} 中缺少角色 ${character.name}`,
        suggestion: '检查场景资产是否正确关联',
      });
      report.inconsistentScenes++;
      continue;
    }

    const sceneEmbedding = await generateImageEmbedding(sceneCharacterAssets[0].url);
    const similarity = cosineSimilarity(referenceEmbedding, sceneEmbedding);
    report.similarityScores.push(similarity);

    // 根据相似度判断一致性
    if (similarity >= SIMILARITY_THRESHOLDS.strict) {
      report.consistentScenes++;
    } else if (similarity >= SIMILARITY_THRESHOLDS.medium) {
      report.consistentScenes++;
      report.issues.push({
        type: 'clothing',
        severity: 'low',
        sceneId: scene.id,
        description: `场景 ${scene.title} 中角色 ${character.name} 与参考图像存在轻微差异 (相似度: ${(similarity * 100).toFixed(1)}%)`,
        suggestion: '可以接受,如需完全一致可重新生成',
      });
    } else {
      report.inconsistentScenes++;
      report.issues.push({
        type: 'facial',
        severity: 'high',
        sceneId: scene.id,
        description: `场景 ${scene.title} 中角色 ${character.name} 与参考图像存在明显差异 (相似度: ${(similarity * 100).toFixed(1)}%)`,
        suggestion: '建议重新生成该场景,使用相同的种子和prompt',
      });
    }
  }

  // 计算整体一致性分数
  report.overallScore = report.similarityScores.length > 0
    ? report.similarityScores.reduce((sum, score) => sum + score, 0) / report.similarityScores.length
    : 0;

  return report;
}

/**
 * 验证场景光影一致性
 */
export interface SceneLightingConsistencyReport {
  sceneId: string;
  sceneName: string;
  shotCount: number;
  lightingConsistencyScore: number;
  issues: LightingIssue[];
}

export interface LightingIssue {
  type: 'time_of_day' | 'weather' | 'light_direction' | 'color_temperature';
  severity: 'high' | 'medium' | 'low';
  shotIndex: number;
  description: string;
  suggestion: string;
}

export async function validateSceneLightingConsistency(
  scene: Scene & { assets: Asset[] }
): Promise<SceneLightingConsistencyReport> {
  const report: SceneLightingConsistencyReport = {
    sceneId: scene.id,
    sceneName: scene.title,
    shotCount: scene.assets.filter(a => a.category === 'SCENE').length,
    lightingConsistencyScore: 0,
    issues: [],
  };

  const sceneAssets = scene.assets.filter(a => a.category === 'SCENE');
  if (sceneAssets.length === 0) {
    return report;
  }

  // 生成第一帧的嵌入作为参考
  const referenceEmbedding = await generateImageEmbedding(sceneAssets[0].url);

  // 比较所有场景帧
  for (let i = 1; i < sceneAssets.length; i++) {
    const currentEmbedding = await generateImageEmbedding(sceneAssets[i].url);
    const similarity = cosineSimilarity(referenceEmbedding, currentEmbedding);

    // 光影一致性要求稍低于角色一致性
    if (similarity < SIMILARITY_THRESHOLDS.medium) {
      report.issues.push({
        type: 'color_temperature',
        severity: 'medium',
        shotIndex: i,
        description: `第 ${i + 1} 帧与首帧的光影不一致 (相似度: ${(similarity * 100).toFixed(1)}%)`,
        suggestion: '检查时间和天气描述是否一致',
      });
    }
  }

  // 计算整体光影一致性分数
  report.lightingConsistencyScore = report.issues.length === 0 ? 1 : 
    1 - (report.issues.filter(i => i.severity === 'high').length * 0.3 + 
         report.issues.filter(i => i.severity === 'medium').length * 0.15);

  return report;
}

/**
 * 多角色同场景一致性检查
 */
export async function validateMultiCharacterSceneConsistency(
  scene: Scene & { assets: Asset[] },
  characters: Character[]
): Promise<ConsistencyIssue[]> {
  const issues: ConsistencyIssue[] = [];

  // 检查每个角色的存在性和一致性
  for (const character of characters) {
    const characterAssets = scene.assets.filter(
      a => a.category === 'CHARACTER' && a.name?.includes(character.name)
    );

    if (characterAssets.length === 0) {
      issues.push({
        type: 'facial',
        severity: 'high',
        sceneId: scene.id,
        description: `场景 ${scene.title} 中缺少角色 ${character.name}`,
        suggestion: '检查角色是否在场景描述中',
      });
    }
  }

  // TODO: 添加更多多角色一致性检查
  // - 角色之间的大小比例
  // - 角色之间的相对位置
  // - 阴影方向一致性

  return issues;
}

/**
 * 生成一致性改进建议
 */
export function generateConsistencyImprovements(
  characterReport: CharacterConsistencyReport,
  sceneReports: SceneLightingConsistencyReport[]
): string[] {
  const improvements: string[] = [];

  // 基于角色报告的建议
  if (characterReport.overallScore < 0.85) {
    improvements.push(
      `角色 ${characterReport.characterName} 的一致性较低 (${(characterReport.overallScore * 100).toFixed(1)}%),建议:`
    );
    improvements.push('  1. 使用相同的种子值生成所有场景');
    improvements.push('  2. 确保prompt中角色描述完全一致');
    improvements.push('  3. 使用角色参考图像进行控制');
  }

  // 基于场景报告的建议
  sceneReports.forEach(report => {
    if (report.lightingConsistencyScore < 0.85) {
      improvements.push(
        `场景 ${report.sceneName} 的光影不一致 (${(report.lightingConsistencyScore * 100).toFixed(1)}%),建议:`
      );
      improvements.push('  1. 统一时间描述(如: 黄昏、正午)');
      improvements.push('  2. 统一天气描述(如: 晴天、阴天)');
      improvements.push('  3. 统一光照方向描述');
    }
  });

  return improvements;
}

/**
 * 批量验证项目一致性
 */
export async function validateProjectConsistency(
  characters: (Character & { assets: Asset[] })[],
  scenes: (Scene & { assets: Asset[] })[]
): Promise<{
  characterReports: CharacterConsistencyReport[];
  sceneReports: SceneLightingConsistencyReport[];
  overallScore: number;
  improvements: string[];
}> {
  // 验证每个角色的一致性
  const characterReports = await Promise.all(
    characters.map(character => {
      const characterScenes = scenes.filter(scene =>
        scene.assets.some(a => 
          a.category === 'CHARACTER' && a.name?.includes(character.name)
        )
      );
      return validateCharacterConsistency(character, characterScenes);
    })
  );

  // 验证每个场景的光影一致性
  const sceneReports = await Promise.all(
    scenes.map(scene => validateSceneLightingConsistency(scene))
  );

  // 计算整体分数
  const overallScore = 
    (characterReports.reduce((sum, r) => sum + r.overallScore, 0) / characterReports.length +
     sceneReports.reduce((sum, r) => sum + r.lightingConsistencyScore, 0) / sceneReports.length) / 2;

  // 生成改进建议
  const improvements: string[] = [];
  characterReports.forEach(r => {
    const charImprovements = generateConsistencyImprovements(r, sceneReports);
    improvements.push(...charImprovements);
  });

  return {
    characterReports,
    sceneReports,
    overallScore,
    improvements,
  };
}
