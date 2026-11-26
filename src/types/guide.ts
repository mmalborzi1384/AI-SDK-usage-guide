export type ProviderKey = 'shared' | 'terminal' | 'openai' | 'google';

export interface CodeBlockData {
  provider: ProviderKey;
  label: string;
  sublabel?: string;
  language: 'python' | 'bash';
  code: string;
}

export interface ComparisonMiniRow {
  feature: string;
  openai: string;
  google: string;
}

export interface Chapter {
  id: string;
  number: number;
  partId: string;
  titleFa: string;
  titleEn: string;
  summary: string;
  isNew?: boolean;
  isExpanded?: boolean;
  notes?: string[];
  miniTable?: ComparisonMiniRow[];
  blocks: CodeBlockData[];
  sourceNote?: string;
}

export interface GuidePart {
  id: string;
  number: string;
  titleFa: string;
  subtitle: string;
}

export interface QuickRefRow {
  operation: string;
  chapterId: string;
  chapterNumber: number;
  openaiCode: string;
  openaiNote?: string;
  googleCode: string;
  googleNote?: string;
}

export interface GoldenTip {
  id: string;
  number: string;
  title: string;
  body: string;
  codeHint?: string;
}

export interface AuditChange {
  category: 'اصلاح نگارشی و صفحه‌آرایی' | 'تکمیل حفره فنی' | 'فصل جدید افزوده‌شده';
  title: string;
  detail: string;
}

export type ViewMode = 'side-by-side' | 'stacked' | 'openai' | 'google';
