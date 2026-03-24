'use client'

import { Button } from '@/components/ui/button'
import { Play, Save, Download, Upload, Undo, Redo, Trash2 } from 'lucide-react'

interface WorkflowToolbarProps {
  onAddNode: (type: string, position: { x: number; y: number }) => void
}

export function WorkflowToolbar({ onAddNode }: WorkflowToolbarProps) {
  const nodeTypes = [
    { type: 'scriptAnalysis', label: '剧本分析', icon: '📝' },
    { type: 'characterExtraction', label: '角色提取', icon: '👤' },
    { type: 'sceneGeneration', label: '场景生成', icon: '🎬' },
    { type: 'voiceSynthesis', label: '语音合成', icon: '🎙️' },
    { type: 'videoGeneration', label: '视频生成', icon: '🎥' },
    { type: 'postProcessing', label: '后期处理', icon: '✨' },
  ]

  const handleAddNode = (type: string) => {
    const position = {
      x: Math.random() * 500,
      y: Math.random() * 300,
    }
    onAddNode(type, position)
  }

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
      <div className="flex items-center space-x-2">
        {nodeTypes.map((nodeType) => (
          <Button
            key={nodeType.type}
            variant="outline"
            size="sm"
            onClick={() => handleAddNode(nodeType.type)}
            className="border-gray-700 hover:bg-purple-600/20"
          >
            <span className="mr-2">{nodeType.icon}</span>
            {nodeType.label}
          </Button>
        ))}
      </div>

      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" className="border-gray-700">
          <Undo className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" className="border-gray-700">
          <Redo className="w-4 h-4" />
        </Button>
        <div className="w-px h-6 bg-gray-700 mx-2" />
        <Button variant="outline" size="sm" className="border-gray-700">
          <Save className="w-4 h-4 mr-2" />
          保存
        </Button>
        <Button variant="outline" size="sm" className="border-gray-700">
          <Upload className="w-4 h-4 mr-2" />
          导入
        </Button>
        <Button variant="outline" size="sm" className="border-gray-700">
          <Download className="w-4 h-4 mr-2" />
          导出
        </Button>
        <div className="w-px h-6 bg-gray-700 mx-2" />
        <Button variant="outline" size="sm" className="border-red-700 hover:bg-red-600/20">
          <Trash2 className="w-4 h-4 mr-2" />
          清空
        </Button>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Play className="w-4 h-4 mr-2" />
          执行
        </Button>
      </div>
    </div>
  )
}
