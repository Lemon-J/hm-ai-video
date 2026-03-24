import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('开始数据填充...')

  // 创建测试用户
  const hashedPassword = await bcrypt.hash('password123', 10)
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: '测试用户',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
    },
  })

  console.log('✓ 用户创建成功:', user.email)

  // 创建测试项目
  const project = await prisma.project.create({
    data: {
      name: '示例短剧项目',
      description: '这是一个示例短剧项目',
      type: 'SHORT_DRAMA',
      status: 'DRAFT',
      userId: user.id,
    },
  })

  console.log('✓ 项目创建成功:', project.name)

  // 创建测试剧本
  const script = await prisma.script.create({
    data: {
      title: '都市情感短剧',
      content: {
        scenes: [
          {
            id: '1',
            title: '开场',
            content: '清晨的阳光洒在阳台上，小雅正在浇花。',
            characters: ['小雅'],
          },
          {
            id: '2',
            title: '相遇',
            content: '小雅在咖啡厅遇见了小明，两人相视一笑。',
            characters: ['小雅', '小明'],
          },
        ],
      },
      summary: '一段关于城市爱情的温馨故事',
      metadata: {
        totalScenes: 2,
        characters: ['小雅', '小明'],
        genre: '爱情',
        duration: 120,
      },
      projectId: project.id,
      userId: user.id,
    },
  })

  console.log('✓ 剧本创建成功:', script.title)

  // 创建测试角色
  const character1 = await prisma.character.create({
    data: {
      name: '小雅',
      description: '25岁，温柔善良的都市白领',
      traits: ['温柔', '善良', '乐观'],
      appearance: {
        age: 25,
        height: 165,
        hair: '黑色长发',
        eyes: '棕色',
        style: '简约时尚',
      },
      voiceStyle: '温柔女声',
      seed: 'character_xiaoya_001',
      isTemplate: true,
      usageCount: 0,
      tags: ['主角', '女性'],
      projectId: project.id,
      userId: user.id,
    },
  })

  const character2 = await prisma.character.create({
    data: {
      name: '小明',
      description: '27岁，阳光开朗的创业青年',
      traits: ['阳光', '开朗', '有担当'],
      appearance: {
        age: 27,
        height: 178,
        hair: '黑色短发',
        eyes: '黑色',
        style: '休闲运动',
      },
      voiceStyle: '阳光男声',
      seed: 'character_xiaoming_001',
      isTemplate: true,
      usageCount: 0,
      tags: ['主角', '男性'],
      projectId: project.id,
      userId: user.id,
    },
  })

  console.log('✓ 角色创建成功:', character1.name, character2.name)

  // 创建测试场景
  await prisma.scene.createMany({
    data: [
      {
        scriptId: script.id,
        projectId: project.id,
        order: 1,
        title: '开场 - 阳台',
        description: '清晨的阳光洒在阳台上，小雅正在浇花',
        location: '公寓阳台',
        timeOfDay: '早晨',
        mood: '温馨',
        characters: JSON.stringify(['小雅']),
        dialogue: JSON.stringify([
          { character: '小雅', text: '今天是个好天气呢' },
        ]),
        actions: JSON.stringify([
          { character: '小雅', action: '轻轻浇水' },
        ]),
        shotType: '中景',
        cameraAngle: '正面',
        duration: 30,
        status: 'PENDING',
      },
      {
        scriptId: script.id,
        projectId: project.id,
        order: 2,
        title: '相遇 - 咖啡厅',
        description: '小雅在咖啡厅遇见了小明，两人相视一笑',
        location: '街角咖啡厅',
        timeOfDay: '上午',
        mood: '浪漫',
        characters: JSON.stringify(['小雅', '小明']),
        dialogue: JSON.stringify([
          { character: '小明', text: '你好，可以坐这里吗？' },
          { character: '小雅', text: '当然可以' },
        ]),
        actions: JSON.stringify([
          { character: '小明', action: '微笑点头' },
          { character: '小雅', action: '友好示意' },
        ]),
        shotType: '近景',
        cameraAngle: '侧面',
        duration: 40,
        status: 'PENDING',
      },
    ],
  })

  console.log('✓ 场景创建成功: 2个场景')

  // 创建示例工作流
  const workflow = await prisma.workflow.create({
    data: {
      name: '标准短剧工作流',
      description: 'Hollywood标准短剧制作流程',
      projectId: project.id,
      userId: user.id,
      nodes: {
        nodes: [
          { id: '1', type: 'scriptAnalysis', position: { x: 100, y: 100 } },
          { id: '2', type: 'characterExtraction', position: { x: 100, y: 250 } },
          { id: '3', type: 'sceneGeneration', position: { x: 100, y: 400 } },
          { id: '4', type: 'voiceSynthesis', position: { x: 100, y: 550 } },
          { id: '5', type: 'videoGeneration', position: { x: 100, y: 700 } },
        ],
      },
      edges: {
        edges: [
          { id: 'e1-2', source: '1', target: '2' },
          { id: 'e2-3', source: '2', target: '3' },
          { id: 'e3-4', source: '3', target: '4' },
          { id: 'e4-5', source: '4', target: '5' },
        ],
      },
      config: {
        parallel: false,
        autoExecute: false,
      },
      isTemplate: true,
    },
  })

  console.log('✓ 工作流创建成功:', workflow.name)

  // 创建示例资产
  await prisma.asset.createMany({
    data: [
      {
        name: '示例角色图片',
        type: 'IMAGE',
        category: 'CHARACTER',
        url: 'https://example.com/assets/character.jpg',
        mimeType: 'image/jpeg',
        fileSize: BigInt(102400),
        characterId: character1.id,
        projectId: project.id,
        userId: user.id,
        tags: ['角色', '示例'],
        seed: 'asset_001',
        aiModel: 'DALL-E-3',
        prompt: 'Generate a beautiful young woman with long black hair',
        isGlobal: false,
        isPublic: false,
        usageCount: 0,
      },
      {
        name: '示例背景音乐',
        type: 'AUDIO',
        category: 'MUSIC',
        url: 'https://example.com/assets/music.mp3',
        mimeType: 'audio/mpeg',
        fileSize: BigInt(512000),
        projectId: project.id,
        userId: user.id,
        tags: ['音乐', '背景'],
        isGlobal: true,
        isPublic: false,
        usageCount: 0,
      },
    ],
  })

  console.log('✓ 资产创建成功: 2个资产')

  // 创建示例订阅
  await prisma.subscription.create({
    data: {
      userId: user.id,
      plan: 'FREE',
      status: 'ACTIVE',
      maxProjects: 3,
      maxAssets: 50,
      maxVideoMinutes: 10,
      aiCredits: 1000,
    },
  })

  console.log('✓ 订阅创建成功: FREE计划')

  console.log('\n数据填充完成! ✨')
  console.log('测试账户: test@example.com')
}

main()
  .catch((e) => {
    console.error('数据填充失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
