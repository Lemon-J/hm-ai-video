# AI短剧工具平台 🎬

基于Next.js 15 + React 19 + Prisma + Redis + Docker的AI视频生成平台，整合Hollywood流程、Jellyfish资产复用和BigBanana首尾帧驱动方法。

## ✨ 特性亮点

### 🎯 核心功能
- **剧本智能分析** - AI自动解析剧本结构、角色、情感变化
- **角色一致性管理** - 全局种子控制，确保角色视觉一致性
- **可视化工作流** - React Flow驱动的Hollywood标准流程
- **多AI供应商** - Gemini/Claude/Seedance/Kling一键切换
- **资产库管理** - 角色、场景、道具的统一管理和复用
- **关键帧驱动生成** - BigBanana方法避免随机抽卡

### 🔧 技术栈
- **前端**: Next.js 15 (App Router) + React 19 + TypeScript
- **UI组件**: Shadcn UI + Tailwind CSS (暗黑主题)
- **状态管理**: Zustand + React Query
- **可视化**: React Flow (工作流画布)
- **后端**: Next.js API Routes + Prisma ORM
- **数据库**: PostgreSQL + Redis (缓存/队列)
- **容器化**: Docker + Docker Compose
- **文件上传**: Uploadthing
- **认证**: NextAuth.js (OAuth)

## 🚀 快速开始

### 环境准备
1. **Node.js** 18+ 和 **Docker** + **Docker Compose**
2. **AI API密钥** (至少一个):
   - Google Gemini API
   - Anthropic Claude API
   - Seedance API (视频生成)
   - Kling API (视频生成)

### 安装步骤

```bash
# 1. 克隆项目
git clone <repository-url>
cd HM-Ai-video

# 2. 复制环境变量
cp .env.example .env.local
# 编辑 .env.local 填入您的API密钥

# 3. 使用Docker启动服务
npm run docker:up

# 4. 安装依赖
npm install

# 5. 初始化数据库
npx prisma generate
npx prisma db push

# 6. 启动开发服务器
npm run dev
```

访问 http://localhost:3000 开始使用！

## 📁 项目结构

```
HM-Ai-video/
├── app/                    # Next.js 15 App Router
│   ├── (auth)/           # 认证相关页面
│   ├── (dashboard)/      # 仪表板页面
│   ├── api/             # API路由
│   └── layouts/         # 布局组件
├── components/           # React组件
│   ├── ui/             # Shadcn UI组件
│   ├── projects/       # 项目相关组件
│   ├── assets/         # 资产管理组件
│   ├── workflow/       # 工作流组件
│   └── ai/             # AI集成组件
├── lib/                 # 核心工具库
│   ├── ai/             # AI服务集成
│   ├── prompts/        # Prompt模板库
│   └── workflows/      # 工作流引擎
├── prisma/             # 数据库ORM
├── docker/             # Docker配置
├── types/              # TypeScript类型定义
├── store/              # Zustand状态管理
└── utils/              # 工具函数
```

## 🎨 核心功能详解

### 1. Hollywood标准流程 🎬
完整的短剧生成流水线：
```
剧本输入 → 剧本分析 → 角色提取 → 场景生成 → 分镜生成 → 配音合成 → 视频生成 → 后期处理 → 导出
```

### 2. Jellyfish资产复用 🎯
- **全局种子管理**: 确保角色视觉一致性
- **资产库**: 角色、场景、道具的统一存储
- **复用统计**: 跟踪资产使用效率
- **模板化**: 快速复用成功案例

### 3. BigBanana首尾帧驱动 🍌
- **关键帧设计**: 精确控制起始和结束画面
- **中间帧生成**: AI自动补全过渡帧
- **避免抽卡**: 确定性视频生成结果
- **创意控制**: 导演级别的画面控制

### 4. 多AI供应商集成 🤖
| 供应商 | 擅长领域 | 成本 | 速度 |
|--------|----------|------|------|
| **Gemini** | 文本生成、分析 | $$ | ⚡⚡⚡ |
| **Claude** | 剧本分析、角色设计 | $$$ | ⚡⚡ |
| **Seedance** | 视频生成、一致性 | $$$$ | ⚡ |
| **Kling** | 视频生成、创意 | $$$$ | ⚡ |

## 🗄️ 数据库设计

