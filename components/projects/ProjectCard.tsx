import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Calendar,
  Users,
  Video,
  MoreVertical,
  FileText,
  PlayCircle,
  Edit,
  Trash2
} from "lucide-react"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDate } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface ProjectCardProps {
  project: {
    id: string
    name: string
    description: string
    status: "draft" | "active" | "completed" | "archived"
    type: "short_drama" | "animation" | "commercial" | "educational" | "experimental"
    progress: number
    updatedAt: Date
    sceneCount: number
    characterCount: number
  }
}

const statusConfig = {
  draft: {
    label: "草稿",
    variant: "outline" as const,
    color: "text-gray-500",
    bgColor: "bg-gray-500/10",
  },
  active: {
    label: "进行中",
    variant: "default" as const,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  completed: {
    label: "已完成",
    variant: "secondary" as const,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  archived: {
    label: "已归档",
    variant: "destructive" as const,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
}

const typeConfig = {
  short_drama: {
    label: "短剧",
    icon: Video,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  animation: {
    label: "动画",
    icon: PlayCircle,
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
  },
  commercial: {
    label: "商业",
    icon: FileText,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  educational: {
    label: "教育",
    icon: Users,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  experimental: {
    label: "实验",
    icon: Video,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
}

export function ProjectCard({ project }: ProjectCardProps) {
  const status = statusConfig[project.status]
  const type = typeConfig[project.type]
  const TypeIcon = type.icon

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg line-clamp-1">
              {project.name}
            </CardTitle>
            <CardDescription className="line-clamp-2">
              {project.description}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">打开菜单</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                编辑项目
              </DropdownMenuItem>
              <DropdownMenuItem>
                <PlayCircle className="mr-2 h-4 w-4" />
                继续创作
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                删除项目
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={status.variant}>
            {status.label}
          </Badge>
          <Badge variant="outline" className={cn("gap-1", status.color, status.bgColor)}>
            <TypeIcon className="h-3 w-3" />
            {type.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        {/* 进度条 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">完成进度</span>
            <span className="font-medium">{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-2" />
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-md bg-primary/10">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">{project.sceneCount}</p>
              <p className="text-xs text-muted-foreground">场景</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-md bg-secondary/10">
              <Users className="h-4 w-4 text-secondary" />
            </div>
            <div>
              <p className="text-sm font-medium">{project.characterCount}</p>
              <p className="text-xs text-muted-foreground">角色</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          更新于 {formatDate(project.updatedAt)}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8">
            查看
          </Button>
          <Button size="sm" className="h-8">
            继续
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}