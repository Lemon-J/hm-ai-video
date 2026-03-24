import { create } from 'zustand'
import { Workflow, WorkflowStatus } from '@prisma/client'
import { Node, Edge } from '@xyflow/react'

interface WorkflowState {
  workflows: Workflow[]
  currentWorkflow: Workflow | null
  nodes: Node[]
  edges: Edge[]
  isLoading: boolean
  isExecuting: boolean
  executionProgress: number
  error: string | null

  // Actions
  setWorkflows: (workflows: Workflow[]) => void
  setCurrentWorkflow: (workflow: Workflow | null) => void
  addWorkflow: (workflow: Workflow) => void
  updateWorkflow: (id: string, updates: Partial<Workflow>) => void
  deleteWorkflow: (id: string) => void

  // React Flow actions
  setNodes: (nodes: Node[]) => void
  setEdges: (edges: Edge[]) => void
  onNodesChange: (changes: any) => void
  onEdgesChange: (changes: any) => void
  onConnect: (connection: any) => void
  addNode: (node: Node) => void
  removeNode: (id: string) => void

  // Execution
  executeWorkflow: (workflowId: string) => Promise<void>
  setExecutionProgress: (progress: number) => void

  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  workflows: [],
  currentWorkflow: null,
  nodes: [],
  edges: [],
  isLoading: false,
  isExecuting: false,
  executionProgress: 0,
  error: null,

  setWorkflows: (workflows) => set({ workflows }),
  setCurrentWorkflow: (currentWorkflow) => set({ currentWorkflow }),

  addWorkflow: (workflow) =>
    set((state) => ({ workflows: [workflow, ...state.workflows] })),

  updateWorkflow: (id, updates) =>
    set((state) => ({
      workflows: state.workflows.map((w) =>
        w.id === id ? { ...w, ...updates } : w
      ),
      currentWorkflow:
        state.currentWorkflow?.id === id
          ? { ...state.currentWorkflow, ...updates }
          : state.currentWorkflow,
    })),

  deleteWorkflow: (id) =>
    set((state) => ({
      workflows: state.workflows.filter((w) => w.id !== id),
      currentWorkflow:
        state.currentWorkflow?.id === id ? null : state.currentWorkflow,
    })),

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  onNodesChange: (changes) =>
    set((state) => ({
      nodes: state.nodes.map((node) => {
        const change = changes.find((c: any) => c.id === node.id)
        if (change) {
          return {
            ...node,
            position: {
              x: change.position?.x ?? node.position.x,
              y: change.position?.y ?? node.position.y,
            },
            data: {
              ...node.data,
              label: change.label ?? node.data.label,
            },
          }
        }
        return node
      }),
    })),

  onEdgesChange: (changes) =>
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
    })),

  onConnect: (connection) =>
    set((state) => ({
      edges: addEdge(connection, state.edges),
    })),

  addNode: (node) =>
    set((state) => ({ nodes: [...state.nodes, node] })),

  removeNode: (id) =>
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== id),
      edges: state.edges.filter((e) => e.source !== id && e.target !== id),
    })),

  executeWorkflow: async (workflowId) => {
    set({ isExecuting: true, executionProgress: 0, error: null })
    try {
      const response = await fetch('/api/workflows', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflowId }),
      })

      if (!response.ok) {
        throw new Error('工作流执行失败')
      }

      // 模拟执行进度
      const progressInterval = setInterval(() => {
        const currentProgress = get().executionProgress
        if (currentProgress < 100) {
          set({
            executionProgress: Math.min(currentProgress + 10, 100),
          })
        } else {
          clearInterval(progressInterval)
          set({ isExecuting: false })
        }
      }, 500)

      const result = await response.json()
      console.log('工作流执行结果:', result)
    } catch (error: any) {
      set({ error: error.message, isExecuting: false })
    }
  },

  setExecutionProgress: (executionProgress) => set({ executionProgress }),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}))

// Helper functions for React Flow
function applyEdgeChanges(changes: any[], edges: Edge[]): Edge[] {
  return edges.filter((edge) => {
    return !changes.some((change) => {
      return change.type === 'remove' && change.id === edge.id
    })
  })
}

function addEdge(connection: any, edges: Edge[]): Edge[] {
  return [
    ...edges,
    {
      ...connection,
      id: `edge-${Date.now()}`,
      animated: true,
    },
  ]
}
