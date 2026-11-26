import React, { useRef, useState } from 'react';
import { Check, Download, FileDown, FileText, Upload } from 'lucide-react';
import { ALL_CHAPTERS, GOLDEN_TIPS, QUICK_REF_ROWS } from '../data/guideData';

export interface PrintConfig {
  includeQuickRef: boolean;
  includePersonalNotes: boolean;
  onlyBookmarkedInPrint: boolean;
}

interface ExportStudioProps {
  printConfig: PrintConfig;
  onChangePrintConfig: (next: PrintConfig) => void;
  bookmarks: string[];
  personalNotes: Record<string, string>;
  masteredIds: string[];
  onImportBackup: (data: {
    bookmarks?: string[];
    personalNotes?: Record<string, string>;
    masteredIds?: string[];
  }) => void;
}

function buildMarkdownDocument(
  onlyBookmarked: boolean,
  bookmarks: string[],
  includeNotes: boolean,
  personalNotes: Record<string, string>
): string {
  const lines: string[] = [
    '# راهنمای جامع و کاربردی LLM SDKs',
    '',
    '> مرجع سریع و مقایسه‌ای **OpenAI Responses API** (`openai`) در برابر **Google Gen AI SDK** (`google-genai`)',
    '',
    '## جدول مرجع سریع',
    '',
    '| عملیات | OpenAI Responses API | Google Gen AI SDK |',
    '| :--- | :--- | :--- |',
  ];

  QUICK_REF_ROWS.forEach((r) => {
    const o = r.openaiCode.replace(/\n/g, ' ; ');
    const g = r.googleCode.replace(/\n/g, ' ; ');
    lines.push(`| ${r.operation} | \`${o}\` | \`${g}\` |`);
  });

  const chapters = onlyBookmarked
    ? ALL_CHAPTERS.filter((c) => bookmarks.includes(c.id))
    : ALL_CHAPTERS;

  chapters.forEach((ch) => {
    lines.push('', `## ${ch.number}. ${ch.titleFa} (${ch.titleEn})`, '', ch.summary);
    if (ch.notes?.length) {
      lines.push('');
      ch.notes.forEach((n) => lines.push(`- ${n}`));
    }
    ch.blocks.forEach((b) => {
      lines.push('', `### ${b.label}`, '', `\`\`\`${b.language}`, b.code, '```');
    });
    if (includeNotes && personalNotes[ch.id]?.trim()) {
      lines.push('', `> **یادداشت شخصی:** ${personalNotes[ch.id].trim()}`);
    }
  });

  lines.push('', '## ۲۲. نکات طلایی مهندسی', '');
  GOLDEN_TIPS.forEach((tip) => {
    lines.push(`- **${tip.title}:** ${tip.body}`);
  });

  return lines.join('\n');
}

