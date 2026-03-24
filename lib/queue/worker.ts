import { Worker, Job } from 'bullmq';

// 队列连接配置
const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
};

// 任务类型定义
export interface WorkflowJobData {
  workflowId: string;
  projectId: string;
  step: string;
  config: any;
  priority?: number;
  retryCount?: number;
}

// 任务结果定义
export interface WorkflowJobResult {
  success: boolean;
  data?: any;
  error?: string;
  step: string;
  timestamp: number;
}

// 创建 Worker
export const workflowWorker = new Worker<WorkflowJobData, WorkflowJobResult>(
  'workflow',
  async (job: Job<WorkflowJobData>) => {
    const { workflowId, projectId, step, config } = job.data;

    try {
      job.log(`开始执行工作流步骤: ${step}`);
      job.updateProgress(0);

      // 根据步骤类型分发到不同的处理器
      const result = await processStep(step, config, job);

      job.updateProgress(100);
      job.log(`步骤 ${step} 执行完成`);

      return {
        success: true,
        data: result,
        step,
        timestamp: Date.now(),
      };
    } catch (error) {
      job.log(`步骤 ${step} 执行失败: ${error}`);
      
      // 检查是否应该重试
      const retryCount = job.data.retryCount || 0;
      if (retryCount < 3) {
        throw error; // BullMQ 会自动重试
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        step,
        timestamp: Date.now(),
      };
    }
  },
  {
    connection,
    concurrency: 5, // 并发任务数
    limiter: {
      max: 100, // 每 100 个任务
      duration: 60000, // 在 60 秒内
    },
  }
);

// 步骤处理器映射
const stepHandlers: Record<string, (config: any, job: Job) => Promise<any>> = {
  'script-analysis': async (config, job) => {
    // TODO: 实现剧本分析逻辑
    return { analysis: null };
  },
  'character-design': async (config, job) => {
    // TODO: 实现角色设计逻辑
    return { characters: [] };
  },
  'scene-generation': async (config, job) => {
    // TODO: 实现场景生成逻辑
    return { scenes: [] };
  },
  'storyboard': async (config, job) => {
    // TODO: 实现分镜生成逻辑
    return { storyboards: [] };
  },
  'keyframe-design': async (config, job) => {
    // TODO: 实现关键帧设计逻辑
    return { keyframes: [] };
  },
  'video-generation': async (config, job) => {
    // TODO: 实现视频生成逻辑
    return { videoUrl: '' };
  },
  'voice-synthesis': async (config, job) => {
    // TODO: 实现语音合成逻辑
    return { audioUrl: '' };
  },
  'subtitle-generation': async (config, job) => {
    // TODO: 实现字幕生成逻辑
    return { subtitles: [] };
  },
  'post-processing': async (config, job) => {
    // TODO: 实现后期处理逻辑
    return { videoUrl: '' };
  },
};

// 步骤处理函数
async function processStep(step: string, config: any, job: Job): Promise<any> {
  const handler = stepHandlers[step];
  if (!handler) {
    throw new Error(`未知的步骤类型: ${step}`);
  }

  // 更新进度
  job.updateProgress(10);
  
  // 执行处理器
  const result = await handler(config, job);
  
  job.updateProgress(90);
  
  return result;
}

// 错误处理
workflowWorker.on('failed', (job: Job<WorkflowJobData> | undefined, error: Error) => {
  if (job) {
    console.error(`任务失败 [${job.id}]: ${error.message}`);
    console.error(`重试次数: ${job.attemptsMade}/${job.opts.attempts}`);
  }
});

// 任务完成
workflowWorker.on('completed', (job: Job<WorkflowJobData>, result: WorkflowJobResult) => {
  console.log(`任务完成 [${job.id}]: ${result.step}`);
  console.log(`耗时: ${Date.now() - job.timestamp}ms`);
});

// Worker 关闭处理
process.on('SIGTERM', async () => {
  await workflowWorker.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await workflowWorker.close();
  process.exit(0);
});

export default workflowWorker;
