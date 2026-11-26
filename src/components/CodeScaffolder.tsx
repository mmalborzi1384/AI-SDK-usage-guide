import React, { useMemo, useState } from 'react';
import { Check, Copy, Download, RotateCcw } from 'lucide-react';
import { highlightCodeLine } from '../utils/syntaxHighlighter';

interface ScaffoldOptions {
  systemPrompt: boolean;
  structuredOutput: boolean;
  streaming: boolean;
  webSearch: boolean;
  thinking: boolean;
  asyncMode: boolean;
  retry429: boolean;
  openaiModel: 'gpt-6-luna' | 'gpt-6.1-terra' | 'gpt-6.2-sol' | 'gpt-6.2-astra';
  googleModel: 'gemini-3.8-flash' | 'gemini-4-hydrogen' | 'gemini-4-carbon' | 'gemini-4-neon';
}

const DEFAULT_OPTIONS: ScaffoldOptions = {
  systemPrompt: true,
  structuredOutput: false,
  streaming: false,
  webSearch: false,
  thinking: false,
  asyncMode: false,
  retry429: true,
  openaiModel: 'gpt-6.2-sol',
  googleModel: 'gemini-4-hydrogen',
};

const FEATURE_TOGGLES: Array<{
  key: keyof Pick<
    ScaffoldOptions,
    | 'systemPrompt'
    | 'structuredOutput'
    | 'streaming'
    | 'webSearch'
    | 'thinking'
    | 'asyncMode'
    | 'retry429'
  >;
  label: string;
  hint: string;
}> = [
  { key: 'systemPrompt', label: 'نقش سیستم + دما', hint: 'instructions / system_instruction' },
  { key: 'structuredOutput', label: 'خروجی Pydantic', hint: 'JSON تضمین‌شده' },
  { key: 'streaming', label: 'استریم لحظه‌ای', hint: 'نمایش کلمه‌به‌کلمه' },
  { key: 'webSearch', label: 'جستجوی زنده وب', hint: 'web_search / google_search' },
  { key: 'thinking', label: 'کنترل استدلال', hint: 'effort / thinking_level' },
  { key: 'asyncMode', label: 'اجرای Async', hint: 'AsyncOpenAI / client.aio' },
  { key: 'retry429', label: 'Retry هوشمند 429', hint: 'Exponential Backoff' },
];

function generateOpenAICode(opt: ScaffoldOptions): string {
  const imports: string[] = [];
  if (opt.asyncMode) imports.push('import asyncio');
  if (opt.retry429) {
    imports.push('import random');
    if (!opt.asyncMode) imports.push('import time');
  }
  imports.push('from dotenv import load_dotenv');
  if (opt.structuredOutput) imports.push('from pydantic import BaseModel');

  const openaiImports = [opt.asyncMode ? 'AsyncOpenAI' : 'OpenAI'];
  if (opt.retry429) {
    openaiImports.push('RateLimitError', 'APITimeoutError', 'APIConnectionError');
  }
  imports.push(`from openai import ${openaiImports.join(', ')}`);

  const lines: string[] = [...imports, '', 'load_dotenv()'];
  lines.push(
    opt.asyncMode
      ? 'client = AsyncOpenAI(timeout=30.0, max_retries=2)'
      : 'client = OpenAI(timeout=30.0, max_retries=2)'
  );

  if (opt.structuredOutput) {
    lines.push(
      '',
      'class AnalysisResult(BaseModel):',
      '    summary: str',
      '    key_points: list[str]',
      '    confidence: float'
    );
  }

  const fnPrefix = opt.asyncMode ? 'async def' : 'def';
  const awaitPrefix = opt.asyncMode ? 'await ' : '';
  const indent = opt.retry429 ? '            ' : '    ';

  lines.push('', `${fnPrefix} run_openai(prompt: str):`);
  if (opt.retry429) {
    lines.push('    for attempt in range(4):', '        try:');
  }

  const args: string[] = [
    `${indent}    model="${opt.openaiModel}",`,
    `${indent}    input=prompt,`,
  ];
  if (opt.systemPrompt) {
    args.push(`${indent}    instructions="You are a precise AI engineering assistant.",`);
    if (opt.openaiModel !== 'gpt-6.2-astra') {
      args.push(`${indent}    temperature=0.2,`);
    }
  }
  if (opt.webSearch) {
    args.push(`${indent}    tools=[{"type": "web_search"}],`);
  }
  if (opt.thinking) {
    args.push(`${indent}    reasoning={"effort": "medium", "summary": "auto"},`);
  }
  if (opt.structuredOutput && !opt.streaming) {
    args.push(`${indent}    text_format=AnalysisResult,`);
  }

  if (opt.streaming) {
    const withKw = opt.asyncMode ? 'async with' : 'with';
    const forKw = opt.asyncMode ? 'async for' : 'for';
    lines.push(
      `${indent}${withKw} client.responses.stream(`,
      ...args,
      `${indent}) as stream:`,
      `${indent}    ${forKw} event in stream:`,
      `${indent}        if event.type == "response.output_text.delta":`,
      `${indent}            print(event.delta, end="", flush=True)`,
      `${indent}    return ${awaitPrefix}stream.get_final_response()`
    );
  } else {
    const method = opt.structuredOutput ? 'client.responses.parse' : 'client.responses.create';
    lines.push(`${indent}resp = ${awaitPrefix}${method}(`, ...args, `${indent})`);
    lines.push(
      `${indent}if resp.status != "completed":`,
      `${indent}    raise RuntimeError(f"Incomplete: {resp.incomplete_details}")`
    );
    lines.push(
      opt.structuredOutput
        ? `${indent}return resp.output_parsed`
        : `${indent}return resp.output_text`
    );
  }

  if (opt.retry429) {
    const sleepCall = opt.asyncMode ? 'await asyncio.sleep(delay)' : 'time.sleep(delay)';
    lines.push(
      '        except (RateLimitError, APITimeoutError, APIConnectionError):',
      '            if attempt == 3:',
      '                raise',
      '            delay = (2 ** attempt) + random.uniform(0.1, 1.0)',
      `            ${sleepCall}`
    );
  }

  lines.push(
    '',
    'if __name__ == "__main__":',
    opt.asyncMode
      ? '    print(asyncio.run(run_openai("Summarize LLM caching strategies.")))'
      : '    print(run_openai("Summarize LLM caching strategies."))'
  );

  return lines.join('\n');
}

