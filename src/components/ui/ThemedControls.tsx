import React, { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export interface ThemedSelectOption {
  value: string;
  label: string;
  meta?: string;
  description?: string;
}

interface ThemedSelectProps {
  id?: string;
  value: string;
  options: ThemedSelectOption[];
  onChange: (value: string) => void;
  accentColor?: string;
  softBg?: string;
  dir?: 'ltr' | 'rtl';
  className?: string;
  ariaLabel?: string;
  triggerBg?: string;
}

export const ThemedSelect: React.FC<ThemedSelectProps> = ({
  id,
  value,
  options,
  onChange,
  accentColor = 'var(--accent)',
  softBg = 'var(--accent-soft)',
  dir = 'ltr',
  className = '',
  ariaLabel,
  triggerBg = 'var(--bg-canvas)',
}) => {
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(() =>
    Math.max(
      0,
      options.findIndex((o) => o.value === value)
    )
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const listboxId = `${id ?? generatedId}-listbox`;

  const selectedOption = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const idx = options.findIndex((o) => o.value === value);
    setHighlightedIndex(idx >= 0 ? idx : 0);

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
  }, [open, options, value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) {
        setOpen(true);
      } else {
        setHighlightedIndex((i) => (i + 1) % options.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) {
        setOpen(true);
      } else {
        setHighlightedIndex((i) => (i - 1 + options.length) % options.length);
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!open) {
        setOpen(true);
      } else if (options[highlightedIndex]) {
        onChange(options[highlightedIndex].value);
        setOpen(false);
      }
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        id={id}
        type="button"
        role="combobox"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={handleKeyDown}
        dir={dir}
        className="flex h-9 w-full items-center justify-between gap-2 rounded-md border px-2.5 text-xs font-semibold transition-colors"
        style={{
          borderColor: open ? accentColor : 'var(--border-strong)',
          backgroundColor: triggerBg,
          color: 'var(--text-primary)',
        }}
      >
        <span className="flex min-w-0 items-center gap-1.5 truncate">
          <span className={dir === 'ltr' ? 'truncate font-mono' : 'truncate'}>
            {selectedOption?.label}
          </span>
          {selectedOption?.meta && (
            <span
              className="shrink-0 font-mono text-[10.5px] font-normal tabular-nums"
              style={{ color: 'var(--text-muted)' }}
            >
              {selectedOption.meta}
            </span>
          )}
        </span>
        <ChevronDown
          className="h-3.5 w-3.5 shrink-0 transition-transform duration-150"
          style={{
            color: open ? accentColor : 'var(--text-muted)',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>

      {open && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute right-0 left-0 top-[calc(100%+4px)] z-50 max-h-64 min-w-[220px] overflow-y-auto rounded-md border p-1 shadow-xl"
          style={{
            borderColor: 'var(--border-strong)',
            backgroundColor: 'var(--bg-surface)',
          }}
        >
          {options.map((option, idx) => {
            const isSelected = option.value === value;
            const isHighlighted = idx === highlightedIndex;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setHighlightedIndex(idx)}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between gap-2.5 rounded px-2.5 py-2 text-right transition-colors"
                style={{
                  backgroundColor: isSelected
                    ? softBg
                    : isHighlighted
                      ? 'var(--bg-hover)'
                      : 'transparent',
                  color: 'var(--text-primary)',
                }}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2" dir={dir}>
                    <span
                      className={`truncate text-xs font-semibold ${dir === 'ltr' ? 'font-mono' : ''}`}
                      style={{ color: isSelected ? accentColor : 'var(--text-primary)' }}
                    >
                      {option.label}
                    </span>
                    {option.meta && (
                      <span
                        className="shrink-0 font-mono text-[10.5px] tabular-nums"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {option.meta}
                      </span>
                    )}
                  </div>
                  {option.description && (
                    <p
                      dir="rtl"
                      className="mt-0.5 truncate text-[10.5px]"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {option.description}
                    </p>
                  )}
                </div>

                <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                  {isSelected && <Check className="h-3.5 w-3.5" style={{ color: accentColor }} />}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

interface ThemedCheckboxProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: React.ReactNode;
  description?: string;
  accentColor?: string;
  className?: string;
}

export const ThemedCheckbox: React.FC<ThemedCheckboxProps> = ({
  id,
  checked,
  onChange,
  label,
  description,
  accentColor = 'var(--accent)',
  className = '',
}) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <label
      htmlFor={inputId}
      className={`group inline-flex cursor-pointer select-none items-start gap-2.5 text-xs ${className}`}
    >
      <span className="relative mt-0.5 inline-flex shrink-0 items-center justify-center">
        <input
          id={inputId}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className="flex h-[18px] w-[18px] items-center justify-center rounded-[4px] border transition-all duration-150 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--accent)]"
          style={{
            borderColor: checked ? accentColor : 'var(--border-strong)',
            backgroundColor: checked ? accentColor : 'var(--bg-canvas)',
            color: 'var(--accent-contrast)',
          }}
        >
          <Check
            className="h-3 w-3 transition-transform duration-150"
            strokeWidth={3}
            style={{
              opacity: checked ? 1 : 0,
              transform: checked ? 'scale(1)' : 'scale(0.55)',
            }}
          />
        </span>
      </span>

      <span className="leading-relaxed">
        <span
          className="block font-medium transition-colors"
          style={{ color: checked ? 'var(--text-primary)' : 'var(--text-secondary)' }}
        >
          {label}
        </span>
        {description && (
          <span className="mt-0.5 block text-[11px]" style={{ color: 'var(--text-muted)' }}>
            {description}
          </span>
        )}
      </span>
    </label>
  );
};
