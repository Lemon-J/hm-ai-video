'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Film, Plus, Search, Filter, Clock, CheckCircle, PlayCircle } from 'lucide-react'

export default function ProjectsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const projects = [
    {
      id: '1',
      name: '短剧预告片',
      description: '都市情感短剧预告片制作',
      type: 'SHORT_DRAMA',
      status: 'IN_PROGRESS',
      updatedAt: '2小时前',
      thumbnail: '/images/project1.jpg',
    },
    {
      id: '2',
      name: '产品宣传片',
      description: '新产品上市的30秒宣传视频',
      type: 'COMMERCIAL',
      status: 'COMPLETED',
      updatedAt: '1天前',
      thumbnail: '/images/project2.jpg',
    },
    {
      id: '3',
      name: '教育动画',
      description: '科普教育类动画短片',
      type: 'ANIMATION',
      status: 'DRAFT',
      updatedAt: '3天前',
      thumbnail: '/images/project3.jpg',
    },
    {
      id: '4',
      name: '社交媒体广告',
      description: '抖音/快手短视频广告',
      type: 'COMMERCIAL',
      status: 'COMPLETED',
      updatedAt: '1周前',
      thumbnail: '/images/project4.jpg',
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'IN_PROGRESS':
        return <PlayCircle className="w-4 h-4 text-blue-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      DRAFT: '草稿',
      IN_PROGRESS: '进行中',
      REVIEW: '审核中',
      COMPLETED: '已完成',
      ARCHIVED: '已归档',
    }
    return statusMap[status] || status
  }

  const getTypeText = (type: string) => {
    const typeMap: Record<string, string> = {
      SHORT_DRAMA: '短剧',
      ANIMATION: '动画',
      COMMERCIAL: '商业广告',
      EDUCATIONAL: '教育视频',
      EXPERIMENTAL: '实验性',
    }
    return typeMap[type] || type
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">项目库</h1>
          <p className="text-gray-400 mt-2">管理和创建你的AI视频项目</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              新建项目
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-800">
            <DialogHeader>
              <DialogTitle className="text-white">创建新项目</DialogTitle>
              <DialogDescription className="text-gray-400">
                设置项目基本信息
              </DialogDescription>
            </DialogHeader>
            <CreateProjectForm onClose={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* 搜索和筛选 */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="搜索项目..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-800/50 border-gray-700"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40 bg-gray-800/50 border-gray-700">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="状态筛选" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="DRAFT">草稿</SelectItem>
            <SelectItem value="IN_PROGRESS">进行中</SelectItem>
            <SelectItem value="COMPLETED">已完成</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 项目网格 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card
            key={project.id}
            className="bg-gray-900/50 border-gray-800 cursor-pointer hover:border-purple-500/50 transition-all"
            onClick={() => router.push(`/dashboard/projects/${project.id}`)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg text-white">{project.name}</CardTitle>
                  <div className="flex items-center space-x-2 mt-2">
                    <Film className="w-3 h-3 text-purple-400" />
                    <span className="text-xs text-gray-400">
                      {getTypeText(project.type)}
                    </span>
                  </div>
                </div>
                {getStatusIcon(project.status)}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400 mb-4">{project.description}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>更新于 {project.updatedAt}</span>
                <span className="px-2 py-1 rounded-full bg-gray-800">
                  {getStatusText(project.status)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 空状态 */}
      {projects.length === 0 && (
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Film className="w-16 h-16 text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">暂无项目</h3>
            <p className="text-gray-400 text-center mb-6">
              创建你的第一个AI视频项目开始创作
            </p>
            <Button
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              创建项目
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function CreateProjectForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'SHORT_DRAMA',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: 调用API创建项目
    console.log('创建项目:', formData)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-white">项目名称</label>
        <Input
          placeholder="输入项目名称"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="bg-gray-800/50 border-gray-700"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-white">项目类型</label>
        <Select
          value={formData.type}
          onValueChange={(value) => setFormData({ ...formData, type: value })}
        >
          <SelectTrigger className="bg-gray-800/50 border-gray-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="SHORT_DRAMA">短剧</SelectItem>
            <SelectItem value="ANIMATION">动画</SelectItem>
            <SelectItem value="COMMERCIAL">商业广告</SelectItem>
            <SelectItem value="EDUCATIONAL">教育视频</SelectItem>
            <SelectItem value="EXPERIMENTAL">实验性</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-white">项目描述</label>
        <textarea
          placeholder="简要描述项目内容"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full min-h-24 px-3 py-2 text-sm bg-gray-800/50 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
        />
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="border-gray-700"
        >
          取消
        </Button>
        <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
          创建
        </Button>
      </div>
    </form>
  )
}
