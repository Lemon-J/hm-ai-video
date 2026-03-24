import { Node, Edge } from "@xyflow/react"

// 工作流节点类型
export type WorkflowNodeType = 
  | "script_input"        // 剧本输入
  | "script_analysis"     // 剧本分析
  | "character_extract"   // 角色提取
  | "scene_generation"    // 场景生成
  | "storyboard"         // 分镜生成
  | "voice_synthesis"    // 语音合成
  | "video_generation"   // 视频生成
  | "post_processing"    // 后期处理
  | "export_output"      // 导出输出
  | "condition"          // 条件判断
  | "loop"              // 循环
  | "ai_generation"     // AI生成
  | "asset_loader"      // 资产加载
  | "manual_review"     // 人工审核

// 节点状态
export type NodeStatus = "pending" | "running" | "success" | "error" | "warning"

// 工作流节点数据
export interface WorkflowNodeData {
  label: string
  description?: string
  type: WorkflowNodeType
  status: NodeStatus
  config: Record<string, any>
  progress?: number
  error?: string
  aiProvider?: string
  model?: string
  estimatedTime?: number
  costEstimate?: number
}

// 工作流边数据
export interface WorkflowEdgeData {
  label?: string
  condition?: string
}

// 自定义节点
export type WorkflowNode = Node<WorkflowNodeData & Record<string, unknown>>
export type WorkflowEdge = Edge<WorkflowEdgeData & Record<string, unknown>>

// 工作流模板
export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: "hollywood" | "custom" | "experimental"
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  tags: string[]
  usageCount: number
  estimatedTime: number
  complexity: "simple" | "medium" | "complex"
}

// Hollywood标准流程模板
export const HOLLYWOOD_TEMPLATE: WorkflowTemplate = {
  id: "hollywood_standard",
  name: "Hollywood标准流程",
  description: "完整的短剧生成流程：剧本分析 → 角色提取 → 分镜生成 → 配音合成 → 视频生成",
  category: "hollywood",
  nodes: [
    {
      id: "1",
      type: "script_input",
      position: { x: 100, y: 100 },
      data: {
        label: "剧本输入",
        description: "上传或编写剧本",
        type: "script_input",
        status: "pending",
        config: {},
      },
    },
    {
      id: "2",
      type: "script_analysis",
      position: { x: 350, y: 100 },
      data: {
        label: "剧本分析",
        description: "AI分析剧本结构和情感",
        type: "script_analysis",
        status: "pending",
        config: { depth: "detailed" },
        aiProvider: "claude",
        model: "claude-3-opus",
        estimatedTime: 30,
      },
    },
    {
      id: "3",
      type: "character_extract",
      position: { x: 600, y: 50 },
      data: {
        label: "角色提取",
        description: "提取角色特征和一致性",
        type: "character_extract",
        status: "pending",
        config: { consistency: "high" },
        aiProvider: "gemini",
        model: "gemini-2.0-flash",
        estimatedTime: 45,
      },
    },
    {
      id: "4",
      type: "scene_generation",
      position: { x: 600, y: 150 },
      data: {
        label: "场景生成",
        description: "生成场景描述和分镜",
        type: "scene_generation",
        status: "pending",
        config: { style: "cinematic" },
        aiProvider: "seedance",
        model: "seedance-v2",
        estimatedTime: 60,
      },
    },
    {
      id: "5",
      type: "storyboard",
      position: { x: 850, y: 100 },
      data: {
        label: "分镜生成",
        description: "生成关键帧和分镜图",
        type: "storyboard",
        status: "pending",
        config: { resolution: "1080p" },
        aiProvider: "kling",
        model: "kling-v1",
        estimatedTime: 90,
      },
    },
    {
      id: "6",
      type: "voice_synthesis",
      position: { x: 1100, y: 50 },
      data: {
        label: "语音合成",
        description: "为角色生成配音",
        type: "voice_synthesis",
        status: "pending",
        config: { emotion: "natural" },
        aiProvider: "openai",
        model: "tts-1",
        estimatedTime: 120,
      },
    },
    {
      id: "7",
      type: "video_generation",
      position: { x: 1100, y: 150 },
      data: {
        label: "视频生成",
        description: "合成视频片段",
        type: "video_generation",
        status: "pending",
        config: { fps: 30, format: "mp4" },
        aiProvider: "seedance",
        model: "seedance-video",
        estimatedTime: 180,
      },
    },
    {
      id: "8",
      type: "post_processing",
      position: { x: 1350, y: 100 },
      data: {
        label: "后期处理",
        description: "剪辑、特效、字幕",
        type: "post_processing",
        status: "pending",
        config: { effects: ["color", "subtitle"] },
        estimatedTime: 60,
      },
    },
    {
      id: "9",
      type: "export_output",
      position: { x: 1600, y: 100 },
      data: {
        label: "导出输出",
        description: "导出最终视频文件",
        type: "export_output",
        status: "pending",
        config: { format: "mp4", quality: "high" },
        estimatedTime: 30,
      },
    },
  ],
  edges: [
    { id: "e1-2", source: "1", target: "2", animated: true },
    { id: "e2-3", source: "2", target: "3", animated: true },
    { id: "e2-4", source: "2", target: "4", animated: true },
    { id: "e3-5", source: "3", target: "5", animated: true },
    { id: "e4-5", source: "4", target: "5", animated: true },
    { id: "e5-6", source: "5", target: "6", animated: true },
    { id: "e5-7", source: "5", target: "7", animated: true },
    { id: "e6-8", source: "6", target: "8", animated: true },
    { id: "e7-8", source: "7", target: "8", animated: true },
    { id: "e8-9", source: "8", target: "9", animated: true },
  ],
  tags: ["standard", "hollywood", "complete"],
  usageCount: 1247,
  estimatedTime: 615,
  complexity: "complex",
}

