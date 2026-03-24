'use client'

import React from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { CheckCircle2, Clock, Loader2, AlertCircle } from 'lucide-react'

interface WorkflowNodeData {
  label: string
  nodeType: string
  status: 'idle' | 'running' | 'success' | 'error'
  config?: Record<string, unknown>
}

export function WorkflowNode(props: NodeProps) {
  const { data, selected } = props
  const typedData = data as unknown as WorkflowNodeData
  const getStatusIcon = () => {
    switch (typedData.status) {
      case 'running':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-green-400" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = () => {
    switch (typedData.status) {
      case 'running':
        return 'border-blue-500'
      case 'success':
        return 'border-green-500'
      case 'error':
        return 'border-red-500'
      default:
        return 'border-gray-700'
    }
  }

  const getNodeIcon = () => {
    const icons: Record<string, string> = {
      scriptAnalysis: '📝',
      characterExtraction: '👤',
      sceneGeneration: '🎬',
      voiceSynthesis: '🎙️',
      videoGeneration: '🎥',
      postProcessing: '✨',
    }
    return icons[typedData.nodeType] || '⚙️'
  }

  const getNodeTypeLabel = () => {
    const labels: Record<string, string> = {
      scriptAnalysis: '剧本分析',
      characterExtraction: '角色提取',
      sceneGeneration: '场景生成',
      voiceSynthesis: '语音合成',
      videoGeneration: '视频生成',
      postProcessing: '后期处理',
    }
    return labels[typedData.nodeType] || typedData.label
  }

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-purple-500 !w-3 !h-3"
      />
      <div
        className={`px-4 py-3 rounded-lg bg-gray-800 border-2 ${getStatusColor()} ${selected ? '!border-purple-500 shadow-lg shadow-purple-500/20' : ''}`}
        style={{
          minWidth: 160,
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xl">{getNodeIcon()}</span>
          {getStatusIcon()}
        </div>
        <h3 className="text-sm font-medium text-white mb-1">
          {getNodeTypeLabel()}
        </h3>
        <p className="text-xs text-gray-400">
          {typedData.status === 'running' ? '处理中...' : typedData.status === 'success' ? '完成' : typedData.status === 'error' ? '失败' : '待执行'}
        </p>
        {typedData.config && (
          <div className="mt-2 pt-2 border-t border-gray-700">
            <p className="text-xs text-gray-500">
              {Object.keys(typedData.config).length} 个配置项
            </p>
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-purple-500 !w-3 !h-3"
      />
    </>
  )
}
