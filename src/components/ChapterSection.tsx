import React, { useState } from 'react';
import { Bookmark, CheckCircle2, NotebookPen } from 'lucide-react';
import { Chapter, ViewMode } from '../types/guide';
import { toPersianDigits } from '../data/guideData';
import { CodeBlock, CodeScale } from './CodeBlock';

interface ChapterSectionProps {
  chapter: Chapter;
  viewMode: ViewMode;
  codeScale: CodeScale;
  isBookmarked: boolean;
  isMastered: boolean;
  personalNote: string;
  includeNoteInPrint: boolean;
  hideInPrint?: boolean;
  onToggleBookmark: (id: string) => void;
  onToggleMastered: (id: string) => void;
  onUpdateNote: (id: string, value: string) => void;
}

type LocalTab = 'both' | 'openai' | 'google';

export const ChapterSection: React.FC<ChapterSectionProps> = ({
  chapter,
  viewMode,
  codeScale,
  isBookmarked,
  isMastered,
  personalNote,
  includeNoteInPrint,
  hideInPrint = false,
  onToggleBookmark,
  onToggleMastered,
  onUpdateNote,
}) => {
  const [localTab, setLocalTab] = useState<LocalTab>('both');
  const [noteOpen, setNoteOpen] = useState(false);

  const sharedOrTerminalBlocks = chapter.blocks.filter(
    (b) => b.provider === 'shared' || b.provider === 'terminal'
  );
  const openaiBlock = chapter.blocks.find((b) => b.provider === 'openai');
  const googleBlock = chapter.blocks.find((b) => b.provider === 'google');

  const globalAllowsOpenAI = viewMode !== 'google';
  const globalAllowsGoogle = viewMode !== 'openai';
  const hasBothGlobal =
    globalAllowsOpenAI && globalAllowsGoogle && Boolean(openaiBlock) && Boolean(googleBlock);

  const showOpenAI =
    globalAllowsOpenAI && Boolean(openaiBlock) && (!hasBothGlobal || localTab !== 'google');
  const showGoogle =
    globalAllowsGoogle && Boolean(googleBlock) && (!hasBothGlobal || localTab !== 'openai');

  const isSideBySide = viewMode === 'side-by-side' && showOpenAI && showGoogle;
  const formattedChapterIndex = toPersianDigits(String(chapter.number).padStart(2, '0'));
  const hasNote = personalNote.trim().length > 0;

  return (
    <article
      id={chapter.id}
      className={`border-t py-9 sm:py-11 print:py-5 ${hideInPrint ? 'print:hidden' : ''}`}
      style={{ borderColor: 'var(--border-subtle)' }}
    >
      {/* Swiss Editorial Chapter Header */}
      <header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex items-start gap-3.5 sm:gap-5">
          <span
            aria-hidden="true"
            className="hidden pt-1 font-mono text-2xl font-light tracking-tighter tabular-nums sm:block print:block print:text-lg"
            style={{ color: isMastered ? 'var(--openai-accent)' : 'var(--border-strong)' }}
          >
            {formattedChapterIndex}
          </span>

          <div className="min-w-0">
            <div
              className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs"
              style={{ color: 'var(--text-muted)' }}
            >
              <span
                className="font-semibold tabular-nums"
                style={{ color: 'var(--accent)' }}
              >
                فصل {toPersianDigits(chapter.number)}
              </span>
              <span aria-hidden="true">·</span>
              <span dir="ltr" className="font-mono text-[11px]">
                {chapter.titleEn}
              </span>
              {chapter.isNew && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-medium" style={{ color: 'var(--openai-accent)' }}>
                    فصل جدید
                  </span>
                </>
              )}
              {!chapter.isNew && chapter.isExpanded && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-medium" style={{ color: 'var(--accent)' }}>
                    تکمیل‌شده از مستندات رسمی
                  </span>
                </>
              )}
            </div>

            <h3
              className="mt-1.5 text-xl font-extrabold leading-snug tracking-tight [text-wrap:balance] sm:text-2xl print:text-lg"
              style={{ color: 'var(--text-primary)' }}
            >
              {chapter.titleFa}
            </h3>
          </div>
        </div>

        {/* Chapter Quick Actions: Mastery, Personal Note, Bookmark */}
        <div className="no-print flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => onToggleMastered(chapter.id)}
            aria-pressed={isMastered}
            title={isMastered ? 'مرور شده' : 'علامت زدن به‌عنوان مرور شده'}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-colors whitespace-nowrap"
            style={{
              borderColor: isMastered ? 'var(--openai-accent)' : 'var(--border-subtle)',
              backgroundColor: isMastered ? 'var(--openai-soft)' : 'var(--bg-surface)',
              color: isMastered ? 'var(--openai-accent)' : 'var(--text-muted)',
            }}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{isMastered ? 'مرور شد' : 'تسلط'}</span>
          </button>

          <button
            type="button"
            onClick={() => setNoteOpen((v) => !v)}
            aria-expanded={noteOpen}
            title="یادداشت شخصی برای این فصل"
            className="inline-flex h-9 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-colors whitespace-nowrap"
            style={{
              borderColor: noteOpen || hasNote ? 'var(--accent)' : 'var(--border-subtle)',
              backgroundColor: noteOpen || hasNote ? 'var(--accent-soft)' : 'var(--bg-surface)',
              color: noteOpen || hasNote ? 'var(--accent)' : 'var(--text-muted)',
            }}
          >
            <NotebookPen className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">
              {hasNote ? 'یادداشت دارد' : 'یادداشت'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onToggleBookmark(chapter.id)}
            aria-pressed={isBookmarked}
            aria-label={isBookmarked ? 'حذف از نشان‌شده‌ها' : 'نشان کردن این فصل'}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-colors whitespace-nowrap"
            style={{
              borderColor: isBookmarked ? 'var(--accent)' : 'var(--border-subtle)',
              backgroundColor: isBookmarked ? 'var(--accent-soft)' : 'var(--bg-surface)',
              color: isBookmarked ? 'var(--accent)' : 'var(--text-muted)',
            }}
          >
            <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
            <span className="hidden sm:inline">{isBookmarked ? 'نشان‌شده' : 'نشان'}</span>
          </button>
        </div>
      </header>

      {/* Editorial Body Prose */}
      <p
        className="mb-5 max-w-3xl text-[15px] leading-[1.85] print:mb-3 print:max-w-none print:text-[9.5pt]"
        style={{ color: 'var(--text-secondary)' }}
      >
        <strong className="font-bold" style={{ color: 'var(--text-primary)' }}>
          کاربرد:{' '}
        </strong>
        {chapter.summary}
      </p>

      {/* Optional Mini Model Selection Matrix */}
      {chapter.miniTable && (
        <div
          className="print-avoid-break mb-5 overflow-x-auto border"
          style={{
            borderColor: 'var(--border-subtle)',
            backgroundColor: 'var(--bg-surface)',
          }}
        >
          <table className="w-full min-w-[520px] border-collapse text-right text-xs">
            <thead>
              <tr
                className="border-b font-semibold"
                style={{
                  borderColor: 'var(--border-subtle)',
                  backgroundColor: 'var(--bg-subtle)',
                  color: 'var(--text-primary)',
                }}
              >
                <th className="px-3.5 py-2.5 text-right">سناریوی کاری</th>
                <th
                  className="border-r px-3.5 py-2.5 text-left"
                  dir="ltr"
                  style={{ borderColor: 'var(--border-subtle)', color: 'var(--openai-accent)' }}
                >
                  OpenAI
                </th>
                <th
                  className="border-r px-3.5 py-2.5 text-left"
                  dir="ltr"
                  style={{ borderColor: 'var(--border-subtle)', color: 'var(--google-accent)' }}
                >
                  Google Gen AI
                </th>
              </tr>
            </thead>
            <tbody>
              {chapter.miniTable.map((row, idx) => (
                <tr
                  key={idx}
                  className="border-b last:border-b-0"
                  style={{ borderColor: 'var(--border-subtle)' }}
                >
                  <td
                    className="px-3.5 py-2.5 font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {row.feature}
                  </td>
                  <td
                    className="border-r px-3.5 py-2.5 text-left font-mono"
                    dir="ltr"
                    style={{
                      borderColor: 'var(--border-subtle)',
                      color: 'var(--openai-accent)',
                    }}
                  >
                    {row.openai}
                  </td>
                  <td
                    className="border-r px-3.5 py-2.5 text-left font-mono"
                    dir="ltr"
                    style={{
                      borderColor: 'var(--border-subtle)',
                      color: 'var(--google-accent)',
                    }}
                  >
                    {row.google}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Key Engineering Notes */}
      {chapter.notes && chapter.notes.length > 0 && (
        <div
          className="print-avoid-break mb-5 rounded-md border px-4 py-3.5 print:mb-3"
          style={{
            borderColor: 'var(--border-subtle)',
            backgroundColor: 'var(--bg-subtle)',
          }}
        >
          <p className="mb-1.5 text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
            نکات کلیدی پیاده‌سازی
          </p>
          <ul
            className="space-y-1.5 text-[13.5px] leading-relaxed print:text-[8.8pt]"
            style={{ color: 'var(--text-secondary)' }}
          >
            {chapter.notes.map((note, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span aria-hidden="true" className="mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  —
                </span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Per-Chapter Mobile SDK Tab Switcher */}
      {hasBothGlobal && (
        <div className="no-print mb-3 flex items-center justify-between gap-2 xl:hidden">
          <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
            نمایش کد این فصل:
          </span>
          <div
            className="inline-flex items-center gap-0.5 rounded-md border p-0.5"
            style={{
              borderColor: 'var(--border-subtle)',
              backgroundColor: 'var(--bg-subtle)',
            }}
          >
            {(
              [
                { id: 'both', label: 'هر دو' },
                { id: 'openai', label: 'OpenAI' },
                { id: 'google', label: 'Google' },
              ] as const
            ).map((tab) => {
              const active = localTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setLocalTab(tab.id)}
                  className="rounded px-2.5 py-1 text-[11.5px] font-medium transition-colors whitespace-nowrap"
                  style={{
                    backgroundColor: active ? 'var(--bg-surface)' : 'transparent',
                    color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Code Deck */}
      <div className="space-y-4 print:space-y-3">
        {sharedOrTerminalBlocks.map((block, i) => (
          <CodeBlock key={`shared-${i}`} block={block} codeScale={codeScale} />
        ))}

        <div
          className={
            isSideBySide
              ? 'grid grid-cols-1 gap-4 xl:grid-cols-2 print:grid-cols-1 print:gap-3'
              : 'space-y-4 print:space-y-3'
          }
        >
          {showOpenAI && openaiBlock && (
            <CodeBlock block={openaiBlock} codeScale={codeScale} />
          )}
          {showGoogle && googleBlock && (
            <CodeBlock block={googleBlock} codeScale={codeScale} />
          )}
        </div>
      </div>

      {/* Personal Note Editor (Screen) & Optional Print Block */}
      {noteOpen && (
        <div
          className="no-print mt-4 rounded-md border p-4"
          style={{
            borderColor: 'var(--accent)',
            backgroundColor: 'var(--bg-surface)',
          }}
        >
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-bold" style={{ color: 'var(--accent)' }}>
              یادداشت شخصی من (ذخیره خودکار در مرورگر)
            </span>
            {hasNote && (
              <button
                type="button"
                onClick={() => onUpdateNote(chapter.id, '')}
                className="text-[11px] hover:underline"
                style={{ color: 'var(--text-muted)' }}
              >
                پاک کردن
              </button>
            )}
          </div>
          <textarea
            value={personalNote}
            onChange={(e) => onUpdateNote(chapter.id, e.target.value)}
            rows={3}
            placeholder="نکات پروژه خودتان (مثلاً سقف RPM اکانت، نام مدل داخلی یا آدرس Proxy) را اینجا بنویسید..."
            className="w-full resize-y rounded border p-2.5 text-xs leading-relaxed focus:outline-none"
            style={{
              borderColor: 'var(--border-subtle)',
              backgroundColor: 'var(--bg-canvas)',
              color: 'var(--text-primary)',
            }}
          />
        </div>
      )}

      {hasNote && (
        <div
          className={`mt-4 rounded-md border px-4 py-3 text-xs leading-relaxed ${
            noteOpen ? 'hidden print:block' : ''
          } ${includeNoteInPrint ? '' : 'print:hidden'}`}
          style={{
            borderColor: 'var(--border-strong)',
            backgroundColor: 'var(--accent-soft)',
            color: 'var(--text-primary)',
          }}
        >
          <span className="font-bold" style={{ color: 'var(--accent)' }}>
            یادداشت شخصی:{' '}
          </span>
          <span className="whitespace-pre-wrap">{personalNote}</span>
        </div>
      )}
    </article>
  );
};
