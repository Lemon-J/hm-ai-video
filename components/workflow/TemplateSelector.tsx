import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WORKFLOW_TEMPLATES } from "@/types/workflow"
import { 
  Film,
  Users,
  Key,
  Clock,
  Zap,
  TrendingUp,
  CheckCircle,
  Star
} from "lucide-react"
import { cn } from "@/lib/utils"

interface TemplateSelectorProps {
  onApplyTemplate: (template: any) => void
}

const categoryIcons = {
  hollywood: Film,
  custom: Users,
  experimental: Zap,
}

const complexityColors = {
  simple: "bg-green-500",
  medium: "bg-yellow-500",
  complex: "bg-red-500",
}

export function TemplateSelector({ onApplyTemplate }: TemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const categories = [
    { id: "all", label: "全部", count: WORKFLOW_TEMPLATES.length },
    { id: "hollywood", label: "Hollywood流程", count: WORKFLOW_TEMPLATES.filter(t => t.category === "hollywood").length },
    { id: "custom", label: "自定义", count: WORKFLOW_TEMPLATES.filter(t => t.category === "custom").length },
    { id: "experimental", label: "实验性", count: WORKFLOW_TEMPLATES.filter(t => t.category === "experimental").length },
  ]

  const filteredTemplates = selectedCategory === "all" 
    ? WORKFLOW_TEMPLATES 
    : WORKFLOW_TEMPLATES.filter(t => t.category === selectedCategory)

  return (
    <div className="h-full flex flex-col">
      {/* 分类筛选 */}
      <div className="p-4 border-b">
        <h3 className="font-semibold mb-2">工作流模板</h3>
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid grid-cols-4">
            {categories.map((category) => (
              <TabsTrigger 
                key={category.id} 
                value={category.id}
                className="flex flex-col h-auto py-2"
              >
                <span>{category.label}</span>
                <span className="text-xs text-muted-foreground">{category.count}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* 模板列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredTemplates.map((template) => {
          const CategoryIcon = categoryIcons[template.category]
          
          return (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      {template.name}
                      {template.usageCount > 1000 && (
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                      )}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">
                      {template.description}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <CategoryIcon className="h-3 w-3" />
                    {template.category}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pb-3">
                {/* 标签 */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {template.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* 统计信息 */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-muted">
                      <TrendingUp className="h-3 w-3" />
                    </div>
                    <div>
                      <div className="font-medium">{template.usageCount}</div>
                      <div className="text-xs text-muted-foreground">使用次数</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-muted">
                      <Clock className="h-3 w-3" />
                    </div>
                    <div>
                      <div className="font-medium">{template.estimatedTime}秒</div>
                      <div className="text-xs text-muted-foreground">预估时间</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-muted">
                      <Zap className="h-3 w-3" />
                    </div>
                    <div>
                      <div className="font-medium capitalize">{template.complexity}</div>
                      <div className="text-xs text-muted-foreground">复杂度</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-muted">
                      <CheckCircle className="h-3 w-3" />
                    </div>
                    <div>
                      <div className="font-medium">{template.nodes.length}</div>
                      <div className="text-xs text-muted-foreground">节点数量</div>
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button 
                  variant="default" 
                  className="w-full"
                  onClick={() => onApplyTemplate(template)}
                >
                  应用此模板
                </Button>
              </CardFooter>
            </Card>
          )
        })}

        {/* 空状态 */}
        {filteredTemplates.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Film className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">暂无模板</h3>
              <p className="text-muted-foreground text-center mb-4">
                该分类下暂无工作流模板
              </p>
              <Button variant="outline" onClick={() => setSelectedCategory("all")}>
                查看所有模板
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 底部提示 */}
      <div className="p-4 border-t">
        <div className="text-sm text-muted-foreground">
          <p className="mb-1">💡 提示：应用模板后可以自定义修改节点配置</p>
          <p>模板包含预定义的节点和连接关系</p>
        </div>
      </div>
    </div>
  )
}