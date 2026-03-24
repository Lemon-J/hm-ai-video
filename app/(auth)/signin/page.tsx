'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Loader2, Github, Chrome } from 'lucide-react'

export default function SignInPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '' })

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error('登录失败', { description: result.error })
      } else {
        toast.success('登录成功')
        router.push('/dashboard')
      }
    } catch (error) {
      toast.error('登录失败', { description: '请稍后重试' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: string) => {
    try {
      await signIn(provider, { callbackUrl: '/dashboard' })
    } catch (error) {
      toast.error('登录失败', { description: '请稍后重试' })
    }
  }

  return (
    <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">AI短剧工具平台</CardTitle>
        <CardDescription className="text-center">
          登录以开始您的AI视频创作之旅
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* OAuth登录 */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="border-gray-700"
            onClick={() => handleOAuthSignIn('github')}
            disabled={isLoading}
          >
            <Github className="w-4 h-4 mr-2" />
            GitHub
          </Button>
          <Button
            variant="outline"
            className="border-gray-700"
            onClick={() => handleOAuthSignIn('google')}
            disabled={isLoading}
          >
            <Chrome className="w-4 h-4 mr-2" />
            Google
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-gray-900 px-2 text-muted-foreground">或</span>
          </div>
        </div>

        {/* 凭证登录 */}
        <form onSubmit={handleCredentialsSignIn} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="bg-gray-800/50 border-gray-700"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              className="bg-gray-800/50 border-gray-700"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                登录中...
              </>
            ) : (
              '登录'
            )}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          还没有账号？
          <Button variant="link" className="ml-1 p-0" asChild>
            <a href="/auth/signup">立即注册</a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
