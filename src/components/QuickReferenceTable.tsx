import React from 'react';
import { ArrowUpLeft } from 'lucide-react';
import { QuickRefRow } from '../types/guide';
import { toPersianDigits } from '../data/guideData';

interface QuickReferenceTableProps {
  rows: QuickRefRow[];
  onJumpToChapter: (chapterId: string) => void;
}

export const QuickReferenceTable: React.FC<QuickReferenceTableProps> = ({
  rows,
  onJumpToChapter,
}) => {
  return (
    <section
      id="quick-reference"
      className="border-t pt-10 pb-12 print:border-t-0 print:pt-2 print:pb-6"
      style={{ borderColor: 'var(--border-subtle)' }}
    >
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            مرجع سریع مهندسی · مقایسه متناظر هر دو کتابخانه
          </p>
          <h2
            className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl print:text-xl"
            style={{ color: 'var(--text-primary)' }}
          >
            جدول مرجع سریع (در یک نگاه)
          </h2>
        </div>
        <p className="no-print text-xs" style={{ color: 'var(--text-muted)' }}>
          روی هر ردیف کلیک کنید تا مستقیم به کد کامل آن فصل بروید.
        </p>
      </div>

      {/* Mobile Stacked Comparison View (< md, hidden in print) */}
      <div className="no-print divide-y md:hidden" style={{ borderColor: 'var(--border-subtle)' }}>
        {rows.map((row, idx) => (
          <div key={`m-${row.chapterId}-${idx}`} className="py-4 first:pt-0">
            <button
              type="button"
              onClick={() => onJumpToChapter(row.chapterId)}
              className="flex w-full items-center justify-between gap-2 text-right"
            >
              <div>
                <span
                  className="block text-sm font-bold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {row.operation}
                </span>
                <span
                  className="text-[11px] tabular-nums"
                  style={{ color: 'var(--text-muted)' }}
                >
                  فصل {toPersianDigits(row.chapterNumber)}
                </span>
              </div>
              <ArrowUpLeft className="h-4 w-4 shrink-0" style={{ color: 'var(--accent)' }} />
            </button>

            <div className="mt-3 space-y-2">
              <div
                className="rounded border px-3 py-2"
                style={{
                  borderColor: 'var(--code-border)',
                  backgroundColor: 'var(--code-bg)',
                  borderTopWidth: '2px',
                  borderTopColor: 'var(--openai-accent)',
                }}
              >
                <p
                  className="mb-1 text-[10.5px] font-bold"
                  style={{ color: 'var(--openai-accent)' }}
                >
                  OpenAI Responses API
                </p>
                <pre
                  dir="ltr"
                  className="m-0 overflow-x-auto whitespace-pre-wrap break-words text-left font-mono text-[11.5px] leading-relaxed"
                  style={{ color: 'var(--syn-text)' }}
                >
                  {row.openaiCode}
                </pre>
                {row.openaiNote && (
                  <p className="mt-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    {row.openaiNote}
                  </p>
                )}
              </div>

              <div
                className="rounded border px-3 py-2"
                style={{
                  borderColor: 'var(--code-border)',
                  backgroundColor: 'var(--code-bg)',
                  borderTopWidth: '2px',
                  borderTopColor: 'var(--google-accent)',
                }}
              >
                <p
                  className="mb-1 text-[10.5px] font-bold"
                  style={{ color: 'var(--google-accent)' }}
                >
                  Google Gen AI SDK
                </p>
                <pre
                  dir="ltr"
                  className="m-0 overflow-x-auto whitespace-pre-wrap break-words text-left font-mono text-[11.5px] leading-relaxed"
                  style={{ color: 'var(--syn-text)' }}
                >
                  {row.googleCode}
                </pre>
                {row.googleNote && (
                  <p className="mt-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    {row.googleNote}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop & Print Editorial Specification Table (md+ and always in print) */}
      <div
        className="hidden overflow-x-auto border md:block print:block"
        style={{
          borderColor: 'var(--border-subtle)',
          backgroundColor: 'var(--bg-surface)',
        }}
      >
        <table className="w-full border-collapse text-right text-sm">
          <thead>
            <tr
              className="border-b text-xs font-bold"
              style={{
                borderColor: 'var(--border-strong)',
                backgroundColor: 'var(--bg-subtle)',
                color: 'var(--text-primary)',
              }}
            >
              <th className="w-[24%] px-4 py-3 text-right">عملیات / کاربرد</th>
              <th
                className="w-[38%] border-r px-4 py-3 text-left"
                dir="ltr"
                style={{ borderColor: 'var(--border-subtle)', color: 'var(--openai-accent)' }}
              >
                OpenAI SDK (Responses API)
              </th>
              <th
                className="w-[38%] border-r px-4 py-3 text-left"
                dir="ltr"
                style={{ borderColor: 'var(--border-subtle)', color: 'var(--google-accent)' }}
              >
                Google Gen AI SDK (google-genai)
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={`${row.chapterId}-${idx}`}
                className="border-b align-top transition-colors hover:bg-[var(--bg-subtle)]/70"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => onJumpToChapter(row.chapterId)}
                    className="group text-right focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    <span
                      className="block font-semibold group-hover:underline"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {row.operation}
                    </span>
                    <span
                      className="mt-0.5 block text-[11px] tabular-nums"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      فصل {toPersianDigits(row.chapterNumber)}
                    </span>
                  </button>
                </td>

                <td
                  className="border-r px-4 py-3"
                  style={{ borderColor: 'var(--border-subtle)' }}
                >
                  <div dir="ltr" className="text-left">
                    <pre
                      className="m-0 whitespace-pre-wrap break-words font-mono text-[12px] leading-relaxed"
                      style={{ color: 'var(--openai-accent)' }}
                    >
                      {row.openaiCode}
                    </pre>
                  </div>
                  {row.openaiNote && (
                    <p
                      className="mt-1 text-[11px] leading-relaxed"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {row.openaiNote}
                    </p>
                  )}
                </td>

                <td
                  className="border-r px-4 py-3"
                  style={{ borderColor: 'var(--border-subtle)' }}
                >
                  <div dir="ltr" className="text-left">
                    <pre
                      className="m-0 whitespace-pre-wrap break-words font-mono text-[12px] leading-relaxed"
                      style={{ color: 'var(--google-accent)' }}
                    >
                      {row.googleCode}
                    </pre>
                  </div>
                  {row.googleNote && (
                    <p
                      className="mt-1 text-[11px] leading-relaxed"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {row.googleNote}
                    </p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
