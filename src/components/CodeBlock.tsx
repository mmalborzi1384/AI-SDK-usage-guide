import React, { useState } from 'react';
import { Check, Copy, WrapText } from 'lucide-react';
import { CodeBlockData } from '../types/guide';
import { highlightCodeLine } from '../utils/syntaxHighlighter';

interface CodeBlockProps {
  block: CodeBlockData;
  compact?: boolean;
}

const PROVIDER_META = {
  openai: {
    topRule: 'var(--openai-accent)',
    labelColor: 'var(--openai-accent)',
    langLabel: 'Python · OpenAI',
  },
  google: {
    topRule: 'var(--google-accent)',
    labelColor: 'var(--google-accent)',
    langLabel: 'Python · Google Gen AI',
  },
  shared: {
    topRule: 'var(--border-strong)',
    labelColor: 'var(--text-primary)',
    langLabel: 'Python · Shared',
  },
  terminal: {
    topRule: 'var(--accent)',
    labelColor: 'var(--text-primary)',
    langLabel: 'Shell / Terminal',
  },
} as const;

export const CodeBlock: React.FC<CodeBlockProps> = ({ block }) => {
  const [copied, setCopied] = useState(false);
  const [softWrap, setSoftWrap] = useState(false);
  const meta = PROVIDER_META[block.provider];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(block.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = block.code;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  };

  const lines = block.code.split('\n');

  return (
    <div
      className="print-avoid-break overflow-hidden rounded-md border"
      style={{
        borderColor: 'var(--code-border)',
        backgroundColor: 'var(--code-bg)',
        borderTopWidth: '2px',
        borderTopColor: meta.topRule,
      }}
    >
      {/* Code Header Bar */}
      <div
        className="flex items-center justify-between gap-3 border-b px-3.5 py-2.5 sm:px-4"
        style={{
          borderColor: 'var(--code-border)',
          backgroundColor: 'var(--code-header)',
        }}
      >
        <div className="min-w-0 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span
            className="text-xs font-bold tracking-tight"
            style={{ color: meta.labelColor }}
          >
            {block.label}
          </span>
          {block.sublabel && (
            <>
              <span aria-hidden="true" className="text-xs" style={{ color: 'var(--text-muted)' }}>
                ·
              </span>
              <span className="text-[11.5px]" style={{ color: 'var(--text-muted)' }}>
                {block.sublabel}
              </span>
            </>
          )}
        </div>

        <div className="no-print flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSoftWrap((w) => !w)}
            aria-pressed={softWrap}
            aria-label="شکستن خطوط طولانی"
            title="شکستن خطوط طولانی"
            className="inline-flex h-7 items-center gap-1 rounded border px-2 text-[11px] font-medium transition-colors whitespace-nowrap"
            style={{
              borderColor: softWrap ? 'var(--accent)' : 'var(--border-subtle)',
              backgroundColor: softWrap ? 'var(--accent-soft)' : 'var(--bg-surface)',
              color: softWrap ? 'var(--accent)' : 'var(--text-muted)',
            }}
          >
            <WrapText className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Wrap</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            aria-label={`کپی کد ${block.label}`}
            className="inline-flex h-7 items-center gap-1.5 rounded border px-2.5 text-[11.5px] font-medium transition-colors whitespace-nowrap"
            style={{
              borderColor: copied ? 'var(--openai-accent)' : 'var(--border-subtle)',
              backgroundColor: copied ? 'var(--openai-soft)' : 'var(--bg-surface)',
              color: copied ? 'var(--openai-accent)' : 'var(--text-primary)',
            }}
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>کپی شد</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>کپی</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Viewport with Gutter Line Numbers */}
      <div className="code-scroll overflow-x-auto py-3 print:overflow-visible print:py-2">
        <pre
          dir="ltr"
          className={`m-0 text-left text-[12.5px] leading-[1.7] sm:text-[13px] ${
            softWrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre'
          }`}
        >
          <code className="block">
            {lines.map((line, i) => (
              <div
                key={i}
                className="flex px-3 hover:bg-[var(--bg-hover)]/45 sm:px-4 print:px-2.5"
              >
                <span
                  aria-hidden="true"
                  className="select-none pr-4 text-right text-[11px] tabular-nums print:pr-3"
                  style={{ color: 'var(--code-gutter)', minWidth: '2.25rem' }}
                >
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  {highlightCodeLine(line, block.language, i)}
                </span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
};
