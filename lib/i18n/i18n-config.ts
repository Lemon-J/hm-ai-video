/**
 * 国际化配置模块 - 借鉴waoowaoo项目的多语言支持方案
 * 支持中英文无缝切换，包括界面文字、提示词模板、AI输出语言
 */

// 支持的语言列表
export const locales = ['zh', 'en'] as const;
export type Locale = (typeof locales)[number];

// 默认语言
export const defaultLocale: Locale = 'zh';

// 语言显示标签
export const languageLabels: Record<Locale, string> = {
  zh: '简体中文',
  en: 'English',
} as const;

// 语言切换确认文案
export const switchConfirmCopy: Record<Locale, {
  title: string;
  message: string;
  action: string;
  cancel: string;
  triggerLabel: string;
}> = {
  zh: {
    title: '切换语言？',
    message: '切换到 {targetLanguage} 后，不仅界面文字会改变，整条流程的提示词模板、剧本生成和任务输出语言也会同步切换。是否继续？',
    action: '确认切换',
    cancel: '取消',
    triggerLabel: '切换语言',
  },
  en: {
    title: 'Switch language?',
    message: 'Switching to {targetLanguage} will update not only interface text, but also end-to-end prompt templates, script generation, and workflow output language. Continue?',
    action: 'Switch now',
    cancel: 'Cancel',
    triggerLabel: 'Switch language',
  },
};

// 系统区域设置
export const systemLocales = {
  zh: {
    timeFormat: 'zh-CN',
    dateFormat: 'YYYY年MM月DD日',
    currency: 'CNY',
    aiModelPreference: ['qwen', 'deepseek', 'claude'], // 中文偏好模型
  },
  en: {
    timeFormat: 'en-US',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD',
    aiModelPreference: ['gpt-4', 'claude', 'gemini'], // 英文偏好模型
  },
} as const;

// 验证语言是否支持
export function isSupportedLocale(locale?: string): locale is Locale {
  return locale === 'zh' || locale === 'en';
}

// 获取用户首选语言
export function getUserPreferredLocale(): Locale {
  if (typeof navigator === 'undefined') {
    return defaultLocale;
  }

  const languages = navigator.languages || [navigator.language];
  
  for (const language of languages) {
    const langCode = language.split('-')[0].toLowerCase();
    if (langCode === 'zh' || langCode === 'en') {
      return langCode as Locale;
    }
  }
  
  return defaultLocale;
}

// 本地化工具函数
export function formatLocaleText(zhText: string, enText: string, locale: Locale): string {
  return locale === 'zh' ? zhText : enText;
}

// AI模型选择器基于语言
export function getPreferredAIModels(locale: Locale): string[] {
  return [...systemLocales[locale].aiModelPreference];
}

// 本地化数字格式
export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === 'zh' ? 'zh-CN' : 'en-US').format(value);
}

// 本地化货币格式
export function formatCurrency(amount: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === 'zh' ? 'zh-CN' : 'en-US', {
    style: 'currency',
    currency: systemLocales[locale].currency,
  }).format(amount);
}

// 本地化日期格式
export function formatDate(date: Date | string, locale: Locale): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
}

// 本地化时间格式
export function formatTime(date: Date | string, locale: Locale): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(dateObj);
}

// 本地化相对时间
export function formatRelativeTime(date: Date | string, locale: Locale): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  const translations = {
    zh: {
      now: '刚刚',
      seconds: '{count}秒前',
      minutes: '{count}分钟前',
      hours: '{count}小时前',
      days: '{count}天前',
      weeks: '{count}周前',
    },
    en: {
      now: 'just now',
      seconds: '{count} seconds ago',
      minutes: '{count} minutes ago',
      hours: '{count} hours ago',
      days: '{count} days ago',
      weeks: '{count} weeks ago',
    },
  };

  const t = translations[locale];

  if (diffSeconds < 60) return t.now;
  if (diffMinutes < 60) return t.minutes.replace('{count}', diffMinutes.toString());
  if (diffHours < 24) return t.hours.replace('{count}', diffHours.toString());
  if (diffDays < 7) return t.days.replace('{count}', diffDays.toString());
  
  const diffWeeks = Math.floor(diffDays / 7);
  return t.weeks.replace('{count}', diffWeeks.toString());
}