function downloadBlob(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export const ExportStudio: React.FC<ExportStudioProps> = ({
  printConfig,
  onChangePrintConfig,
  bookmarks,
  personalNotes,
  masteredIds,
  onImportBackup,
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const flashStatus = (msg: string) => {
    setStatusMsg(msg);
    window.setTimeout(() => setStatusMsg(null), 2600);
  };

  const handleDownloadMarkdown = (onlySaved: boolean) => {
    const md = buildMarkdownDocument(
      onlySaved,
      bookmarks,
      printConfig.includePersonalNotes,
      personalNotes
    );
    downloadBlob(
      onlySaved ? 'llm-sdks-cheatsheet.md' : 'llm-sdks-complete-guide.md',
      md,
      'text/markdown;charset=utf-8'
    );
    flashStatus('فایل Markdown با موفقیت دانلود شد.');
  };

  const handleExportJsonBackup = () => {
    const payload = JSON.stringify(
      { bookmarks, personalNotes, masteredIds, exportedAt: new Date().toISOString() },
      null,
      2
    );
    downloadBlob('llm-guide-notes-backup.json', payload, 'application/json;charset=utf-8');
    flashStatus('پشتیبان یادداشت‌ها و نشان‌شده‌ها ذخیره شد.');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        onImportBackup({
          bookmarks: Array.isArray(parsed.bookmarks) ? parsed.bookmarks : undefined,
          personalNotes:
            parsed.personalNotes && typeof parsed.personalNotes === 'object'
              ? parsed.personalNotes
              : undefined,
          masteredIds: Array.isArray(parsed.masteredIds) ? parsed.masteredIds : undefined,
        });
        flashStatus('پشتیبان با موفقیت بازیابی شد.');
      } catch {
        flashStatus('فایل JSON معتبر نیست.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-extrabold" style={{ color: 'var(--text-primary)' }}>
          سفارشی‌سازی چاپ PDF، خروجی Markdown و پشتیبان یادداشت‌ها
        </h3>
        <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
          قبل از ذخیره PDF انتخاب کنید چه بخش‌هایی چاپ شوند، یا کل راهنما را به‌صورت فایل Markdown
          برای Obsidian / Notion / GitHub دانلود کنید.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* PDF Builder Settings */}
        <div
          className="space-y-3 rounded-md border p-4"
          style={{
            borderColor: 'var(--border-subtle)',
            backgroundColor: 'var(--bg-surface)',
          }}
        >
          <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
            تنظیمات چاپ PDF استاندارد A4
          </p>

          <label className="flex cursor-pointer items-center gap-2.5 text-xs">
            <input
              type="checkbox"
              checked={printConfig.includeQuickRef}
              onChange={(e) =>
                onChangePrintConfig({ ...printConfig, includeQuickRef: e.target.checked })
              }
              className="h-4 w-4 accent-[var(--accent)]"
            />
            <span style={{ color: 'var(--text-secondary)' }}>
              شامل جدول مرجع سریع (۲۲ عملیات) در خروجی چاپ
            </span>
          </label>

          <label className="flex cursor-pointer items-center gap-2.5 text-xs">
            <input
              type="checkbox"
              checked={printConfig.includePersonalNotes}
              onChange={(e) =>
                onChangePrintConfig({
                  ...printConfig,
                  includePersonalNotes: e.target.checked,
                })
              }
              className="h-4 w-4 accent-[var(--accent)]"
            />
            <span style={{ color: 'var(--text-secondary)' }}>
              چاپ یادداشت‌های شخصی من در زیر هر فصل
            </span>
          </label>

          <label className="flex cursor-pointer items-center gap-2.5 text-xs">
            <input
              type="checkbox"
              checked={printConfig.onlyBookmarkedInPrint}
              onChange={(e) =>
                onChangePrintConfig({
                  ...printConfig,
                  onlyBookmarkedInPrint: e.target.checked,
                })
              }
              className="h-4 w-4 accent-[var(--accent)]"
            />
            <span style={{ color: 'var(--text-secondary)' }}>
              فقط چاپ فصل‌های نشان‌شده (ساخت Cheat Sheet اختصاصی)
            </span>
          </label>

          <button
            type="button"
            onClick={() => window.print()}
            className="mt-2 inline-flex h-9 items-center gap-2 rounded-md px-4 text-xs font-semibold"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--accent-contrast)',
            }}
          >
            <FileDown className="h-4 w-4" />
            <span>ساخت و چاپ PDF با این تنظیمات</span>
          </button>
        </div>

        {/* Markdown & Personal Notes Backup */}
        <div
          className="space-y-3 rounded-md border p-4"
          style={{
            borderColor: 'var(--border-subtle)',
            backgroundColor: 'var(--bg-surface)',
          }}
        >
          <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
            خروجی Markdown و همگام‌سازی یادداشت‌ها
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleDownloadMarkdown(false)}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-xs font-medium transition-colors"
              style={{
                borderColor: 'var(--border-subtle)',
                backgroundColor: 'var(--bg-canvas)',
                color: 'var(--text-primary)',
              }}
            >
              <FileText className="h-3.5 w-3.5" style={{ color: 'var(--accent)' }} />
              <span>دانلود کل راهنما (.md)</span>
            </button>

            <button
              type="button"
              onClick={() => handleDownloadMarkdown(true)}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-xs font-medium transition-colors"
              style={{
                borderColor: 'var(--border-subtle)',
                backgroundColor: 'var(--bg-canvas)',
                color: 'var(--text-primary)',
              }}
            >
              <Download className="h-3.5 w-3.5" style={{ color: 'var(--openai-accent)' }} />
              <span>دانلود نشان‌شده‌ها (.md)</span>
            </button>
          </div>

          <div
            className="flex flex-wrap items-center gap-2 border-t pt-3"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <button
              type="button"
              onClick={handleExportJsonBackup}
              className="inline-flex h-8 items-center gap-1.5 rounded border px-2.5 text-xs font-medium"
              style={{
                borderColor: 'var(--border-subtle)',
                backgroundColor: 'var(--bg-subtle)',
                color: 'var(--text-secondary)',
              }}
            >
              <Download className="h-3.5 w-3.5" />
              <span>پشتیبان یادداشت‌ها (JSON)</span>
            </button>

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex h-8 items-center gap-1.5 rounded border px-2.5 text-xs font-medium"
              style={{
                borderColor: 'var(--border-subtle)',
                backgroundColor: 'var(--bg-subtle)',
                color: 'var(--text-secondary)',
              }}
            >
              <Upload className="h-3.5 w-3.5" />
              <span>بازیابی پشتیبان</span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              onChange={handleImportFile}
              className="hidden"
            />
          </div>

          {statusMsg && (
            <p
              className="flex items-center gap-1.5 text-xs font-medium"
              style={{ color: 'var(--openai-accent)' }}
            >
              <Check className="h-3.5 w-3.5" />
              <span>{statusMsg}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
