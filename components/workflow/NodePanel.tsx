import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  Search,
  FileText,
  Users,
  Video,
  Mic,
  Settings,
  Brain,
  Database,
  Eye,
  Filter,
  GitBranch,
  Repeat,
  Zap,
  ChevronDown
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface NodeType {
  id: string
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  category: "input" | "processing" | "output" | "control" | "ai"
  color: string
}

const nodeTypes: NodeType[] = [
  // 输入节点
  {
    id: "script_input",
    label: "剧本输入",
    description: "上传或编写剧本内容",
    icon: FileText,
    category: "input",
    color: "bg-blue-500",
  },
  {
    id: "asset_loader",
    label: "资产加载",
    description: "加载角色、场景资产",
    icon: Database,
    category: "input",
    color: "bg-purple-500",
  },

  // AI处理节点
  {
    id: "script_analysis",
    label: "剧本分析",
    description: "AI分析剧本结构和情感",
    icon: Brain,
    category: "ai",
    color: "bg-green-500",
  },
  {
    id: "character_extract",
    label: "角色提取",
    description: "提取角色特征和一致性",
    icon: Users,
    category: "ai",
    color: "bg-pink-500",
  },
  {
    id: "scene_generation",
    label: "场景生成",
    description: "生成场景描述和分镜",
    icon: Eye,
    category: "ai",
    color: "bg-yellow-500",
  },
  {
    id: "storyboard",
    label: "分镜生成",
    description: "生成关键帧和分镜图",
    icon: Video,
    category: "ai",
    color: "bg-orange-500",
  },
  {
    id: "voice_synthesis",
    label: "语音合成",
    description: "为角色生成配音",
    icon: Mic,
    category: "ai",
    color: "bg-teal-500",
  },
  {
    id: "video_generation",
    label: "视频生成",
    description: "合成视频片段",
    icon: Video,
    category: "ai",
    color: "bg-red-500",
  },
  {
    id: "ai_generation",
    label: "AI生成",
    description: "通用AI生成节点",
    icon: Brain,
    category: "ai",
    color: "bg-indigo-500",
  },

  // 处理节点
  {
    id: "post_processing",
    label: "后期处理",
    description: "剪辑、特效、字幕",
    icon: Settings,
    category: "processing",
    color: "bg-gray-500",
  },
  {
    id: "manual_review",
    label: "人工审核",
    description: "人工审核和修改",
    icon: Eye,
    category: "processing",
    color: "bg-gray-600",
  },

  // 输出节点
  {
    id: "export_output",
    label: "导出输出",
    description: "导出最终视频文件",
    icon: Database,
    category: "output",
    color: "bg-green-600",
  },

  // 控制节点
  {
    id: "condition",
    label: "条件判断",
    description: "根据条件分支流程",
    icon: GitBranch,
    category: "control",
    color: "bg-blue-600",
  },
  {
    id: "loop",
    label: "循环",
    description: "循环执行特定流程",
    icon: Repeat,
    category: "control",
    color: "bg-purple-600",
  },
]

const categories = [
  { id: "all", label: "全部", icon: Zap },
  { id: "input", label: "输入", icon: Database },
  { id: "ai", label: "AI处理", icon: Brain },
  { id: "processing", label: "处理", icon: Settings },
  { id: "output", label: "输出", icon: Database },
  { id: "control", label: "控制", icon: GitBranch },
]

interface NodePanelProps {
  onAddNode: (nodeType: string) => void
}

export function NodePanel({ onAddNode }: NodePanelProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    input: true,
    ai: true,
    processing: true,
    output: true,
    control: true,
  })

  const filteredNodes = nodeTypes.filter(node => {
    const matchesSearch = node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         node.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || node.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const groupedNodes = filteredNodes.reduce((acc, node) => {
    if (!acc[node.category]) {
      acc[node.category] = []
    }
    acc[node.category].push(node)
    return acc
  }, {} as Record<string, NodeType[]>)

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  const handleDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType)
    event.dataTransfer.effectAllowed = "move"
  }

  return (
    <div className="h-full flex flex-col">
      {/* 搜索和筛选 */}
      <div className="p-4 border-b space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索节点类型..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap gap-1">
          {categories.map((category) => {
            const Icon = category.icon
            const isSelected = selectedCategory === category.id
            const count = category.id === "all" 
              ? nodeTypes.length 
              : nodeTypes.filter(n => n.category === category.id).length
            
            return (
              <Button
                key={category.id}
                size="sm"
                variant={isSelected ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className="h-8 px-2 text-xs"
              >
                <Icon className="h-3 w-3 mr-1" />
                {category.label}
                <span className="ml-1 text-muted-foreground">({count})</span>
              </Button>
            )
          })}
        </div>
      </div>

      {/* 节点列表 */}
      <div className="flex-1 overflow-y-auto p-4">
        {Object.keys(groupedNodes).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Filter className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">未找到节点</h3>
            <p className="text-sm text-muted-foreground">
              尝试修改搜索条件或选择其他分类
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedNodes).map(([category, nodes]) => {
              const categoryName = categories.find(c => c.id === category)?.label || category
              const isExpanded = expandedCategories[category]
              
              return (
                <div key={category} className="space-y-2">
                  <button
                    onClick={() => toggleCategory(category)}
                    className="flex items-center justify-between w-full text-sm font-medium"
                  >
                    <span>{categoryName} ({nodes.length})</span>
                    <ChevronDown className={cn(
                      "h-4 w-4 transition-transform",
                      !isExpanded && "-rotate-90"
                    )} />
                  </button>
                  
                  {isExpanded && (
                    <div className="grid grid-cols-1 gap-2">
                      {nodes.map((node) => {
                        const Icon = node.icon
                        
                        return (
                          <Card
                            key={node.id}
                            className="cursor-pointer hover:shadow-md transition-all group"
                            draggable
                            onDragStart={(e) => handleDragStart(e, node.id)}
                            onClick={() => onAddNode(node.id)}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-start gap-3">
                                <div className={cn(
                                  "p-2 rounded-md flex-shrink-0",
                                  node.color,
                                  "text-white"
                                )}>
                                  <Icon className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-sm line-clamp-1">
                                    {node.label}
                                  </h4>
                                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                    {node.description}
                                  </p>
                                </div>
                                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <div className="w-2 h-2 rounded-full bg-primary" />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 使用提示 */}
      <div className="p-4 border-t">
        <div className="text-xs text-muted-foreground space-y-1">
          <p>💡 使用提示：</p>
          <p>• 拖拽节点到画布添加</p>
          <p>• 点击节点快速添加</p>
          <p>• 右键节点查看更多操作</p>
        </div>
      </div>
    </div>
  )
}