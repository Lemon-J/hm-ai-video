'use client'

import React, { useCallback, useEffect, useMemo } from 'react'
import {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  MarkerType,
  ReactFlow,
  NodeTypes,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { WorkflowToolbar } from './WorkflowToolbar'
import { WorkflowNode } from './WorkflowNode'
import { useWorkflowStore } from '@/store'

const nodeTypes: NodeTypes = {
  workflowNode: WorkflowNode,
}

export default function WorkflowCanvas() {
  const { nodes, edges, setNodes, setEdges, onNodesChange, onEdgesChange, onConnect } =
    useWorkflowStore()

  const [localNodes, setLocalNodes, onLocalNodesChange] = useNodesState(nodes)
  const [localEdges, setLocalEdges, onLocalEdgesChange] = useEdgesState(edges)

  // 同步store状态
  useEffect(() => {
    setNodes(localNodes)
    setEdges(localEdges)
  }, [localNodes, localEdges, setNodes, setEdges])

  const handleConnect = useCallback(
    (connection: Connection) => {
      const newEdge: Edge = {
        ...connection,
        id: `edge-${connection.source}-${connection.target}-${Date.now()}`,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
        },
        animated: true,
        style: { stroke: '#a855f7' },
      }
      setLocalEdges((eds) => addEdge(newEdge, eds))
      onConnect(connection)
    },
    [setLocalEdges, onConnect]
  )

  const addNode = useCallback((type: string, position: { x: number; y: number }) => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: 'workflowNode',
      position,
      data: {
        label: type,
        nodeType: type,
        status: 'idle',
      },
    }
    setLocalNodes((nds) => [...nds, newNode])
  }, [setLocalNodes])

  const handleDeleteNode = useCallback((nodeId: string) => {
    setLocalNodes((nds) => nds.filter((n) => n.id !== nodeId))
    setLocalEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId))
  }, [setLocalNodes, setLocalEdges])

  return (
    <div className="w-full h-full flex flex-col">
      <WorkflowToolbar onAddNode={addNode} />
      <div className="flex-1 relative">
        <ReactFlow
          nodes={localNodes}
          edges={localEdges}
          onNodesChange={onLocalNodesChange}
          onEdgesChange={onLocalEdgesChange}
          onConnect={handleConnect}
          onNodeClick={(_event, node) => {
            console.log('Node clicked:', node)
          }}
          onNodeDoubleClick={(_event, node) => {
            handleDeleteNode(node.id)
          }}
          nodeTypes={nodeTypes}
          fitView
          className="bg-gray-900"
        >
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#374151" />
          <Controls
            className="!bg-gray-800 !border-gray-700"
            style={{
              background: '#1f2937',
              border: '1px solid #374151',
            }}
          />
          <MiniMap
            className="!bg-gray-800"
            nodeColor="#a855f7"
            maskColor="rgba(0, 0, 0, 0.5)"
            style={{
              background: '#1f2937',
            }}
          />
        </ReactFlow>
      </div>
      <div className="p-2 bg-gray-800 border-t border-gray-700 text-xs text-gray-400">
        <p>提示：双击节点可删除，拖拽节点可移动</p>
      </div>
    </div>
  )
}
