import { createClient } from 'redis'

const globalForRedis = globalThis as unknown as {
  redis: ReturnType<typeof createClient> | undefined
}

let redisClient: ReturnType<typeof createClient> | null = null

function getRedis() {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error('Redis重连失败次数过多')
            return new Error('重连失败')
          }
          return Math.min(retries * 100, 3000)
        },
      },
    })

    if (process.env.NODE_ENV !== 'production') {
      globalForRedis.redis = redisClient
    }

    redisClient.on('error', (err) => console.error('Redis客户端错误:', err))
    redisClient.on('connect', () => console.log('Redis连接成功'))
  }

  return redisClient
}

export const redis = getRedis()

export const connectRedis = async () => {
  const client = getRedis()
  if (!client.isOpen) {
    await client.connect()
  }
  return client
}

export default getRedis()