### 核心数据模型
```prisma
model Project {
  id          String
  name        String
  type        ProjectType
  scripts     Script[]
  characters  Character[]
  scenes      Scene[]
  videoClips  VideoClip[]
  workflows   Workflow[]
}

model Character {
  id          String
  name        String
  appearance  Json      # 外观描述
  seed        String?   # 全局种子
  isTemplate  Boolean   # 是否模板
  usageCount  Int       # 使用次数
}

model Workflow {
  id          String
  nodes       Json      # React Flow节点
  edges       Json      # React Flow连接
  config      Json      # 工作流配置
  isTemplate  Boolean   # 是否模板
}
```

## 🎯 使用场景

### 个人创作者
- **社交媒体内容**: 快速生成抖音/B站短视频
- **个人作品集**: 制作动画短片展示技能
- **教育视频**: 将知识转化为视觉内容

### 企业用户
- **品牌营销**: 自动化生成产品宣传视频
- **教育培训**: 制作标准化培训材料
- **电商直播**: 生成商品展示视频

### 专业团队
- **影视预演**: 快速制作故事板和预演视频
- **广告制作**: 批量生成广告素材
- **游戏开发**: 制作游戏过场动画

## 🔧 API参考

### 核心端点
```http
POST /api/projects        # 创建项目
GET  /api/projects/:id    # 获取项目详情
POST /api/scripts/analyze # 剧本分析
POST /api/assets/upload   # 上传资产
POST /api/workflows/run   # 执行工作流
POST /api/ai/generate     # AI生成请求
```

### AI服务接口
```typescript
// 剧本分析
const analysis = await aiService.analyzeScript(script)

// 视频生成
const video = await aiService.generateVideo({
  script: "剧本内容",
  style: "cinematic",
  duration: 60,
})

// 成本估算
const estimate = await aiService.estimateCost(request)
```

## 🚀 部署指南

### Docker部署
```bash
# 生产环境构建
docker-compose -f docker-compose.prod.yml up -d

# 查看日志
docker-compose logs -f app

# 数据库备份
docker-compose exec db pg_dump -U postgres ai_video > backup.sql
```

### Vercel部署
1. 连接GitHub仓库
2. 配置环境变量
3. 设置数据库连接
4. 部署自动构建

### 自托管部署
```bash
# 1. 构建镜像
docker build -t ai-video-platform .

# 2. 运行容器
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL=postgresql://... \
  -e REDIS_URL=redis://... \
  ai-video-platform
```

## 📊 性能优化

### 数据库优化
- PostgreSQL连接池配置
- Redis缓存热点数据
- Prisma查询优化

### 前端优化
- Next.js静态生成
- React组件懒加载
- 图片优化和CDN

### AI服务优化
- 请求批处理
- 结果缓存
- 失败重试机制

## 🔒 安全考虑

### 数据安全
- **加密存储**: 敏感数据AES-256加密
- **访问控制**: RBAC权限管理
- **审计日志**: 所有操作记录

### API安全
- **速率限制**: 防止滥用
- **输入验证**: 防止注入攻击
- **CORS配置**: 严格域控制

### AI安全
- **内容过滤**: 防止生成不当内容
- **使用限制**: 配额管理
- **成本控制**: 预算限制

## 🤝 贡献指南

### 开发流程
1. Fork项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

### 代码规范
- 使用TypeScript严格模式
- 遵循ESLint配置
- 编写单元测试
- 更新相关文档

## 📝 路线图

### 短期目标 (Q1 2025)
- [ ] 集成更多AI视频生成服务
- [ ] 添加实时协作功能
- [ ] 优化移动端体验
- [ ] 增加模板市场

### 中期目标 (Q2 2025)
- [ ] 支持3D角色生成
- [ ] 添加AR预览功能
- [ ] 集成专业音频工具
- [ ] 构建插件系统

### 长期愿景
- [ ] 实时视频生成
- [ ] 多语言支持
- [ ] 企业级SaaS平台
- [ ] 开源社区生态

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

感谢以下项目的启发：
- **waoowaoo**: Hollywood团队流程实践
- **Jellyfish**: 资产复用和一致性解决方案  
- **BigBanana**: 首尾帧驱动视频生成方法
- **开源社区**: 所有依赖库的贡献者

## 📧 联系我们

- **问题反馈**: GitHub Issues
- **功能建议**: GitHub Discussions
- **商业合作**: business@example.com
- **技术咨询**: tech@example.com

---

**AI短剧工具平台** - 让视频创作变得简单高效！ 🚀