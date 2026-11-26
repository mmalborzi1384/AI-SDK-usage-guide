import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowUp,
  Check,
  ChevronDown,
  ChevronUp,
  Columns2,
  FileDown,
  Maximize2,
  Menu,
  Minimize2,
  Rows3,
  Search,
  Type,
  X,
} from 'lucide-react';
import {
  ALL_CHAPTERS,
  AUDIT_CHANGES,
  GOLDEN_TIPS,
  GUIDE_PARTS,
  QUICK_REF_ROWS,
  TOTAL_CHAPTER_COUNT,
  toPersianDigits,
} from './data/guideData';
import { ViewMode } from './types/guide';
import { THEMES, ThemeId } from './types/theme';
import { CodeScale } from './components/CodeBlock';
import { QuickReferenceTable } from './components/QuickReferenceTable';
import { ChapterSection } from './components/ChapterSection';
import { TocSidebar } from './components/TocSidebar';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { CommandPalette } from './components/CommandPalette';
import { WorkbenchPanel, WorkbenchTab } from './components/WorkbenchPanel';
import { PrintConfig } from './components/ExportStudio';

const BOOKMARKS_KEY = 'llm-sdk-guide-bookmarks-v1';
const CHECKLIST_KEY = 'llm-sdk-guide-checklist-v1';
const NOTES_KEY = 'llm-sdk-guide-notes-v1';
const MASTERED_KEY = 'llm-sdk-guide-mastered-v1';
const THEME_KEY = 'llm-sdk-theme-v2';

function getInitialTheme(): ThemeId {
  try {
    const saved = window.localStorage.getItem(THEME_KEY) as ThemeId | null;
    if (saved && THEMES.some((t) => t.id === saved)) return saved;
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'obsidian-dark';
  } catch {
    // fallback
  }
  return 'editorial-light';
}

