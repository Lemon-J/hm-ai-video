"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Film, 
  Users, 
  MapPin, 
  Video, 
  Play, 
  Pause, 
  Save, 
  Download,
  Settings,
  BarChart,
  Sparkles,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock
} from "lucide-react"
import WorkflowCanvas from "@/components/workflow/WorkflowCanvas"
import { HollywoodWorkflowEngine } from "@/lib/ai/workflow-engine"
import { AiManager } from "@/lib/ai/manager"

interface ProjectWorkflowProps {
  project: {
    id: string
    name: string
    description?: string
    status: string
    type: string
    createdAt: Date
    scripts?: Array<{
      id: string
      title: string
      summary?: string
    }>
    characters?: Array<{
      id: string
      name: string
      description?: string
      seed?: string
    }>
    scenes?: Array<{
      id: string
      title: string
      location?: string
      status: string
    }>
  }
}

export default function ProjectWorkflow({ project }: ProjectWorkflowProps) {
  const [activeTab, setActiveTab] = useState("workflow")
  const [workflowStatus, setWorkflowStatus] = useState<"idle" | "running" | "completed" | "error">("idle")
  const [progress, setProgress] = useState(0)
  const [selectedScript, setSelectedScript] = useState<string | null>(
    project.scripts?.[0]?.id || null
  )

  const handleStartWorkflow = async () => {
    if (workflowStatus === "running") return
    
    setWorkflowStatus("running")
    setProgress(0)
    
    // 模拟工作流执行
    const steps = [
      "剧本分析", "角色提取", "场景分解", "分镜生成", 
      "关键帧设计", "视频生成", "后期处理"
    ]
    
    for (let i = 0; i < steps.length; i++) {
      setProgress(((i + 1) / steps.length) * 100)
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    setWorkflowStatus("completed")
  }

  const handlePauseWorkflow = () => {
    setWorkflowStatus("idle")
  }

  const handleResetWorkflow = () => {
    setWorkflowStatus("idle")
    setProgress(0)
  }

  // 获取当前工作流状态显示
  const getStatusDisplay = () => {
    switch (workflowStatus) {
      case "running":
        return { text: "执行中", color: "text-blue-500", icon: <Play className="h-4 w-4" /> }
      case "completed":
        return { text: "已完成", color: "text-green-500", icon: <CheckCircle className="h-4 w-4" /> }
      case "error":
        return { text: "错误", color: "text-red-500", icon: <AlertCircle className="h-4 w-4" /> }
      default:
        return { text: "待执行", color: "text-gray-500", icon: <Clock className="h-4 w-4" /> }
    }
  }

  const status = getStatusDisplay()

  return (
    <div className="space-y-6">
      {/* 工作流控制栏 */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Hollywood工作流</CardTitle>
              <CardDescription>
                完整的AI短剧生成流程，包含角色一致性管理和关键帧驱动
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center ${status.color}`}>
                {status.icon}
                <span className="ml-2 font-medium">{status.text}</span>
              </span>
              {workflowStatus === "running" ? (
                <Button variant="outline" size="sm" onClick={handlePauseWorkflow}>
                  <Pause className="h-4 w-4 mr-2" />
                  暂停
                </Button>
              ) : (
                <Button 
                  variant="ai-primary" 
                  size="sm" 
                  onClick={handleStartWorkflow}
                  disabled={!selectedScript}
                >
                  <Play className="h-4 w-4 mr-2" />
                  开始生成
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleResetWorkflow}>
                <RefreshCw className="h-4 w-4 mr-2" />
                重置
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* 进度条 */}
          {workflowStatus !== "idle" && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-muted-foreground mb-1">
                <span>生成进度</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-ai-primary-500 to-ai-secondary-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* 流程步骤指示器 */}
          <div className="grid grid-cols-7 gap-2 mt-4">
            {[
              { label: "剧本", icon: Film, color: "bg-blue-500" },
              { label: "角色", icon: Users, color: "bg-purple-500" },
              { label: "场景", icon: MapPin, color: "bg-green-500" },
              { label: "分镜", icon: Film, color: "bg-yellow-500" },
              { label: "关键帧", icon: Video, color: "bg-orange-500" },
              { label: "视频", icon: Video, color: "bg-red-500" },
              { label: "导出", icon: Download, color: "bg-indigo-500" },
            ].map((step, index) => {
              const isActive = progress >= ((index + 1) / 7) * 100
              const Icon = step.icon
              
              return (
                <div key={step.label} className="text-center">
                  <div className={`relative mx-auto mb-2 ${isActive ? step.color : "bg-gray-300"} h-10 w-10 rounded-full flex items-center justify-center`}>
                    <Icon className="h-5 w-5 text-white" />
                    {isActive && (
                      <div className="absolute -top-1 -right-1 h-5 w-5 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-medium">{step.label}</span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* 主要工作区 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="workflow">
            <Sparkles className="h-4 w-4 mr-2" />
            工作流画布
          </TabsTrigger>
          <TabsTrigger value="script">
            <Film className="h-4 w-4 mr-2" />
            剧本分析
          </TabsTrigger>
          <TabsTrigger value="characters">
            <Users className="h-4 w-4 mr-2" />
            角色管理
          </TabsTrigger>
          <TabsTrigger value="assets">
            <Video className="h-4 w-4 mr-2" />
            资产库
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart className="h-4 w-4 mr-2" />
            分析报告
          </TabsTrigger>
        </TabsList>

        {/* 工作流画布标签页 */}
        <TabsContent value="workflow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>可视化工作流编辑器</CardTitle>
              <CardDescription>
                拖拽节点设计Hollywood流程，支持模板应用和自定义工作流
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[600px] border rounded-lg">
                <WorkflowCanvas />
              </div>
            </CardContent>
          </Card>

          {/* 快速模板 */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:border-ai-primary-300 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Hollywood标准流程</CardTitle>
                <CardDescription>完整的电影制作流程</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  剧本 → 角色 → 场景 → 分镜 → 视频
                </div>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:border-ai-primary-300 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Jellyfish资产复用</CardTitle>
                <CardDescription>角色一致性优化流程</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  种子管理 → 一致性验证 → 资产复用
                </div>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:border-ai-primary-300 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">BigBanana关键帧</CardTitle>
                <CardDescription>首尾帧驱动视频生成</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  起始帧 → 结束帧 → 中间生成 → 视频合成
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 剧本分析标签页 */}
        <TabsContent value="script" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>剧本智能分析</CardTitle>
              <CardDescription>
                AI自动解析剧本结构、角色、情感变化
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* 剧本选择 */}
                <div>
                  <label className="block text-sm font-medium mb-2">选择剧本</label>
                  <select 
                    className="w-full p-2 border rounded-md bg-background"
                    value={selectedScript || ""}
                    onChange={(e) => setSelectedScript(e.target.value)}
                  >
                    <option value="">请选择剧本</option>
                    {project.scripts?.map(script => (
                      <option key={script.id} value={script.id}>
                        {script.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 剧本预览 */}
                {selectedScript && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        {project.scripts?.find(s => s.id === selectedScript)?.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {project.scripts?.find(s => s.id === selectedScript)?.summary || "暂无概要"}
                      </p>
                      <div className="mt-4">
                        <Button variant="outline" size="sm">
                          详细分析
                        </Button>
                        <Button variant="ai-outline" size="sm" className="ml-2">
                          AI优化
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 分析报告 */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">分析报告</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">角色数量</span>
                        <span className="text-sm font-medium">
                          {project.characters?.length || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">场景数量</span>
                        <span className="text-sm font-medium">
                          {project.scenes?.length || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">预计时长</span>
                        <span className="text-sm font-medium">60秒</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">复杂度</span>
                        <span className="text-sm font-medium">中等</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 角色管理标签页 */}
        <TabsContent value="characters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>角色一致性管理</CardTitle>
              <CardDescription>
                使用Jellyfish方法管理角色视觉一致性
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* 角色列表 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.characters?.map(character => (
                    <Card key={character.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{character.name}</CardTitle>
                        <CardDescription>
                          {character.description?.substring(0, 100)}...
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            {character.seed ? (
                              <span className="text-green-500">已生成种子</span>
                            ) : (
                              <span className="text-yellow-500">待生成种子</span>
                            )}
                          </div>
                          <Button variant="outline" size="sm">
                            管理一致性
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* 一致性统计 */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">一致性统计</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">已生成种子</span>
                        <span className="text-sm font-medium">
                          {project.characters?.filter(c => c.seed).length || 0} / {project.characters?.length || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">平均一致性得分</span>
                        <span className="text-sm font-medium">85%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">复用率</span>
                        <span className="text-sm font-medium">42%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 资产库标签页 */}
        <TabsContent value="assets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>全局资产库</CardTitle>
              <CardDescription>
                统一管理角色、场景、道具等可复用资产
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* 资产类别统计 */}
                {[
                  { label: "角色", count: 12, color: "bg-blue-500" },
                  { label: "场景", count: 8, color: "bg-green-500" },
                  { label: "道具", count: 25, color: "bg-yellow-500" },
                  { label: "背景", count: 15, color: "bg-purple-500" },
                ].map(category => (
                  <Card key={category.label}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold">{category.count}</div>
                          <div className="text-sm text-muted-foreground">{category.label}</div>
                        </div>
                        <div className={`h-10 w-10 rounded-full ${category.color} flex items-center justify-center`}>
                          <Video className="h-5 w-5 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* 高复用资产 */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">高复用资产</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <div className="aspect-video bg-muted rounded-md mb-2" />
                        <div className="text-sm font-medium">资产 #{i}</div>
                        <div className="text-xs text-muted-foreground">复用率: {85 - i * 5}%</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 分析报告标签页 */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>工作流分析报告</CardTitle>
              <CardDescription>
                生成效率、成本、质量综合评估
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* KPI卡片 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "生成成功率", value: "92%", change: "+2%" },
                    { label: "平均成本", value: "$4.50", change: "-$0.30" },
                    { label: "生成时间", value: "3.2min", change: "-0.5min" },
                    { label: "一致性得分", value: "88%", change: "+3%" },
                  ].map(kpi => (
                    <Card key={kpi.label}>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">{kpi.value}</div>
                        <div className="text-sm text-muted-foreground">{kpi.label}</div>
                        <div className={`text-xs ${kpi.change.startsWith("+") ? "text-green-500" : "text-red-500"}`}>
                          {kpi.change}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* 详细报告 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">优化建议</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>角色一致性管理效果良好，建议继续使用Jellyfish方法</span>
                      </li>
                      <li className="flex items-start">
                        <AlertCircle className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>视频生成成本较高，建议优化关键帧设计减少重试次数</span>
                      </li>
                      <li className="flex items-start">
                        <AlertCircle className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>部分资产复用率较低，建议审查并优化资产标签</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>BigBanana方法有效减少随机抽卡，建议在所有项目中使用</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}