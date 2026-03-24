import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  Users, 
  Video, 
  Workflow,
  Zap
} from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  trend: "up" | "down" | "neutral"
  trendValue: string
  color: string
}

const stats: StatCardProps[] = [
  {
    title: "活跃项目",
    value: "12",
    description: "正在进行的项目数量",
    icon: FileText,
    trend: "up",
    trendValue: "+2",
    color: "text-blue-500",
  },
  {
    title: "角色资产",
    value: "47",
    description: "创建的角色数量",
    icon: Users,
    trend: "up",
    trendValue: "+8",
    color: "text-purple-500",
  },
  {
    title: "生成视频",
    value: "156",
    description: "总生成视频片段",
    icon: Video,
    trend: "up",
    trendValue: "+24",
    color: "text-green-500",
  },
  {
    title: "工作流运行",
    value: "89",
    description: "自动化工作流执行次数",
    icon: Workflow,
    trend: "neutral",
    trendValue: "0",
    color: "text-orange-500",
  },
  {
    title: "AI调用",
    value: "2.4K",
    description: "AI服务调用次数",
    icon: Zap,
    trend: "up",
    trendValue: "+12%",
    color: "text-pink-500",
  },
]

function StatCard({ stat }: { stat: StatCardProps }) {
  const Icon = stat.icon
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold">{stat.value}</h3>
              <div className={cn(
                "flex items-center text-xs font-medium",
                stat.trend === "up" && "text-green-500",
                stat.trend === "down" && "text-red-500",
                stat.trend === "neutral" && "text-gray-500"
              )}>
                {stat.trend === "up" && <TrendingUp className="h-3 w-3 mr-1" />}
                {stat.trend === "down" && <TrendingDown className="h-3 w-3 mr-1" />}
                {stat.trendValue}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </div>
          <div className={cn("p-3 rounded-full", stat.color.replace("text-", "bg-") + "/10")}>
            <Icon className={cn("h-6 w-6", stat.color)} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function QuickStats() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>快速统计</CardTitle>
        <CardDescription>项目概览和关键指标</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {stats.map((stat) => (
            <StatCard key={stat.title} stat={stat} />
          ))}
        </div>
        
        {/* 总结区域 */}
        <div className="mt-6 pt-6 border-t">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">平均生成时间</p>
              <p className="text-lg font-semibold">2分15秒</p>
              <p className="text-xs text-green-500">-30秒 对比上月</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">成本效率</p>
              <p className="text-lg font-semibold">78%</p>
              <p className="text-xs text-green-500">+5% 优化</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}