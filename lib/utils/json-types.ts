/**
 * JSON 类型定义和类型守卫工具函数
 */

// 基础 JSON 对象类型
export type JsonObject = Record<string, unknown>
export type JsonArray = unknown[]

/**
 * 检查值是否为普通对象（非数组、非null）
 */
export function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * 检查值是否为数组
 */
export function isJsonArray(value: unknown): value is JsonArray {
  return Array.isArray(value)
}

/**
 * 安全获取 JSON 对象的属性
 */
export function getJsonProperty<T = unknown>(
  obj: unknown,
  key: string,
  defaultValue?: T
): T | undefined {
  if (!isJsonObject(obj)) {
    return defaultValue
  }
  return (key in obj ? obj[key] : defaultValue) as T | undefined
}

/**
 * 安全地扩展配置对象
 */
export function safeSpreadConfig<T extends Record<string, unknown>>(
  source: unknown,
  defaultConfig: T
): T {
  return isJsonObject(source) ? { ...defaultConfig, ...source } : defaultConfig
}