export default function App() {
  const [theme, setTheme] = useState<ThemeId>(getInitialTheme);
  const [lastLightTheme, setLastLightTheme] = useState<ThemeId>('editorial-light');
  const [lastDarkTheme, setLastDarkTheme] = useState<ThemeId>('obsidian-dark');
  const [viewMode, setViewMode] = useState<ViewMode>('side-by-side');
  const [codeScale, setCodeScale] = useState<CodeScale>('md');
  const [focusMode, setFocusMode] = useState(false);

  const [workbenchOpen, setWorkbenchOpen] = useState(true);
  const [workbenchTab, setWorkbenchTab] = useState<WorkbenchTab>('scaffolder');

  const [printConfig, setPrintConfig] = useState<PrintConfig>({
    includeQuickRef: true,
    includePersonalNotes: true,
    onlyBookmarkedInPrint: false,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [mobileTocOpen, setMobileTocOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>('toc-section');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackTop, setShowBackTop] = useState(false);

  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const saved = window.localStorage.getItem(BOOKMARKS_KEY);
      return saved ? (JSON.parse(saved) as string[]) : ['ch-7', 'ch-9', 'ch-15'];
    } catch {
      return ['ch-7', 'ch-9', 'ch-15'];
    }
  });

  const [masteredIds, setMasteredIds] = useState<string[]>(() => {
    try {
      const saved = window.localStorage.getItem(MASTERED_KEY);
      return saved ? (JSON.parse(saved) as string[]) : ['ch-1', 'ch-2'];
    } catch {
      return ['ch-1', 'ch-2'];
    }
  });

  const [personalNotes, setPersonalNotes] = useState<Record<string, string>>(() => {
    try {
      const saved = window.localStorage.getItem(NOTES_KEY);
      return saved ? (JSON.parse(saved) as Record<string, string>) : {};
    } catch {
      return {};
    }
  });

  const [checkedTips, setCheckedTips] = useState<string[]>(() => {
    try {
      const saved = window.localStorage.getItem(CHECKLIST_KEY);
      return saved ? (JSON.parse(saved) as string[]) : [];
    } catch {
      return [];
    }
  });

  // Sync theme to documentElement + localStorage
  useEffect(() => {
    const def = THEMES.find((t) => t.id === theme) ?? THEMES[0];
    document.documentElement.setAttribute('data-theme', def.id);
    if (def.mode === 'dark') {
      document.documentElement.classList.add('dark');
      setLastDarkTheme(def.id);
    } else {
      document.documentElement.classList.remove('dark');
      setLastLightTheme(def.id);
    }
    try {
      window.localStorage.setItem(THEME_KEY, def.id);
    } catch {
      // ignore
    }
  }, [theme]);

  useEffect(() => {
    try {
      window.localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    } catch {
      // ignore
    }
  }, [bookmarks]);

  useEffect(() => {
    try {
      window.localStorage.setItem(MASTERED_KEY, JSON.stringify(masteredIds));
    } catch {
      // ignore
    }
  }, [masteredIds]);

  useEffect(() => {
    try {
      window.localStorage.setItem(NOTES_KEY, JSON.stringify(personalNotes));
    } catch {
      // ignore
    }
  }, [personalNotes]);

  useEffect(() => {
    try {
      window.localStorage.setItem(CHECKLIST_KEY, JSON.stringify(checkedTips));
    } catch {
      // ignore
    }
  }, [checkedTips]);

  const handleToggleDarkMode = () => {
    const current = THEMES.find((t) => t.id === theme) ?? THEMES[0];
    setTheme(current.mode === 'dark' ? lastLightTheme : lastDarkTheme);
  };

  // Global keyboard ergonomics: Ctrl+K (search), F (focus mode), D (dark mode), J/K (chapter nav)
  useEffect(() => {
    const chapterIds = [...ALL_CHAPTERS.map((c) => c.id), 'ch-22'];
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdOpen((v) => !v);
        return;
      }

      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || cmdOpen) return;

      const key = e.key.toLowerCase();
      if (key === 'f' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setFocusMode((v) => !v);
      } else if (key === 'd' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        handleToggleDarkMode();
      } else if (key === 'j' || key === 'k') {
        const curIdx = chapterIds.indexOf(activeId);
        const nextIdx =
          key === 'j'
            ? Math.min(chapterIds.length - 1, curIdx + 1)
            : Math.max(0, curIdx <= 0 ? 0 : curIdx - 1);
        const target = document.getElementById(chapterIds[nextIdx]);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setActiveId(chapterIds[nextIdx]);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeId, cmdOpen, theme, lastLightTheme, lastDarkTheme]);

  // Reading depth progress bar + mobile back-to-top
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - doc.clientHeight;
      const pct = total > 0 ? Math.min(100, Math.max(0, (window.scrollY / total) * 100)) : 0;
      setScrollProgress(pct);
      setShowBackTop(window.scrollY > 520);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileTocOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileTocOpen]);

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleMastered = (id: string) => {
    setMasteredIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const updateNote = (id: string, value: string) => {
    setPersonalNotes((prev) => {
      const next = { ...prev };
      if (value.trim() === '') delete next[id];
      else next[id] = value;
      return next;
    });
  };

  const toggleTipCheck = (id: string) => {
    setCheckedTips((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleImportBackup = (data: {
    bookmarks?: string[];
    personalNotes?: Record<string, string>;
    masteredIds?: string[];
  }) => {
    if (data.bookmarks) setBookmarks(data.bookmarks);
    if (data.personalNotes) setPersonalNotes(data.personalNotes);
    if (data.masteredIds) setMasteredIds(data.masteredIds);
  };

  const cycleCodeScale = () => {
    setCodeScale((prev) => (prev === 'sm' ? 'md' : prev === 'md' ? 'lg' : 'sm'));
  };

  const filteredChapters = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return ALL_CHAPTERS.filter((ch) => {
      if (onlyBookmarked && !bookmarks.includes(ch.id)) return false;
      if (!q) return true;
      const hay = [
        ch.titleFa,
        ch.titleEn,
        ch.summary,
        personalNotes[ch.id] ?? '',
        ...(ch.notes ?? []),
        ...ch.blocks.map((b) => `${b.label} ${b.code}`),
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [searchQuery, onlyBookmarked, bookmarks, personalNotes]);

  const filteredQuickRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return QUICK_REF_ROWS;
    return QUICK_REF_ROWS.filter((row) =>
      `${row.operation} ${row.openaiCode} ${row.googleCode} ${row.openaiNote ?? ''} ${row.googleNote ?? ''}`
        .toLowerCase()
        .includes(q)
    );
  }, [searchQuery]);

  useEffect(() => {
    const sectionIds = [
      'toc-section',
      'quick-reference',
      ...ALL_CHAPTERS.map((c) => c.id),
      'ch-22',
    ];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-88px 0px -65% 0px', threshold: 0.01 }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [filteredChapters]);

  const handleNavigate = (id: string) => {
    setMobileTocOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveId(id);
    }
  };

  return (
    <div
      className="min-h-screen transition-colors"
      style={{
        backgroundColor: 'var(--bg-canvas)',
        color: 'var(--text-primary)',
      }}
    >
      {/* Top Bar Contract: Strict 3-zone, single-row */}
      <header
        className="no-print sticky top-0 z-30 border-b backdrop-blur-md"
        style={{
          borderColor: 'var(--border-subtle)',
          backgroundColor: 'color-mix(in srgb, var(--bg-canvas) 90%, transparent)',
        }}
      >
        <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between gap-4 px-4 sm:gap-8 sm:px-6 lg:px-8">
          {/* Zone 1: Single-line wordmark */}
          <a
            href="#toc-section"
            className="text-sm font-extrabold tracking-tight whitespace-nowrap shrink-0 sm:text-base"
            style={{ color: 'var(--text-primary)' }}
          >
            راهنمای جامع LLM SDKs
          </a>

          {/* Zone 2: 4 clean single-line nav links */}
          <nav
            aria-label="ناوبری اصلی"
            className="hidden md:flex items-center gap-6 text-sm font-medium"
            style={{ color: 'var(--text-muted)' }}
          >
            <a
              href="#toc-section"
              className="transition-colors hover:text-[var(--text-primary)] hover:underline underline-offset-4 whitespace-nowrap shrink-0"
            >
              فهرست مطالب
            </a>
            <a
              href="#quick-reference"
              className="transition-colors hover:text-[var(--text-primary)] hover:underline underline-offset-4 whitespace-nowrap shrink-0"
            >
              مرجع سریع
            </a>
            <a
              href="#part-1"
              className="transition-colors hover:text-[var(--text-primary)] hover:underline underline-offset-4 whitespace-nowrap shrink-0"
            >
              فصل‌های عملی
            </a>
            <a
              href="#ch-22"
              className="transition-colors hover:text-[var(--text-primary)] hover:underline underline-offset-4 whitespace-nowrap shrink-0"
            >
              نکات طلایی
            </a>
          </nav>

          {/* Zone 3: 1 primary CTA (+ mobile menu trigger) */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setMobileTocOpen(true)}
              aria-label="باز کردن فهرست مطالب"
              className={`inline-flex h-9 w-9 items-center justify-center rounded-md border ${
                focusMode ? '' : 'lg:hidden'
              }`}
              style={{
                borderColor: 'var(--border-subtle)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
              }}
            >
              <Menu className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex h-9 items-center gap-1.5 rounded-md px-3.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'var(--accent-contrast)',
              }}
            >
              <FileDown className="h-3.5 w-3.5" />
              <span>ذخیره و چاپ PDF</span>
            </button>
          </div>
        </div>

        {/* Reading Depth Progress Hairline */}
        <div aria-hidden="true" className="h-[2px] w-full">
          <div
            className="h-full transition-[width] duration-150"
            style={{
              width: `${scrollProgress}%`,
              backgroundColor: 'var(--accent)',
            }}
          />
        </div>
      </header>

      {/* Slide-Over TOC Sheet (Mobile + Focus Mode) */}
      {mobileTocOpen && (
        <div
          className="no-print fixed inset-0 z-50 flex"
          role="dialog"
          aria-modal="true"
          aria-label="فهرست مطالب"
        >
          <div
            className="fixed inset-0 bg-black/55 backdrop-blur-xs"
            onClick={() => setMobileTocOpen(false)}
          />
          <div
            className="relative z-10 flex h-full w-[86vw] max-w-sm flex-col border-l p-5 shadow-2xl"
            style={{
              borderColor: 'var(--border-strong)',
              backgroundColor: 'var(--bg-canvas)',
            }}
          >
            <div
              className="mb-3 flex items-center justify-between border-b pb-3"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <span className="text-sm font-extrabold" style={{ color: 'var(--text-primary)' }}>
                ناوبری راهنما
              </span>
              <button
                type="button"
                onClick={() => setMobileTocOpen(false)}
                aria-label="بستن فهرست"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border"
                style={{
                  borderColor: 'var(--border-subtle)',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <TocSidebar
              parts={GUIDE_PARTS}
              chapters={filteredChapters}
              activeId={activeId}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              bookmarks={bookmarks}
              masteredIds={masteredIds}
              personalNotes={personalNotes}
              onlyBookmarked={onlyBookmarked}
              onToggleOnlyBookmarked={() => setOnlyBookmarked((v) => !v)}
              onNavigate={handleNavigate}
              isDrawer
            />
          </div>
        </div>
      )}

      {/* Command Palette (Ctrl+K / Cmd+K) */}
      <CommandPalette
        open={cmdOpen}
        onClose={() => setCmdOpen(false)}
        chapters={ALL_CHAPTERS}
        quickRows={QUICK_REF_ROWS}
        onNavigate={handleNavigate}
      />

      {/* Full-Bleed Architectural Layout */}
      <div
        className={`mx-auto flex flex-col lg:flex-row print:block print:max-w-none ${
          focusMode ? 'max-w-5xl' : 'max-w-[1440px]'
        }`}
      >
        {/* Sticky Editorial Index Rail (hidden in Focus Mode & mobile) */}
        {!focusMode && (
          <aside
            aria-label="فهرست مطالب راهنما"
            className="no-print code-scroll hidden lg:sticky lg:top-14 lg:block lg:h-[calc(100vh-3.5rem)] lg:w-76 lg:shrink-0 lg:overflow-y-auto lg:border-l lg:px-6"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <TocSidebar
              parts={GUIDE_PARTS}
              chapters={filteredChapters}
              activeId={activeId}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              bookmarks={bookmarks}
              masteredIds={masteredIds}
              personalNotes={personalNotes}
              onlyBookmarked={onlyBookmarked}
              onToggleOnlyBookmarked={() => setOnlyBookmarked((v) => !v)}
              onNavigate={handleNavigate}
            />
          </aside>
        )}

        {/* Main Monograph Reading Canvas */}
        <main className="min-w-0 flex-1 px-4 py-7 sm:px-8 sm:py-10 lg:px-12 lg:py-12 print:p-0">
          {/* Page 1: Swiss-Persian Monograph Masthead + Complete Initial TOC */}
          <section id="toc-section" className="print-break-after pb-10 print:pb-0">
            {/* Editorial Masthead with Architectural Drafting Marks */}
            <div
              className="relative border-b pb-8 print:pb-5"
              style={{ borderColor: 'var(--border-strong)' }}
            >
              <div
                className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs"
                style={{ color: 'var(--text-muted)' }}
              >
                <span className="font-semibold" style={{ color: 'var(--accent)' }}>
                  تک‌نگاری فنی مهندسی هوش مصنوعی
                </span>
                <span aria-hidden="true">·</span>
                <span dir="ltr" className="font-mono text-[11px]">
                  OpenAI Responses API (GPT-6.2) vs Google Gen AI SDK (Gemini 4)
                </span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">
                  {toPersianDigits(TOTAL_CHAPTER_COUNT)} فصل عملیاتی · همگام با مستندات رسمی ۲۰۲۶
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-end">
                <div className="lg:col-span-8">
                  <h1
                    className="text-3xl font-extrabold leading-[1.2] tracking-tight [text-wrap:balance] sm:text-5xl print:text-3xl"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    راهنمای جامع و کاربردی LLM SDKs
                  </h1>
                  <p
                    className="mt-4 max-w-2xl text-[15px] leading-[1.85] sm:text-base print:mt-2.5 print:text-[9.5pt]"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    مرجع سریع و عملی برای کار روزمره با{' '}
                    <code
                      className="rounded px-1.5 py-0.5 text-[0.88em] font-semibold"
                      style={{
                        backgroundColor: 'var(--openai-soft)',
                        color: 'var(--openai-accent)',
                      }}
                    >
                      openai
                    </code>{' '}
                    (نسخه مدرن Responses API) در برابر{' '}
                    <code
                      className="rounded px-1.5 py-0.5 text-[0.88em] font-semibold"
                      style={{
                        backgroundColor: 'var(--google-soft)',
                        color: 'var(--google-accent)',
                      }}
                    >
                      google-genai
                    </code>{' '}
                    (کتابخانه بومی Gemini). همراه با میز کار تعاملی برای ساخت کد، تبدیل سینتکس،
                    محاسبه هزینه و چاپ استاندارد A4.
                  </p>
                </div>

                {/* Archival Specification Strip */}
                <dl
                  className="grid grid-cols-2 gap-x-5 gap-y-3 border-t pt-4 text-xs lg:col-span-4 lg:border-t-0 lg:border-r lg:pt-0 lg:pr-6 print:pt-2"
                  style={{ borderColor: 'var(--border-subtle)' }}
                >
                  <div>
                    <dt style={{ color: 'var(--text-muted)' }}>گردآوری پایه</dt>
                    <dd
                      className="mt-0.5 font-mono text-[11.5px] font-semibold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      MohammadmahdiAlborzi
                    </dd>
                  </div>
                  <div>
                    <dt style={{ color: 'var(--text-muted)' }}>زبان و محیط</dt>
                    <dd
                      className="mt-0.5 font-mono text-[11.5px] font-semibold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      Python 3.10+
                    </dd>
                  </div>
                  <div>
                    <dt style={{ color: 'var(--text-muted)' }}>ساختار راهنما</dt>
                    <dd
                      className="mt-0.5 font-semibold tabular-nums"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      ۵ بخش · {toPersianDigits(TOTAL_CHAPTER_COUNT)} فصل کامل
                    </dd>
                  </div>
                  <div>
                    <dt style={{ color: 'var(--text-muted)' }}>میانبرهای کلیدی</dt>
                    <dd
                      dir="ltr"
                      className="mt-0.5 text-right font-mono text-[11px] font-semibold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      Ctrl+K · J/K · F · D
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Workspace Studio Bar (Search, Themes, Focus Mode, Code Font Size, View Mode) */}
            <div
              className="no-print flex flex-wrap items-center justify-between gap-3 border-b py-4"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCmdOpen(true)}
                  className="inline-flex h-9 items-center gap-2 rounded-md border px-3 text-xs font-medium transition-colors whitespace-nowrap"
                  style={{
                    borderColor: 'var(--border-subtle)',
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <Search className="h-3.5 w-3.5" style={{ color: 'var(--accent)' }} />
                  <span>جستجوی سریع</span>
                  <kbd
                    dir="ltr"
                    className="hidden rounded border px-1.5 py-0.5 text-[10px] sm:inline-block"
                    style={{
                      borderColor: 'var(--border-subtle)',
                      backgroundColor: 'var(--bg-subtle)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    Ctrl K
                  </kbd>
                </button>

                <ThemeSwitcher
                  theme={theme}
                  onSelectTheme={setTheme}
                  onToggleDarkMode={handleToggleDarkMode}
                />

                {/* Focus Mode Toggle */}
                <button
                  type="button"
                  onClick={() => setFocusMode((v) => !v)}
                  aria-pressed={focusMode}
                  title="حالت تمرکز مطالعه (کلید F)"
                  className="hidden h-9 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-colors lg:inline-flex whitespace-nowrap"
                  style={{
                    borderColor: focusMode ? 'var(--accent)' : 'var(--border-subtle)',
                    backgroundColor: focusMode ? 'var(--accent-soft)' : 'var(--bg-surface)',
                    color: focusMode ? 'var(--accent)' : 'var(--text-secondary)',
                  }}
                >
                  {focusMode ? (
                    <Minimize2 className="h-3.5 w-3.5" />
                  ) : (
                    <Maximize2 className="h-3.5 w-3.5" />
                  )}
                  <span>{focusMode ? 'خروج از تمرکز' : 'حالت تمرکز'}</span>
                </button>

                {/* Code Font Size Cycler */}
                <button
                  type="button"
                  onClick={cycleCodeScale}
                  title="تغییر اندازه فونت کدها"
                  className="inline-flex h-9 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-colors whitespace-nowrap"
                  style={{
                    borderColor: 'var(--border-subtle)',
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <Type className="h-3.5 w-3.5" />
                  <span>
                    فونت کد:{' '}
                    {codeScale === 'sm' ? 'کوچک' : codeScale === 'lg' ? 'بزرگ' : 'متوسط'}
                  </span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* View Mode Segmented Switcher */}
                <div
                  className="inline-flex flex-wrap items-center gap-0.5 rounded-md border p-0.5"
                  style={{
                    borderColor: 'var(--border-subtle)',
                    backgroundColor: 'var(--bg-subtle)',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setViewMode('side-by-side')}
                    className="inline-flex h-8 items-center gap-1.5 rounded px-2.5 text-xs font-medium transition-colors whitespace-nowrap"
                    style={{
                      backgroundColor:
                        viewMode === 'side-by-side' ? 'var(--bg-surface)' : 'transparent',
                      color:
                        viewMode === 'side-by-side'
                          ? 'var(--text-primary)'
                          : 'var(--text-muted)',
                    }}
                  >
                    <Columns2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">کنار هم</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('stacked')}
                    className="inline-flex h-8 items-center gap-1.5 rounded px-2.5 text-xs font-medium transition-colors whitespace-nowrap"
                    style={{
                      backgroundColor:
                        viewMode === 'stacked' ? 'var(--bg-surface)' : 'transparent',
                      color:
                        viewMode === 'stacked' ? 'var(--text-primary)' : 'var(--text-muted)',
                    }}
                  >
                    <Rows3 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">تک‌ستونه</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('openai')}
                    className="inline-flex h-8 items-center rounded px-2.5 text-xs font-medium transition-colors whitespace-nowrap"
                    style={{
                      backgroundColor:
                        viewMode === 'openai' ? 'var(--bg-surface)' : 'transparent',
                      color:
                        viewMode === 'openai'
                          ? 'var(--openai-accent)'
                          : 'var(--text-muted)',
                    }}
                  >
                    OpenAI
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('google')}
                    className="inline-flex h-8 items-center rounded px-2.5 text-xs font-medium transition-colors whitespace-nowrap"
                    style={{
                      backgroundColor:
                        viewMode === 'google' ? 'var(--bg-surface)' : 'transparent',
                      color:
                        viewMode === 'google'
                          ? 'var(--google-accent)'
                          : 'var(--text-muted)',
                    }}
                  >
                    Google
                  </button>
                </div>

                {/* Expandable Changelog / Audit Trigger */}
                <button
                  type="button"
                  onClick={() => setShowAuditLog((v) => !v)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-xs font-medium transition-colors whitespace-nowrap"
                  style={{
                    borderColor: showAuditLog ? 'var(--accent)' : 'var(--border-subtle)',
                    backgroundColor: showAuditLog ? 'var(--accent-soft)' : 'var(--bg-surface)',
                    color: showAuditLog ? 'var(--accent)' : 'var(--text-secondary)',
                  }}
                >
                  <span>اصلاحات فایل اصلی</span>
                  {showAuditLog ? (
                    <ChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Expandable Audit Summary */}
            {showAuditLog && (
              <div
                className="no-print mt-4 border p-5"
                style={{
                  borderColor: 'var(--border-subtle)',
                  backgroundColor: 'var(--bg-surface)',
                }}
              >
                <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  گزارش بازطراحی PDF اصلی و تکمیل حفره‌ها بر اساس مستندات رسمی
                </h2>
                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                  {AUDIT_CHANGES.map((item, idx) => (
                    <div
                      key={idx}
                      className="border p-3.5"
                      style={{
                        borderColor: 'var(--border-subtle)',
                        backgroundColor: 'var(--bg-canvas)',
                      }}
                    >
                      <p
                        className="text-[11px] font-semibold"
                        style={{ color: 'var(--accent)' }}
                      >
                        {item.category}
                      </p>
                      <p
                        className="mt-1 text-xs font-bold"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {item.title}
                      </p>
                      <p
                        className="mt-1.5 text-xs leading-relaxed"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {item.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interactive Engineering Workbench (Scaffolder, Translator, API Cost Estimator, Architecture Explorer, Export Studio) */}
            <WorkbenchPanel
              open={workbenchOpen}
              activeTab={workbenchTab}
              theme={theme}
              onToggleOpen={() => setWorkbenchOpen((v) => !v)}
              onSelectTab={setWorkbenchTab}
              onNavigate={handleNavigate}
              printConfig={printConfig}
              onChangePrintConfig={setPrintConfig}
              bookmarks={bookmarks}
              personalNotes={personalNotes}
              masteredIds={masteredIds}
              onImportBackup={handleImportBackup}
            />

            {/* Complete Clickable Initial Table of Contents (Cover Page 1 in Print) */}
            <div className="mt-8 print:mt-5">
              <div
                className="mb-4 flex items-baseline justify-between border-b pb-2.5 print:mb-3"
                style={{ borderColor: 'var(--border-strong)' }}
              >
                <h2
                  className="text-xl font-extrabold print:text-base"
                  style={{ color: 'var(--text-primary)' }}
                >
                  فهرست مطالب
                </h2>
                <span className="text-xs tabular-nums" style={{ color: 'var(--text-muted)' }}>
                  مرجع سریع + {toPersianDigits(TOTAL_CHAPTER_COUNT)} فصل در ۵ بخش
                </span>
              </div>

              <div
                className="mb-4 flex items-center justify-between border-b border-dashed pb-2.5 text-sm print:mb-2 print:pb-1.5 print:text-xs"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <button
                  type="button"
                  onClick={() => handleNavigate('quick-reference')}
                  className="text-right font-bold hover:underline"
                  style={{ color: 'var(--accent)' }}
                >
                  ۰۰. جدول مرجع سریع — مقایسه ۲۲ عملیات پرکاربرد در یک نگاه
                </button>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  مرجع فوری
                </span>
              </div>

              <div className="grid grid-cols-1 gap-x-10 gap-y-5 md:grid-cols-2 print:grid-cols-2 print:gap-x-6 print:gap-y-2.5">
                {GUIDE_PARTS.map((part) => {
                  const partChs = ALL_CHAPTERS.filter((c) => c.partId === part.id);
                  return (
                    <div key={part.id} className="print-avoid-break">
                      <p
                        className="mb-2 text-xs font-bold print:mb-1 print:text-[8.5pt]"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {part.number} — {part.titleFa}
                      </p>
                      <ol className="space-y-1.5 print:space-y-0.5">
                        {partChs.map((ch) => (
                          <li
                            key={ch.id}
                            className="flex items-baseline justify-between gap-2 text-[13.5px] leading-snug print:text-[8.3pt]"
                          >
                            <button
                              type="button"
                              onClick={() => handleNavigate(ch.id)}
                              className="text-right transition-colors hover:text-[var(--accent)] hover:underline"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              <span
                                className="ml-2 inline-block w-5 font-mono text-xs font-semibold tabular-nums"
                                style={{ color: 'var(--accent)' }}
                              >
                                {toPersianDigits(String(ch.number).padStart(2, '0'))}
                              </span>
                              <span>{ch.titleFa}</span>
                            </button>
                            {ch.isNew && (
                              <span
                                className="shrink-0 text-[10.5px] font-medium"
                                style={{ color: 'var(--openai-accent)' }}
                              >
                                جدید
                              </span>
                            )}
                          </li>
                        ))}
                        {part.id === 'part-5' && (
                          <li className="flex items-baseline justify-between gap-2 text-[13.5px] leading-snug print:text-[8.3pt]">
                            <button
                              type="button"
                              onClick={() => handleNavigate('ch-22')}
                              className="text-right transition-colors hover:text-[var(--accent)] hover:underline"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              <span
                                className="ml-2 inline-block w-5 font-mono text-xs font-semibold tabular-nums"
                                style={{ color: 'var(--accent)' }}
                              >
                                ۲۲
                              </span>
                              <span>نکات طلایی مهندسی و چک‌لیست محیط عملیاتی</span>
                            </button>
                          </li>
                        )}
                      </ol>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Quick Reference Table */}
          {!onlyBookmarked && filteredQuickRows.length > 0 && (
            <div className={printConfig.includeQuickRef ? '' : 'print:hidden'}>
              <QuickReferenceTable
                rows={filteredQuickRows}
                onJumpToChapter={handleNavigate}
              />
            </div>
          )}

          {/* Active Filter Empty State */}
          {filteredChapters.length === 0 ? (
            <div
              className="my-12 border p-10 text-center"
              style={{
                borderColor: 'var(--border-subtle)',
                backgroundColor: 'var(--bg-surface)',
              }}
            >
              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                فصلی با فیلتر فعلی پیدا نشد.
              </p>
              <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                عبارت جستجو را تغییر دهید یا فیلتر «نشان» را غیرفعال کنید.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setOnlyBookmarked(false);
                }}
                className="mt-4 rounded-md px-4 py-2 text-xs font-semibold"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: 'var(--accent-contrast)',
                }}
              >
                نمایش همه فصل‌ها
              </button>
            </div>
          ) : (
            GUIDE_PARTS.map((part) => {
              const partChapters = filteredChapters.filter((c) => c.partId === part.id);
              if (partChapters.length === 0) return null;

              const hasAnyPrintableChapter =
                !printConfig.onlyBookmarkedInPrint ||
                partChapters.some((ch) => bookmarks.includes(ch.id));

              return (
                <section
                  key={part.id}
                  id={part.id}
                  className={`mt-10 print:mt-4 ${hasAnyPrintableChapter ? '' : 'print:hidden'}`}
                >
                  <div
                    className="border-t-2 pt-6 pb-4 print:break-after-avoid print:pt-3 print:pb-2"
                    style={{ borderColor: 'var(--text-primary)' }}
                  >
                    <p className="text-xs font-bold" style={{ color: 'var(--accent)' }}>
                      {part.number}
                    </p>
                    <h2
                      className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl print:text-lg"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {part.titleFa}
                    </h2>
                    <p
                      className="mt-1.5 text-sm print:text-xs"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {part.subtitle}
                    </p>
                  </div>

                  <div>
                    {partChapters.map((chapter) => (
                      <ChapterSection
                        key={chapter.id}
                        chapter={chapter}
                        viewMode={viewMode}
                        codeScale={codeScale}
                        isBookmarked={bookmarks.includes(chapter.id)}
                        isMastered={masteredIds.includes(chapter.id)}
                        personalNote={personalNotes[chapter.id] ?? ''}
                        includeNoteInPrint={printConfig.includePersonalNotes}
                        hideInPrint={
                          printConfig.onlyBookmarkedInPrint && !bookmarks.includes(chapter.id)
                        }
                        onToggleBookmark={toggleBookmark}
                        onToggleMastered={toggleMastered}
                        onUpdateNote={updateNote}
                      />
                    ))}
                  </div>
                </section>
              );
            })
          )}

          {/* Chapter 22: Interactive Golden Engineering Checklist */}
          {!onlyBookmarked && !searchQuery.trim() && (
            <section
              id="ch-22"
              className="print-avoid-break mt-6 border-t-2 pt-8 pb-8 print:pt-5"
              style={{ borderColor: 'var(--text-primary)' }}
            >
              <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold" style={{ color: 'var(--accent)' }}>
                    فصل ۲۲ · Production Engineering Checklist
                  </p>
                  <h2
                    className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl print:text-xl"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    ۲۲. نکات طلایی مهندسی و چک‌لیست استقرار
                  </h2>
                </div>
                <span
                  className="no-print text-xs font-medium tabular-nums"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {toPersianDigits(checkedTips.length)} از {toPersianDigits(GOLDEN_TIPS.length)} مورد
                  بررسی‌شده
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 print:grid-cols-2 print:gap-3">
                {GOLDEN_TIPS.map((tip) => {
                  const checked = checkedTips.includes(tip.id);
                  return (
                    <div
                      key={tip.id}
                      className="print-avoid-break rounded-md border p-5 transition-colors print:p-3.5"
                      style={{
                        borderColor: checked
                          ? 'var(--openai-accent)'
                          : 'var(--border-subtle)',
                        backgroundColor: 'var(--bg-surface)',
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-baseline gap-2.5">
                          <span
                            className="font-mono text-xs font-bold tabular-nums"
                            style={{ color: 'var(--accent)' }}
                          >
                            {tip.number}
                          </span>
                          <h3
                            className="text-sm font-bold"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {tip.title}
                          </h3>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleTipCheck(tip.id)}
                          aria-pressed={checked}
                          aria-label={`تیک زدن ${tip.title}`}
                          className="no-print flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] border transition-all duration-150"
                          style={{
                            borderColor: checked
                              ? 'var(--openai-accent)'
                              : 'var(--border-strong)',
                            backgroundColor: checked
                              ? 'var(--openai-accent)'
                              : 'var(--bg-canvas)',
                            color: 'var(--accent-contrast)',
                          }}
                        >
                          <Check
                            className="h-3.5 w-3.5 transition-transform duration-150"
                            strokeWidth={3}
                            style={{
                              opacity: checked ? 1 : 0,
                              transform: checked ? 'scale(1)' : 'scale(0.55)',
                            }}
                          />
                        </button>
                      </div>

                      <p
                        className="mt-2.5 text-[13.5px] leading-[1.8] print:text-[8.8pt]"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {tip.body}
                      </p>

                      {tip.codeHint && (
                        <div
                          dir="ltr"
                          className="mt-3 overflow-x-auto rounded border px-3 py-1.5 text-left font-mono text-[11.5px]"
                          style={{
                            borderColor: 'var(--code-border)',
                            backgroundColor: 'var(--code-bg)',
                            color: 'var(--syn-fn)',
                          }}
                        >
                          {tip.codeHint}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Quiet Editorial Footer */}
          <footer
            className="mt-10 border-t pt-6 pb-14 text-xs lg:pb-4 print:mt-6 print:pt-3 print:pb-0"
            style={{
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-muted)',
            }}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p>
                راهنمای جامع LLM SDKs — مرجع مقایسه‌ای OpenAI Responses API و Google Gen AI SDK
              </p>
              <p className="no-print">
                میانبرها: Ctrl+K جستجو · J/K جابه‌جایی فصل · F تمرکز · D دارک مود
              </p>
            </div>
          </footer>
        </main>
      </div>

      {/* Compact Mobile Thumb Actions */}
      {showBackTop && (
        <div className="no-print fixed bottom-4 left-4 z-30 flex items-center gap-2 lg:hidden">
          <button
            type="button"
            onClick={() => setCmdOpen(true)}
            aria-label="جستجوی سریع"
            className="inline-flex h-11 w-11 items-center justify-center rounded-md border shadow-md"
            style={{
              borderColor: 'var(--border-strong)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
            }}
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="بازگشت به بالای صفحه"
            className="inline-flex h-11 w-11 items-center justify-center rounded-md shadow-md"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--accent-contrast)',
            }}
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
