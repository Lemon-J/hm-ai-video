'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import ProjectWorkflow from '@/components/projects/ProjectWorkflow'
import {
  ArrowLeft,
  Play,
  Settings,
  Share2,
  Download,
  Film,
  FileText,
  Users,
  Workflow,
  Sparkles,
  BarChart,
  Zap,
  Clock,
  CheckCircle,
  MapPin,
  AlertCircle,
} from 'lucide-react'

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')

  const project = {
    id: params.id as string,
    name: '短剧预告片',
    description: '都市情感短剧预告片制作，包含爱情、友情主题，采用Hollywood标准流程',
    type: 'SHORT_DRAMA',
    status: 'IN_PROGRESS',
    createdAt: new Date('2024-01-15'),
    updatedAt: '2小时前',
    metadata: {
      totalScenes: 12,
      characters: 4,
      estimatedDuration: 180, // 秒
      progress: 65,
    },
    scripts: [
      {
        id: 'script-1',
        title: '都市爱情短剧剧本',
        summary: '讲述两个年轻人在都市中相遇相爱的故事，包含情感冲突和成长'
      },
      {
        id: 'script-2',
        title: '预告片精简版',
        summary: '为社交媒体优化的60秒预告片剧本'
      }
    ],
    characters: [
      {
        id: 'char-1',
        name: '李晨',
        description: '25岁软件工程师，性格内向但真诚，喜欢摄影',
        seed: 'young-male-software-engineer-camera-hobby'
      },
      {
        id: 'char-2',
        name: '王雨欣',
        description: '23岁设计师，活泼开朗，对生活充满热情',
        seed: 'young-female-designer-energetic-creative'
      },
      {
        id: 'char-3',
        name: '张总',
        description: '45岁公司高管，严肃但有原则',
        seed: 'middle-aged-male-executive-strict-principled'
      },
      {
        id: 'char-4',
        name: '小美',
        description: '20岁大学生，雨欣的闺蜜，乐观善良',
        seed: 'young-female-student-optimistic-kind'
      }
    ],
    scenes: [
      {
        id: 'scene-1',
        title: '咖啡馆初遇',
        location: '星巴克咖啡馆',
        status: 'COMPLETED'
      },
      {
        id: 'scene-2',
        title: '办公室冲突',
        location: '现代办公室',
        status: 'IN_PROGRESS'
      },
      {
        id: 'scene-3',
        title: '公园约会',
        location: '中央公园',
        status: 'PENDING'
      },
      {
        id: 'scene-4',
        title: '雨夜分手',
        location: '城市街道',
        status: 'PENDING'
      }
    ]
  }

  const tabs = [
    { id: 'overview', label: '概览', icon: Film },
    { id: 'script', label: '剧本', icon: FileText },
    { id: 'characters', label: '角色', icon: Users },
    { id: 'workflow', label: '工作流', icon: Workflow },
    { id: 'assets', label: '资产', icon: Sparkles },
    { id: 'analytics', label: '分析', icon: BarChart },
  ]

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/dashboard/projects')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">{project.name}</h1>
            <p className="text-gray-400 mt-1">{project.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className="bg-blue-600">进行中</Badge>
          <Button variant="outline" className="border-gray-700">
            <Share2 className="w-4 h-4 mr-2" />
            分享
          </Button>
          <Button variant="outline" className="border-gray-700">
            <Settings className="w-4 h-4 mr-2" />
            设置
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Play className="w-4 h-4 mr-2" />
            预览
          </Button>
        </div>
      </div>

      {/* 标签页 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-900 border border-gray-800">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="data-[state=active]:bg-purple-600"
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* 概览 */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* 统计信息 */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400">场景数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {project.metadata.totalScenes}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400">角色数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {project.metadata.characters}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400">预计时长</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.floor(project.metadata.estimatedDuration / 60)}:{String(
                    project.metadata.estimatedDuration % 60
                  ).padStart(2, '0')}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400">进度</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {project.metadata.progress}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 进度条 */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle>项目进度</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">剧本编写</span>
                    <span className="text-green-400">已完成</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">角色设计</span>
                    <span className="text-green-400">已完成</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">场景生成</span>
                    <span className="text-blue-400">进行中</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">视频合成</span>
                    <span className="text-gray-400">待开始</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-gray-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 快速操作 */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle>快速操作</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3">
              <Button
                variant="outline"
                className="border-gray-700 justify-start"
                onClick={() => setActiveTab('script')}
              >
                <FileText className="w-4 h-4 mr-2" />
                编辑剧本
              </Button>
              <Button
                variant="outline"
                className="border-gray-700 justify-start"
                onClick={() => setActiveTab('workflow')}
              >
                <Workflow className="w-4 h-4 mr-2" />
                执行工作流
              </Button>
              <Button
                variant="outline"
                className="border-gray-700 justify-start"
              >
                <Download className="w-4 h-4 mr-2" />
                导出视频
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 剧本标签页 */}
        <TabsContent value="script" className="mt-6">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle>剧本管理</CardTitle>
              <div className="text-gray-400 text-sm">
                使用AI分析剧本结构、提取角色、优化对话
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {project.scripts.map(script => (
                  <Card key={script.id} className="bg-gray-800/50 border-gray-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{script.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300 text-sm mb-3">{script.summary}</p>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">详细分析</Button>
                        <Button variant="ai-outline" size="sm">AI优化</Button>
                        <Button variant="ghost" size="sm">编辑</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 角色标签页 */}
        <TabsContent value="characters" className="mt-6">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle>角色一致性管理 (Jellyfish方法)</CardTitle>
              <div className="text-gray-400 text-sm">
                管理角色视觉一致性，使用全局种子确保角色在不同场景中的表现一致
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.characters.map(character => (
                  <Card key={character.id} className="bg-gray-800/50 border-gray-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{character.name}</CardTitle>
                      <div className="text-xs text-gray-400">
                        {character.seed ? "已生成种子" : "待生成种子"}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300 text-sm mb-3">{character.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant={character.seed ? "default" : "outline"}>
                          {character.seed ? character.seed : "无种子"}
                        </Badge>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">管理一致性</Button>
                          <Button variant="ghost" size="sm">编辑</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 工作流标签页 */}
        <TabsContent value="workflow" className="mt-6">
          <ProjectWorkflow project={project} />
        </TabsContent>

        {/* 资产标签页 */}
        <TabsContent value="assets" className="mt-6">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle>全局资产库</CardTitle>
              <div className="text-gray-400 text-sm">
                统一管理角色、场景、道具等可复用资产，提高生成效率
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "角色资产", count: "12", icon: Users, color: "bg-blue-500" },
                    { label: "场景资产", count: "8", icon: MapPin, color: "bg-green-500" },
                    { label: "道具资产", count: "25", icon: Sparkles, color: "bg-yellow-500" },
                    { label: "背景资产", count: "15", icon: Film, color: "bg-purple-500" },
                  ].map(item => (
                    <Card key={item.label} className="bg-gray-800/50 border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-2xl font-bold">{item.count}</div>
                            <div className="text-sm text-gray-400">{item.label}</div>
                          </div>
                          <div className={`h-10 w-10 rounded-full ${item.color} flex items-center justify-center`}>
                            <item.icon className="h-5 w-5 text-white" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">高复用资产</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { name: "都市男性角色", reuseRate: "85%", type: "角色" },
                      { name: "现代办公室", reuseRate: "78%", type: "场景" },
                      { name: "咖啡杯道具", reuseRate: "92%", type: "道具" },
                      { name: "公园背景", reuseRate: "65%", type: "背景" },
                      { name: "女性职业装", reuseRate: "72%", type: "服装" },
                      { name: "雨夜街道", reuseRate: "58%", type: "场景" },
                    ].map(asset => (
                      <Card key={asset.name} className="bg-gray-800/50 border-gray-700">
                        <CardContent className="p-4">
                          <div className="aspect-video bg-gray-700 rounded-md mb-2 flex items-center justify-center">
                            <div className="text-gray-400 text-sm">{asset.type}</div>
                          </div>
                          <div className="text-sm font-medium">{asset.name}</div>
                          <div className="text-xs text-gray-400">复用率: {asset.reuseRate}</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 分析标签页 */}
        <TabsContent value="analytics" className="mt-6">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle>AI生成分析报告</CardTitle>
              <div className="text-gray-400 text-sm">
                生成效率、成本、质量综合评估，基于Hollywood流程数据
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* KPI指标 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "生成成功率", value: "92%", icon: CheckCircle, color: "text-green-500" },
                    { label: "平均成本", value: "$4.50", icon: Zap, color: "text-yellow-500" },
                    { label: "平均时间", value: "3.2min", icon: Clock, color: "text-blue-500" },
                    { label: "一致性得分", value: "88%", icon: Sparkles, color: "text-purple-500" },
                  ].map(kpi => (
                    <Card key={kpi.label} className="bg-gray-800/50 border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-2xl font-bold">{kpi.value}</div>
                            <div className="text-sm text-gray-400">{kpi.label}</div>
                          </div>
                          <div className={`h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center ${kpi.color}`}>
                            <kpi.icon className="h-5 w-5" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* 优化建议 */}
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-base">优化建议</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">角色一致性管理(Jellyfish方法)效果显著，建议继续使用</span>
                      </li>
                      <li className="flex items-start">
                        <AlertCircle className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">视频生成成本较高，建议优化关键帧设计(BigBanana方法)减少重试</span>
                      </li>
                      <li className="flex items-start">
                        <AlertCircle className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">资产复用率有提升空间，建议完善资产标签系统</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">Hollywood标准流程显著提高生成质量，建议标准化</span>
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