// 简化的Jellyfish流程（角色资产重用）
export const JELLYFISH_TEMPLATE: WorkflowTemplate = {
  id: "jellyfish_reuse",
  name: "Jellyfish资产重用",
  description: "优化角色一致性和资产重用，降低生成成本",
  category: "custom",
  nodes: [
    {
      id: "1",
      type: "script_input",
      position: { x: 100, y: 100 },
      data: {
        label: "剧本输入",
        description: "上传剧本",
        type: "script_input",
        status: "pending",
        config: {},
      },
    },
    {
      id: "2",
      type: "asset_loader",
      position: { x: 350, y: 50 },
      data: {
        label: "资产库加载",
        description: "加载已有角色资产",
        type: "asset_loader",
        status: "pending",
        config: { reuse: true },
      },
    },
    {
      id: "3",
      type: "character_extract",
      position: { x: 350, y: 150 },
      data: {
        label: "新角色提取",
        description: "提取新角色特征",
        type: "character_extract",
        status: "pending",
        config: {},
      },
    },
    {
      id: "4",
      type: "scene_generation",
      position: { x: 600, y: 100 },
      data: {
        label: "场景生成",
        description: "重用现有场景资产",
        type: "scene_generation",
        status: "pending",
        config: { reuse: true },
      },
    },
    {
      id: "5",
      type: "video_generation",
      position: { x: 850, y: 100 },
      data: {
        label: "视频生成",
        description: "使用全局种子",
        type: "video_generation",
        status: "pending",
        config: { seed: "global" },
      },
    },
  ],
  edges: [
    { id: "e1-2", source: "1", target: "2", animated: true },
    { id: "e1-3", source: "1", target: "3", animated: true },
    { id: "e2-4", source: "2", target: "4", animated: true },
    { id: "e3-4", source: "3", target: "4", animated: true },
    { id: "e4-5", source: "4", target: "5", animated: true },
  ],
  tags: ["reuse", "consistency", "efficient"],
  usageCount: 892,
  estimatedTime: 240,
  complexity: "medium",
}

// BigBanana首尾帧驱动流程
export const BIGBANANA_TEMPLATE: WorkflowTemplate = {
  id: "bigbanana_keyframe",
  name: "BigBanana首尾帧驱动",
  description: "使用首尾关键帧驱动视频生成，避免随机抽卡",
  category: "experimental",
  nodes: [
    {
      id: "1",
      type: "script_input",
      position: { x: 100, y: 100 },
      data: {
        label: "剧本输入",
        description: "输入详细剧本",
        type: "script_input",
        status: "pending",
        config: {},
      },
    },
    {
      id: "2",
      type: "storyboard",
      position: { x: 350, y: 50 },
      data: {
        label: "关键帧设计",
        description: "设计首尾关键帧",
        type: "storyboard",
        status: "pending",
        config: { keyframes: ["start", "end"] },
      },
    },
    {
      id: "3",
      type: "ai_generation",
      position: { x: 350, y: 150 },
      data: {
        label: "AI中间帧生成",
        description: "基于关键帧生成中间帧",
        type: "ai_generation",
        status: "pending",
        config: { interpolation: true },
      },
    },
    {
      id: "4",
      type: "video_generation",
      position: { x: 600, y: 100 },
      data: {
        label: "视频合成",
        description: "合成完整视频",
        type: "video_generation",
        status: "pending",
        config: { smooth: true },
      },
    },
  ],
  edges: [
    { id: "e1-2", source: "1", target: "2", animated: true },
    { id: "e2-3", source: "2", target: "3", animated: true },
    { id: "e3-4", source: "3", target: "4", animated: true },
  ],
  tags: ["keyframe", "interpolation", "experimental"],
  usageCount: 356,
  estimatedTime: 180,
  complexity: "simple",
}

// 所有模板
export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  HOLLYWOOD_TEMPLATE,
  JELLYFISH_TEMPLATE,
  BIGBANANA_TEMPLATE,
]