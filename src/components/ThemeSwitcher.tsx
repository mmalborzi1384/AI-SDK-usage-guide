import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Moon, Palette, Sun } from 'lucide-react';
import { THEMES, ThemeId } from '../types/theme';

interface ThemeSwitcherProps {
  theme: ThemeId;
  onSelectTheme: (theme: ThemeId) => void;
  onToggleDarkMode: () => void;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  theme,
  onSelectTheme,
  onToggleDarkMode,
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const current = THEMES.find((t) => t.id === theme) ?? THEMES[0];
  const isDark = current.mode === 'dark';

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative flex items-center gap-1.5">
      {/* Quick Day / Night Mode Toggle */}
      <button
        type="button"
        onClick={onToggleDarkMode}
        aria-label={isDark ? 'تغییر به حالت روشن' : 'تغییر به حالت تیره'}
        className="inline-flex h-9 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-colors hover:bg-[var(--bg-hover)] whitespace-nowrap"
        style={{
          borderColor: 'var(--border-subtle)',
          backgroundColor: 'var(--bg-surface)',
          color: 'var(--text-primary)',
        }}
      >
        {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
        <span>{isDark ? 'حالت روشن' : 'دارک مود'}</span>
      </button>

      {/* Curated Theme Selector Dropdown */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="inline-flex h-9 items-center gap-2 rounded-md border px-2.5 text-xs font-medium transition-colors hover:bg-[var(--bg-hover)] whitespace-nowrap"
        style={{
          borderColor: open ? 'var(--accent)' : 'var(--border-subtle)',
          backgroundColor: 'var(--bg-surface)',
          color: 'var(--text-primary)',
        }}
      >
        <Palette className="h-3.5 w-3.5" style={{ color: 'var(--accent)' }} />
        <span>تم: {current.nameFa}</span>
        <span className="flex items-center gap-0.5" aria-hidden="true">
          {current.swatches.map((hex, i) => (
            <span
              key={i}
              className="h-2.5 w-2.5 rounded-xs border border-black/15"
              style={{ backgroundColor: hex }}
            />
          ))}
        </span>
        <ChevronDown
          className="h-3.5 w-3.5 transition-transform duration-150"
          style={{
            color: open ? 'var(--accent)' : 'var(--text-muted)',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="انتخاب تم ظاهری"
          className="absolute top-11 left-0 z-50 w-64 max-w-[calc(100vw-2rem)] rounded-lg border p-1.5 shadow-xl"
          style={{
            borderColor: 'var(--border-strong)',
            backgroundColor: 'var(--bg-surface)',
          }}
        >
          <p
            className="px-2.5 pt-1 pb-1.5 text-[11px] font-semibold"
            style={{ color: 'var(--text-muted)' }}
          >
            انتخاب پالت و محیط مطالعه
          </p>
          <div className="space-y-1">
            {THEMES.map((item) => {
              const selected = item.id === theme;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onSelectTheme(item.id);
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between gap-3 rounded-md px-2.5 py-2 text-right transition-colors hover:bg-[var(--bg-hover)]"
                  style={{
                    backgroundColor: selected ? 'var(--accent-soft)' : undefined,
                    color: 'var(--text-primary)',
                  }}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-xs font-semibold">
                      <span style={{ color: selected ? 'var(--accent)' : 'var(--text-primary)' }}>
                        {item.nameFa}
                      </span>
                      {selected && (
                        <Check className="h-3.5 w-3.5" style={{ color: 'var(--accent)' }} />
                      )}
                    </div>
                    <p className="mt-0.5 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      {item.subtitleFa}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1" aria-hidden="true">
                    {item.swatches.map((hex, idx) => (
                      <span
                        key={idx}
                        className="h-4 w-3 rounded-xs border border-black/15"
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
