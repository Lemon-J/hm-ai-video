import { Queue, QueueEvents } from 'bullmq';
import type { WorkflowJobData, WorkflowJobResult } from './worker';

// 队列连接配置
const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
};

// 延迟初始化队列
let workflowQueue: Queue<WorkflowJobData> | null = null;
let workflowQueueEvents: QueueEvents | null = null;

function getQueue() {
  if (!workflowQueue) {
    workflowQueue = new Queue<WorkflowJobData>('workflow', {
      connection,
      defaultJobOptions: {
        removeOnComplete: {
          count: 100,
          age: 86400,
        },
        removeOnFail: {
          count: 500,
          age: 604800,
        },
      },
    });
  }
  return workflowQueue;
}

function getQueueEvents() {
  if (!workflowQueueEvents) {
    workflowQueueEvents = new QueueEvents('workflow', {
      connection,
    });

    // 队列事件监听
    workflowQueueEvents.on('waiting', ({ jobId }) => {
      console.log(`任务进入等待队列: ${jobId}`);
    });

    workflowQueueEvents.on('active', ({ jobId }) => {
      console.log(`任务开始执行: ${jobId}`);
    });

    workflowQueueEvents.on('completed', ({ jobId, returnvalue }) => {
      console.log(`任务完成: ${jobId}`, returnvalue);
    });

    workflowQueueEvents.on('failed', ({ jobId, failedReason }) => {
      console.error(`任务失败: ${jobId}`, failedReason);
    });

    workflowQueueEvents.on('progress', ({ jobId, data }) => {
      console.log(`任务进度更新: ${jobId}`, data);
    });
  }
  return workflowQueueEvents;
}

// 添加任务到队列
export async function addWorkflowJob(data: WorkflowJobData, options?: any) {
  const queue = getQueue();
  const job = await queue.add('workflow', data, {
    ...options,
    jobId: data.workflowId + '-' + data.step, // 唯一任务ID
  });
  return job;
}

// 添加批量任务(用于并行执行)
export async function addBatchWorkflowJobs(jobs: WorkflowJobData[]) {
  const queue = getQueue();
  const addedJobs = await queue.addBulk(
    jobs.map(data => ({
      name: 'workflow',
      data,
      opts: {
        jobId: data.workflowId + '-' + data.step,
      },
    }))
  );
  return addedJobs;
}

// 获取任务状态
export async function getJobStatus(jobId: string) {
  const queue = getQueue();
  const job = await queue.getJob(jobId);
  if (!job) return null;

  const state = await job.getState();
  const progress = job.progress;

  return {
    id: job.id,
    state,
    progress,
    data: job.data,
    result: await job.getState() === 'completed' ? await job.returnvalue : null,
    failedReason: await job.getState() === 'failed' ? job.failedReason : null,
    attemptsMade: job.attemptsMade,
    processedOn: job.processedOn,
    finishedOn: job.finishedOn,
  };
}

// 获取队列统计
export async function getQueueStats() {
  const queue = getQueue();
  const waiting = await queue.getWaiting();
  const active = await queue.getActive();
  const completed = await queue.getCompleted();
  const failed = await queue.getFailed();
  const delayed = await queue.getDelayed();

  return {
    waiting: waiting.length,
    active: active.length,
    completed: completed.length,
    failed: failed.length,
    delayed: delayed.length,
  };
}

// 重试失败的任务
export async function retryFailedJob(jobId: string) {
  const queue = getQueue();
  const job = await queue.getJob(jobId);
  if (!job) throw new Error('任务不存在');

  if (job.failedReason) {
    await job.retry();
    return true;
  }
  return false;
}

// 删除任务
export async function removeJob(jobId: string) {
  const queue = getQueue();
  const job = await queue.getJob(jobId);
  if (!job) throw new Error('任务不存在');

  await job.remove();
  return true;
}

// 清空队列(谨慎使用)
export async function clearQueue() {
  const queue = getQueue();
  await queue.drain();
  return true;
}

export default getQueue();
