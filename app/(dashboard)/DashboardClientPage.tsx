'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Film,
  Sparkles,
  Users,
  TrendingUp,
  Plus,
  Clock,
  CheckCircle,
  PlayCircle,
} from 'lucide-react'

interface DashboardStats {
  totalProjects: number
  totalAssets: number
  teamMembers: number
  recentProjects: Array<{
    id: string
    name: string
    status: string
    updatedAt: string
  }>
}

export default function DashboardClientPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    totalAssets: 0,
    teamMembers: 0,
    recentProjects: [],
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    // 模拟加载统计数据
    setTimeout(() => {
      setStats({
        totalProjects: 12,
        totalAssets: 156,
        teamMembers: 4,
        recentProjects: [
          { id: '1', name: '短剧预告片', status: '进行中', updatedAt: '2小时前' },
          { id: '2', name: '产品宣传片', status: '已完成', updatedAt: '1天前' },
          { id: '3', name: '教育动画', status: '草稿', updatedAt: '3天前' },
          { id: '4', name: '社交媒体广告', status: '已完成', updatedAt: '1周前' },
        ],
      })
      setIsLoading(false)
    }, 1000)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case '已完成':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case '进行中':
        return <PlayCircle className="w-4 h-4 text-blue-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-400">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 欢迎信息 */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          欢迎回来，{session?.user?.name?.split(' ')[0] || '创作者'}！
        </h1>
        <p className="text-gray-400 mt-2">
          今天开始创作你的下一个AI视频项目
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              总项目数
            </CardTitle>
            <Film className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-green-400 mt-1">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              +2 本月
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              资产库
            </CardTitle>
            <Sparkles className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssets}</div>
            <p className="text-xs text-gray-400 mt-1">个创意资产</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              团队成员
            </CardTitle>
            <Users className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.teamMembers}</div>
            <p className="text-xs text-gray-400 mt-1">协作创作</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 border-purple-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              AI积分
            </CardTitle>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">850</div>
            <p className="text-xs text-gray-300 mt-1">可用额度</p>
          </CardContent>
        </Card>
      </div>

      {/* 快速操作和最近项目 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* 快速操作 */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle>快速操作</CardTitle>
            <CardDescription>常用功能快速入口</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              className="w-full justify-start bg-purple-600 hover:bg-purple-700"
              onClick={() => router.push('/dashboard/projects/new')}
            >
              <Plus className="w-4 h-4 mr-2" />
              创建新项目
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start border-gray-700"
              onClick={() => router.push('/dashboard/assets')}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              上传资产
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start border-gray-700"
              onClick={() => router.push('/dashboard/projects')}
            >
              <Film className="w-4 h-4 mr-2" />
              浏览项目库
            </Button>
          </CardContent>
        </Card>

        {/* 最近项目 */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle>最近项目</CardTitle>
            <CardDescription>你最近工作的项目</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors cursor-pointer"
                  onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(project.status)}
                    <div>
                      <p className="font-medium text-sm">{project.name}</p>
                      <p className="text-xs text-gray-400">{project.updatedAt}</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-700">
                    {project.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 入门指南 */}
      <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white">快速入门指南</CardTitle>
          <CardDescription>新用户必看：3步开始你的AI视频创作</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
              1
            </div>
            <div>
              <h4 className="font-medium text-white">创建项目</h4>
              <p className="text-sm text-gray-400">
                选择项目类型（短剧、动画、广告等），设置基本参数
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
              2
            </div>
            <div>
              <h4 className="font-medium text-white">编写剧本</h4>
              <p className="text-sm text-gray-400">
                使用AI助手分析剧本、提取角色、设计场景
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
              3
            </div>
            <div>
              <h4 className="font-medium text-white">生成视频</h4>
              <p className="text-sm text-gray-400">
                使用工作流编排，一键生成完整视频
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
