import React from 'react';
import { Bookmark, Search, X } from 'lucide-react';
import { Chapter, GuidePart } from '../types/guide';
import { toPersianDigits } from '../data/guideData';

interface TocSidebarProps {
  parts: GuidePart[];
  chapters: Chapter[];
  activeId: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  bookmarks: string[];
  onlyBookmarked: boolean;
  onToggleOnlyBookmarked: () => void;
  onNavigate: (id: string) => void;
  isDrawer?: boolean;
}

export const TocSidebar: React.FC<TocSidebarProps> = ({
  parts,
  chapters,
  activeId,
  searchQuery,
  onSearchChange,
  bookmarks,
  onlyBookmarked,
  onToggleOnlyBookmarked,
  onNavigate,
  isDrawer = false,
}) => {
  return (
    <div className={isDrawer ? 'flex h-full flex-col' : 'py-6'}>
      <div className="mb-4 flex items-center justify-between gap-2">
        <span
          className="text-xs font-bold tracking-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          فهرست مطالب
        </span>
        <button
          type="button"
          onClick={onToggleOnlyBookmarked}
          className="inline-flex h-8 items-center gap-1 rounded-md border px-2 text-[11.5px] font-medium transition-colors whitespace-nowrap"
          style={{
            borderColor: onlyBookmarked ? 'var(--accent)' : 'var(--border-subtle)',
            backgroundColor: onlyBookmarked ? 'var(--accent-soft)' : 'transparent',
            color: onlyBookmarked ? 'var(--accent)' : 'var(--text-muted)',
          }}
        >
          <Bookmark className={`h-3 w-3 ${onlyBookmarked ? 'fill-current' : ''}`} />
          <span className="tabular-nums">نشان ({toPersianDigits(bookmarks.length)})</span>
        </button>
      </div>

      <div className="relative mb-5">
        <Search
          className="pointer-events-none absolute top-1/2 right-3 h-3.5 w-3.5 -translate-y-1/2"
          style={{ color: 'var(--text-muted)' }}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="فیلتر سریع فصل یا متد..."
          className="w-full rounded-md border py-2 pr-8 pl-8 text-xs focus:outline-none"
          style={{
            borderColor: 'var(--border-subtle)',
            backgroundColor: 'var(--bg-surface)',
            color: 'var(--text-primary)',
          }}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            aria-label="پاک کردن جستجو"
            className="absolute top-1/2 left-2.5 -translate-y-1/2"
            style={{ color: 'var(--text-muted)' }}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <nav className="code-scroll flex-1 space-y-5 overflow-y-auto text-xs">
        <div>
          <button
            type="button"
            onClick={() => onNavigate('quick-reference')}
            className="flex min-h-[38px] w-full items-center rounded-md px-2.5 py-1.5 text-right font-semibold transition-colors"
            style={{
              backgroundColor:
                activeId === 'quick-reference' ? 'var(--accent-soft)' : 'transparent',
              color:
                activeId === 'quick-reference' ? 'var(--accent)' : 'var(--text-primary)',
            }}
          >
            ۰. جدول مرجع سریع (در یک نگاه)
          </button>
        </div>

        {parts.map((part) => {
          const partChapters = chapters.filter((c) => c.partId === part.id);
          const includeGoldenTips =
            part.id === 'part-5' && !onlyBookmarked && !searchQuery.trim();
          if (partChapters.length === 0 && !includeGoldenTips) return null;

          return (
            <div key={part.id} className="space-y-1">
              <p
                className="border-b px-2.5 pb-1.5 text-[11px] font-bold"
                style={{
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-muted)',
                }}
              >
                {part.number} · {part.titleFa}
              </p>
              <ul className="space-y-0.5 pt-1">
                {partChapters.map((ch) => {
                  const isActive = activeId === ch.id;
                  const isSaved = bookmarks.includes(ch.id);
                  return (
                    <li key={ch.id}>
                      <button
                        type="button"
                        onClick={() => onNavigate(ch.id)}
                        className="flex min-h-[36px] w-full items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-right leading-relaxed transition-colors hover:bg-[var(--bg-hover)]"
                        style={{
                          backgroundColor: isActive ? 'var(--accent-soft)' : undefined,
                          color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                          fontWeight: isActive ? 600 : 400,
                        }}
                      >
                        <span className="truncate">
                          <span
                            className="ml-1.5 font-mono text-[11px] tabular-nums"
                            style={{
                              color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                            }}
                          >
                            {toPersianDigits(String(ch.number).padStart(2, '0'))}
                          </span>
                          {ch.titleFa}
                        </span>
                        {isSaved && (
                          <Bookmark
                            className="h-3 w-3 shrink-0 fill-current"
                            style={{ color: 'var(--accent)' }}
                          />
                        )}
                      </button>
                    </li>
                  );
                })}

                {includeGoldenTips && (
                  <li>
                    <button
                      type="button"
                      onClick={() => onNavigate('ch-22')}
                      className="flex min-h-[36px] w-full items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-right leading-relaxed transition-colors hover:bg-[var(--bg-hover)]"
                      style={{
                        backgroundColor:
                          activeId === 'ch-22' ? 'var(--accent-soft)' : undefined,
                        color:
                          activeId === 'ch-22' ? 'var(--accent)' : 'var(--text-secondary)',
                        fontWeight: activeId === 'ch-22' ? 600 : 400,
                      }}
                    >
                      <span className="truncate">
                        <span
                          className="ml-1.5 font-mono text-[11px] tabular-nums"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          ۲۲
                        </span>
                        نکات طلایی مهندسی و چک‌لیست
                      </span>
                    </button>
                  </li>
                )}
              </ul>
            </div>
          );
        })}
      </nav>
    </div>
  );
};
