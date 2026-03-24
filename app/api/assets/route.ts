import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import { AssetType, AssetCategory } from '@prisma/client'

// 获取资产列表
export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const global = searchParams.get('global') === 'true'

    const where: Record<string, unknown> = {
      userId: user.id,
      ...(type && { type: type as AssetType }),
      ...(category && { category: category as AssetCategory }),
      ...(global && { isGlobal: true }),
    }

    const assets = await prisma.asset.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        character: true,
      },
    })

    return NextResponse.json(assets)
  } catch (error) {
    console.error('获取资产列表失败:', error)
    return NextResponse.json(
      { error: '获取资产列表失败' },
      { status: 500 }
    )
  }
}

// 创建资产记录
export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    const body = await req.json()
    const {
      name,
      type,
      category,
      url,
      thumbnail,
      mimeType,
      fileSize,
      characterId,
      projectId,
      tags,
      description,
      seed,
      aiModel,
      prompt,
      isGlobal,
    } = body

    const asset = await prisma.asset.create({
      data: {
        name,
        type: type as AssetType,
        category: category as AssetCategory,
        url,
        thumbnail,
        mimeType,
        fileSize: BigInt(fileSize),
        characterId,
        projectId,
        userId: user.id,
        tags: tags || [],
        description,
        seed,
        aiModel,
        prompt,
        isGlobal: isGlobal || false,
      },
    })

    return NextResponse.json(asset, { status: 201 })
  } catch (error) {
    console.error('创建资产失败:', error)
    return NextResponse.json({ error: '创建资产失败' }, { status: 500 })
  }
}
