import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDownLeft, Search, X } from 'lucide-react';
import { Chapter, QuickRefRow } from '../types/guide';
import { toPersianDigits } from '../data/guideData';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  chapters: Chapter[];
  quickRows: QuickRefRow[];
  onNavigate: (id: string) => void;
}

interface SearchHit {
  id: string;
  targetId: string;
  title: string;
  subtitle: string;
  codePreview?: string;
  kind: 'فصل' | 'مرجع سریع';
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  open,
  onClose,
  chapters,
  quickRows,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIdx(0);
      window.setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [open]);

  const hits = useMemo<SearchHit[]>(() => {
    const q = query.trim().toLowerCase();
    const chapterHits: SearchHit[] = chapters
      .filter((ch) => {
        if (!q) return true;
        const hay = [
          ch.titleFa,
          ch.titleEn,
          ch.summary,
          ...ch.blocks.map((b) => b.code),
        ]
          .join(' ')
          .toLowerCase();
        return hay.includes(q);
      })
      .map((ch) => ({
        id: `hit-${ch.id}`,
        targetId: ch.id,
        title: `${toPersianDigits(ch.number)}. ${ch.titleFa}`,
        subtitle: ch.titleEn,
        kind: 'فصل',
      }));

    const quickHits: SearchHit[] = q
      ? quickRows
          .filter((r) =>
            `${r.operation} ${r.openaiCode} ${r.googleCode}`.toLowerCase().includes(q)
          )
          .slice(0, 6)
          .map((r, idx) => ({
            id: `hit-qr-${idx}`,
            targetId: r.chapterId,
            title: r.operation,
            subtitle: `فصل ${toPersianDigits(r.chapterNumber)}`,
            codePreview: `${r.openaiCode.split('\n')[0]}  |  ${r.googleCode.split('\n')[0]}`,
            kind: 'مرجع سریع',
          }))
      : [];

    return [...quickHits, ...chapterHits].slice(0, 14);
  }, [query, chapters, quickRows]);

  useEffect(() => {
    setSelectedIdx(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIdx((prev) => (hits.length ? (prev + 1) % hits.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIdx((prev) =>
          hits.length ? (prev - 1 + hits.length) % hits.length : 0
        );
      } else if (e.key === 'Enter' && hits[selectedIdx]) {
        e.preventDefault();
        onNavigate(hits[selectedIdx].targetId);
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, hits, selectedIdx, onClose, onNavigate]);

  if (!open) return null;

  return (
    <div
      className="no-print fixed inset-0 z-50 flex items-start justify-center bg-black/55 px-4 pt-[10vh] backdrop-blur-xs"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="جستجوی سریع در راهنما"
        className="w-full max-w-2xl overflow-hidden rounded-lg border shadow-2xl"
        style={{
          borderColor: 'var(--border-strong)',
          backgroundColor: 'var(--bg-surface)',
        }}
      >
        <div
          className="flex items-center gap-3 border-b px-4 py-3.5"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <Search className="h-4 w-4 shrink-0" style={{ color: 'var(--accent)' }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجوی فوری متد یا موضوع (مثلاً: responses.parse، ThinkingConfig، 429، PDF، Batch)..."
            className="w-full bg-transparent text-sm focus:outline-none"
            style={{ color: 'var(--text-primary)' }}
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن جستجو"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-[var(--bg-hover)]"
            style={{ color: 'var(--text-muted)' }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {hits.length === 0 ? (
            <div className="px-4 py-10 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
              نتیجه‌ای برای «{query}» پیدا نشد. عبارت فارسی یا نام متد انگلیسی دیگری را امتحان کنید.
            </div>
          ) : (
            <ul className="space-y-0.5">
              {hits.map((hit, i) => {
                const active = i === selectedIdx;
                return (
                  <li key={hit.id}>
                    <button
                      type="button"
                      onMouseEnter={() => setSelectedIdx(i)}
                      onClick={() => {
                        onNavigate(hit.targetId);
                        onClose();
                      }}
                      className="flex w-full items-center justify-between gap-3 rounded-md px-3.5 py-2.5 text-right transition-colors"
                      style={{
                        backgroundColor: active ? 'var(--accent-soft)' : 'transparent',
                      }}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs font-semibold truncate"
                            style={{ color: active ? 'var(--accent)' : 'var(--text-primary)' }}
                          >
                            {hit.title}
                          </span>
                          <span
                            className="shrink-0 text-[11px]"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            · {hit.kind}
                          </span>
                        </div>
                        <p
                          dir="ltr"
                          className="mt-0.5 truncate text-left font-mono text-[11px]"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {hit.codePreview ?? hit.subtitle}
                        </p>
                      </div>
                      <ArrowDownLeft
                        className="h-3.5 w-3.5 shrink-0"
                        style={{ color: active ? 'var(--accent)' : 'var(--text-muted)' }}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div
          className="hidden sm:flex items-center justify-between border-t px-4 py-2 text-[11px]"
          style={{
            borderColor: 'var(--border-subtle)',
            backgroundColor: 'var(--bg-subtle)',
            color: 'var(--text-muted)',
          }}
        >
          <span>حرکت با کلیدهای ↑ ↓ و انتخاب با Enter</span>
          <span dir="ltr" className="font-mono">
            ESC to close
          </span>
        </div>
      </div>
    </div>
  );
};