function generateGoogleCode(opt: ScaffoldOptions): string {
  const imports: string[] = [];
  if (opt.asyncMode) imports.push('import asyncio');
  if (opt.retry429) {
    imports.push('import random');
    if (!opt.asyncMode) imports.push('import time');
  }
  imports.push('from dotenv import load_dotenv');
  if (opt.structuredOutput) imports.push('from pydantic import BaseModel');
  imports.push('from google import genai');
  imports.push(
    opt.retry429
      ? 'from google.genai import types, errors'
      : 'from google.genai import types'
  );

  const lines: string[] = [
    ...imports,
    '',
    'load_dotenv()',
    'client = genai.Client(http_options=types.HttpOptions(timeout=30_000))',
  ];

  if (opt.retry429) {
    lines.push('RETRYABLE_CODES = {429, 500, 502, 503, 504}');
  }

  if (opt.structuredOutput) {
    lines.push(
      '',
      'class AnalysisResult(BaseModel):',
      '    summary: str',
      '    key_points: list[str]',
      '    confidence: float'
    );
  }

  const fnPrefix = opt.asyncMode ? 'async def' : 'def';
  const awaitPrefix = opt.asyncMode ? 'await ' : '';
  const indent = opt.retry429 ? '            ' : '    ';

  lines.push('', `${fnPrefix} run_gemini(prompt: str):`);

  const configFields: string[] = [];
  if (opt.systemPrompt) {
    configFields.push('system_instruction="You are a precise AI engineering assistant.",');
    configFields.push('temperature=0.2,');
  }
  if (opt.webSearch) {
    configFields.push('tools=[types.Tool(google_search=types.GoogleSearch())],');
  }
  if (opt.thinking) {
    configFields.push(
      'thinking_config=types.ThinkingConfig(thinking_level="high", include_thoughts=True),'
    );
  }
  if (opt.structuredOutput) {
    configFields.push('response_mime_type="application/json",');
    configFields.push('response_schema=AnalysisResult,');
  }

  lines.push('    config = types.GenerateContentConfig(');
  if (configFields.length > 0) {
    configFields.forEach((f) => lines.push(`        ${f}`));
  }
  lines.push('    )');

  if (opt.retry429) {
    lines.push('    for attempt in range(4):', '        try:');
  }

  const modelsRef = opt.asyncMode ? 'client.aio.models' : 'client.models';

  if (opt.streaming) {
    const forKw = opt.asyncMode ? 'async for' : 'for';
    lines.push(
      `${indent}stream = ${awaitPrefix}${modelsRef}.generate_content_stream(`,
      `${indent}    model="${opt.googleModel}",`,
      `${indent}    contents=prompt,`,
      `${indent}    config=config,`,
      `${indent})`,
      `${indent}full_text = []`,
      `${indent}${forKw} chunk in stream:`,
      `${indent}    if chunk.text:`,
      `${indent}        print(chunk.text, end="", flush=True)`,
      `${indent}        full_text.append(chunk.text)`,
      `${indent}return "".join(full_text)`
    );
  } else {
    lines.push(
      `${indent}resp = ${awaitPrefix}${modelsRef}.generate_content(`,
      `${indent}    model="${opt.googleModel}",`,
      `${indent}    contents=prompt,`,
      `${indent}    config=config,`,
      `${indent})`,
      `${indent}if resp.candidates[0].finish_reason != types.FinishReason.STOP:`,
      `${indent}    raise RuntimeError(f"Stopped: {resp.candidates[0].finish_reason}")`,
      opt.structuredOutput ? `${indent}return resp.parsed` : `${indent}return resp.text`
    );
  }

  if (opt.retry429) {
    const sleepCall = opt.asyncMode ? 'await asyncio.sleep(delay)' : 'time.sleep(delay)';
    lines.push(
      '        except errors.APIError as e:',
      '            if e.code in RETRYABLE_CODES and attempt < 3:',
      '                delay = (2 ** attempt) + random.uniform(0.1, 1.0)',
      `                ${sleepCall}`,
      '            else:',
      '                raise'
    );
  }

  lines.push(
    '',
    'if __name__ == "__main__":',
    opt.asyncMode
      ? '    print(asyncio.run(run_gemini("Summarize LLM caching strategies.")))'
      : '    print(run_gemini("Summarize LLM caching strategies."))'
  );

  return lines.join('\n');
}

function downloadPythonFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/x-python;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export const CodeScaffolder: React.FC = () => {
  const [options, setOptions] = useState<ScaffoldOptions>(DEFAULT_OPTIONS);
  const [copiedKey, setCopiedKey] = useState<'openai' | 'google' | null>(null);

  const openaiCode = useMemo(() => generateOpenAICode(options), [options]);
  const googleCode = useMemo(() => generateGoogleCode(options), [options]);

  const toggle = (
    key: keyof Pick<
      ScaffoldOptions,
      | 'systemPrompt'
      | 'structuredOutput'
      | 'streaming'
      | 'webSearch'
      | 'thinking'
      | 'asyncMode'
      | 'retry429'
    >
  ) => {
    setOptions((prev) => ({
      ...prev,
      [key]: !prev[key],
      ...(key === 'thinking' && !prev.thinking
        ? { openaiModel: 'gpt-6.2-astra', googleModel: 'gemini-4-carbon' }
        : {}),
    }));
  };

  const handleCopy = async (which: 'openai' | 'google', code: string) => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopiedKey(which);
    window.setTimeout(() => setCopiedKey(null), 1600);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-extrabold" style={{ color: 'var(--text-primary)' }}>
            سازنده کد ترکیبی آماده اجرا (نسخه ۲۰۲۶)
          </h3>
          <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
            قابلیت‌های مورد نیاز پروژه خود را فعال کنید تا اسکریپت کامل پایتون هر دو SDK با جدیدترین
            مدل‌ها لحظه‌ای ساخته شود.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setOptions(DEFAULT_OPTIONS)}
          className="inline-flex h-8 shrink-0 items-center gap-1.5 self-start rounded-md border px-2.5 text-xs font-medium transition-colors sm:self-auto"
          style={{
            borderColor: 'var(--border-subtle)',
            backgroundColor: 'var(--bg-surface)',
            color: 'var(--text-muted)',
          }}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>بازنشانی</span>
        </button>
      </div>

      {/* Capability Toggle Matrix */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-7">
        {FEATURE_TOGGLES.map((item) => {
          const active = options[item.key];
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => toggle(item.key)}
              aria-pressed={active}
              className="flex flex-col items-start rounded-md border p-2.5 text-right transition-colors"
              style={{
                borderColor: active ? 'var(--accent)' : 'var(--border-subtle)',
                backgroundColor: active ? 'var(--accent-soft)' : 'var(--bg-surface)',
              }}
            >
              <span
                className="text-xs font-bold leading-snug"
                style={{ color: active ? 'var(--accent)' : 'var(--text-primary)' }}
              >
                {item.label}
              </span>
              <span
                dir="ltr"
                className="mt-1 truncate max-w-full font-mono text-[10px]"
                style={{ color: 'var(--text-muted)' }}
              >
                {item.hint}
              </span>
            </button>
          );
        })}
      </div>

      {/* Model Selectors */}
      <div
        className="flex flex-wrap items-center gap-4 border-y py-3 text-xs"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <label className="flex items-center gap-2">
          <span className="font-semibold" style={{ color: 'var(--openai-accent)' }}>
            مدل OpenAI:
          </span>
          <select
            value={options.openaiModel}
            onChange={(e) =>
              setOptions((prev) => ({
                ...prev,
                openaiModel: e.target.value as ScaffoldOptions['openaiModel'],
              }))
            }
            dir="ltr"
            className="rounded border px-2 py-1 font-mono text-xs focus:outline-none"
            style={{
              borderColor: 'var(--border-subtle)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
            }}
          >
            <option value="gpt-6-luna">gpt-6-luna</option>
            <option value="gpt-6.1-terra">gpt-6.1-terra</option>
            <option value="gpt-6.2-sol">gpt-6.2-sol</option>
            <option value="gpt-6.2-astra">gpt-6.2-astra</option>
          </select>
        </label>

        <label className="flex items-center gap-2">
          <span className="font-semibold" style={{ color: 'var(--google-accent)' }}>
            مدل Gemini:
          </span>
          <select
            value={options.googleModel}
            onChange={(e) =>
              setOptions((prev) => ({
                ...prev,
                googleModel: e.target.value as ScaffoldOptions['googleModel'],
              }))
            }
            dir="ltr"
            className="rounded border px-2 py-1 font-mono text-xs focus:outline-none"
            style={{
              borderColor: 'var(--border-subtle)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
            }}
          >
            <option value="gemini-3.8-flash">gemini-3.8-flash</option>
            <option value="gemini-4-hydrogen">gemini-4-hydrogen</option>
            <option value="gemini-4-carbon">gemini-4-carbon</option>
            <option value="gemini-4-neon">gemini-4-neon</option>
          </select>
        </label>
      </div>

      {/* Generated Dual Code Output */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {(
          [
            {
              key: 'openai' as const,
              title: 'OpenAI Responses API',
              filename: 'openai_pipeline.py',
              accent: 'var(--openai-accent)',
              code: openaiCode,
            },
            {
              key: 'google' as const,
              title: 'Google Gen AI SDK',
              filename: 'gemini_pipeline.py',
              accent: 'var(--google-accent)',
              code: googleCode,
            },
          ] as const
        ).map((panel) => (
          <div
            key={panel.key}
            className="overflow-hidden rounded-md border"
            style={{
              borderColor: 'var(--code-border)',
              backgroundColor: 'var(--code-bg)',
              borderTopWidth: '2px',
              borderTopColor: panel.accent,
            }}
          >
            <div
              className="flex items-center justify-between gap-2 border-b px-3.5 py-2"
              style={{
                borderColor: 'var(--code-border)',
                backgroundColor: 'var(--code-header)',
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold" style={{ color: panel.accent }}>
                  {panel.title}
                </span>
                <span
                  dir="ltr"
                  className="font-mono text-[10.5px]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {panel.filename}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => downloadPythonFile(panel.filename, panel.code)}
                  className="inline-flex h-7 items-center gap-1 rounded border px-2 text-[11px] font-medium transition-colors"
                  style={{
                    borderColor: 'var(--border-subtle)',
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <Download className="h-3 w-3" />
                  <span className="hidden sm:inline">.py</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy(panel.key, panel.code)}
                  className="inline-flex h-7 items-center gap-1 rounded border px-2 text-[11px] font-medium transition-colors"
                  style={{
                    borderColor:
                      copiedKey === panel.key ? panel.accent : 'var(--border-subtle)',
                    backgroundColor: 'var(--bg-surface)',
                    color:
                      copiedKey === panel.key ? panel.accent : 'var(--text-primary)',
                  }}
                >
                  {copiedKey === panel.key ? (
                    <>
                      <Check className="h-3 w-3" />
                      <span>کپی شد</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>کپی</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="code-scroll max-h-[380px] overflow-auto py-3">
              <pre dir="ltr" className="m-0 text-left text-[12px] leading-[1.65]">
                <code>
                  {panel.code.split('\n').map((line, idx) => (
                    <div key={idx} className="flex px-3">
                      <span
                        aria-hidden="true"
                        className="select-none pr-3 text-right text-[10.5px] tabular-nums"
                        style={{ color: 'var(--code-gutter)', minWidth: '2rem' }}
                      >
                        {idx + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        {highlightCodeLine(line, 'python', idx)}
                      </span>
                    </div>
                  ))}
                </code>
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
