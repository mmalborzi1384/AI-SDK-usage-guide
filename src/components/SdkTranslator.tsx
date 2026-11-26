import React, { useMemo, useState } from 'react';
import { ArrowLeftRight, Check, Copy } from 'lucide-react';
import { highlightCodeLine } from '../utils/syntaxHighlighter';

type Direction = 'openai-to-google' | 'google-to-openai' | 'legacy-to-modern';

interface PresetSnippet {
  id: string;
  label: string;
  direction: Direction;
  input: string;
}

const PRESETS: PresetSnippet[] = [
  {
    id: 'o2g-basic',
    label: 'OpenAI Responses ← Google Gen AI',
    direction: 'openai-to-google',
    input: `from openai import OpenAI

client = OpenAI()

response = client.responses.create(
    model="gpt-6.2-sol",
    instructions="Answer concisely in Persian.",
    input="Explain vector databases.",
    temperature=0.2,
    max_output_tokens=300,
)
print(response.output_text)`,
  },
  {
    id: 'g2o-structured',
    label: 'Google Gen AI ← OpenAI Responses',
    direction: 'google-to-openai',
    input: `from google import genai
from google.genai import types

client = genai.Client()

response = client.models.generate_content(
    model="gemini-4-hydrogen",
    contents="Extract invoice fields from text.",
    config=types.GenerateContentConfig(
        system_instruction="Be strictly accurate.",
        thinking_config=types.ThinkingConfig(thinking_level="low"),
        response_mime_type="application/json",
        response_schema=Invoice,
    ),
)
print(response.parsed)`,
  },
  {
    id: 'legacy-chat',
    label: 'کد قدیمی Chat Completions ← Responses ۲۰۲۶',
    direction: 'legacy-to-modern',
    input: `from openai import OpenAI

client = OpenAI()

completion = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", "content": "You are a Python expert."},
        {"role": "user", "content": "How does asyncio.Semaphore work?"},
    ],
    max_tokens=400,
)
print(completion.choices[0].message.content)`,
  },
];

interface TranslationResult {
  output: string;
  notes: string[];
}

function translateSnippet(code: string, direction: Direction): TranslationResult {
  const notes: string[] = [];
  let out = code;

  if (direction === 'openai-to-google') {
    out = out
      .replace(
        /from openai import\s+AsyncOpenAI/g,
        'from google import genai\nfrom google.genai import types'
      )
      .replace(
        /from openai import\s+OpenAI/g,
        'from google import genai\nfrom google.genai import types'
      )
      .replace(/AsyncOpenAI\(([^)]*)\)/g, 'genai.Client()')
      .replace(/OpenAI\(([^)]*)\)/g, 'genai.Client()')
      .replace(/async_client\.responses\.create\(/g, 'client.aio.models.generate_content(')
      .replace(/client\.responses\.create\(/g, 'client.models.generate_content(')
      .replace(/client\.responses\.parse\(/g, 'client.models.generate_content(')
      .replace(/model\s*=\s*["'](gpt-6\.2-astra|o3)["']/g, 'model="gemini-4-carbon"')
      .replace(/model\s*=\s*["'](gpt-[^"']+|o[134][^"']*)["']/g, 'model="gemini-4-hydrogen"')
      .replace(/\binput\s*=/g, 'contents=')
      .replace(/\binstructions\s*=/g, 'system_instruction=')
      .replace(/\btext_format\s*=/g, 'response_schema=')
      .replace(/\.output_text\b/g, '.text')
      .replace(/\.output_parsed\b/g, '.parsed')
      .replace(/\.usage\.input_tokens\b/g, '.usage_metadata.prompt_token_count')
      .replace(/\.usage\.output_tokens\b/g, '.usage_metadata.candidates_token_count')
      .replace(
        /tools\s*=\s*\[\s*\{\s*["']type["']\s*:\s*["']web_search["']\s*\}\s*\]/g,
        'tools=[types.Tool(google_search=types.GoogleSearch())]'
      );

    if (/system_instruction=|temperature=|max_output_tokens=|response_schema=|tools=/.test(out)) {
      notes.push(
        'در google-genai پارامترهای system_instruction، temperature، max_output_tokens، tools و response_schema باید درون config=types.GenerateContentConfig(...) قرار بگیرند.'
      );
    }
    if (/previous_response_id/.test(out)) {
      notes.push(
        'در نسخه ۲۰۲۶ گوگل می‌توانید دقیقاً مثل OpenAI از client.interactions.create(..., previous_interaction_id=...) برای حفظ وضعیت سمت سرور استفاده کنید.'
      );
    }
    if (notes.length === 0) {
      notes.push('تبدیل مستقیم ساختار کلاینت، متد generate_content و مدل gemini-4-hydrogen انجام شد.');
    }
  } else if (direction === 'google-to-openai') {
    out = out
      .replace(/from google import genai\n?/g, 'from openai import OpenAI\n')
      .replace(/from google\.genai import types[^\n]*\n?/g, '')
      .replace(/genai\.Client\([^)]*\)/g, 'OpenAI()')
      .replace(/client\.aio\.models\.generate_content\(/g, 'async_client.responses.create(')
      .replace(/client\.models\.generate_content_stream\(/g, 'client.responses.stream(')
      .replace(/client\.models\.generate_content\(/g, 'client.responses.create(')
      .replace(/client\.interactions\.create\(/g, 'client.responses.create(')
      .replace(/previous_interaction_id\s*=/g, 'previous_response_id=')
      .replace(/model\s*=\s*["']gemini-4-(carbon|argon|neon)["']/g, 'model="gpt-6.2-astra"')
      .replace(/model\s*=\s*["']gemini-[^"']+["']/g, 'model="gpt-6.2-sol"')
      .replace(/\bcontents\s*=/g, 'input=')
      .replace(/\bsystem_instruction\s*=/g, 'instructions=')
      .replace(/\bresponse_schema\s*=/g, 'text_format=')
      .replace(/\bresponse_mime_type\s*=\s*["']application\/json["'],?\n?/g, '')
      .replace(/\.text\b/g, '.output_text')
      .replace(/\.parsed\b/g, '.output_parsed')
      .replace(/\.usage_metadata\.prompt_token_count\b/g, '.usage.input_tokens')
      .replace(/\.usage_metadata\.candidates_token_count\b/g, '.usage.output_tokens');

    if (/GenerateContentConfig/.test(out)) {
      notes.push(
        'در OpenAI Responses API نیازی به شیء config=types.GenerateContentConfig(...) نیست؛ پارامترها مستقیم به client.responses.create(...) داده می‌شوند.'
      );
    }
    if (/thinking_level/.test(out)) {
      notes.push(
        'معادل thinking_level در OpenAI Responses API پارامتر reasoning={"effort": "low" | "medium" | "high"} است.'
      );
    }
    if (/text_format=/.test(out)) {
      out = out.replace(/client\.responses\.create\(/g, 'client.responses.parse(');
      notes.push(
        'برای دریافت شیء پارس‌شده Pydantic در OpenAI از متد client.responses.parse(..., text_format=Schema) استفاده شد.'
      );
    }
    if (notes.length === 0) {
      notes.push('کد به الگوی مدرن OpenAI Responses API با سری GPT-6.2 تبدیل شد.');
    }
  } else {
    // Legacy Chat Completions / google-generativeai / Gemini 2.5 -> Modern 2026 SDKs
    if (/google\.generativeai/.test(out) || /GenerativeModel/.test(out) || /gemini-2\.5/.test(out)) {
      out = out
        .replace(/import google\.generativeai as genai/g, 'from google import genai')
        .replace(/genai\.configure\([^)]*\)\n?/g, 'client = genai.Client()\n')
        .replace(
          /model\s*=\s*genai\.GenerativeModel\(([^)]+)\)/g,
          '# استفاده مستقیم از شناسه مدل در generate_content\nmodel_id = "gemini-4-hydrogen"'
        )
        .replace(/model\.generate_content\(/g, 'client.models.generate_content(model=model_id, contents=')
        .replace(/gemini-2\.5-flash/g, 'gemini-4-hydrogen')
        .replace(/gemini-2\.5-pro/g, 'gemini-4-carbon')
        .replace(/thinking_budget\s*=\s*0/g, 'thinking_level="low"');
      notes.push(
        'کتابخانه/مدل‌های قدیمی به SDK رسمی google-genai و نسل جدید Gemini 4 (همراه با thinking_level) ارتقا یافتند.'
      );
    } else {
      out = out
        .replace(/client\.chat\.completions\.create\(/g, 'client.responses.create(')
        .replace(/model\s*=\s*["'](gpt-4o-mini|gpt-4\.1-mini)["']/g, 'model="gpt-6.2-sol"')
        .replace(/model\s*=\s*["'](gpt-4o|gpt-4\.1)["']/g, 'model="gpt-6.2-astra"')
        .replace(/\bmessages\s*=/g, 'input=')
        .replace(/\bmax_tokens\s*=/g, 'max_output_tokens=')
        .replace(/\.choices\[0\]\.message\.content/g, '.output_text');
      notes.push(
        'متد قدیمی chat.completions.create به responses.create، مدل به سری GPT-6.2 و دسترسی choices[0].message.content به response.output_text ارتقا یافت.'
      );
      notes.push(
        'در صورت وجود پیام role="system"، می‌توانید آن را به‌صورت تمیزتر در پارامتر instructions="..." قرار دهید.'
      );
    }
  }

  return { output: out.trim(), notes };
}

export const SdkTranslator: React.FC = () => {
  const [direction, setDirection] = useState<Direction>('openai-to-google');
  const [sourceCode, setSourceCode] = useState<string>(PRESETS[0].input);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => translateSnippet(sourceCode, direction),
    [sourceCode, direction]
  );

  const applyPreset = (preset: PresetSnippet) => {
    setDirection(preset.direction);
    setSourceCode(preset.input);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.output);
    } catch {
      // fallback ignored
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-extrabold" style={{ color: 'var(--text-primary)' }}>
            مبدل سریع سینتکس SDK و مهاجرت به نسخه ۲۰۲۶
          </h3>
          <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
            کد خود را جای‌گذاری کنید یا یکی از الگوهای آماده را بزنید تا معادل مدرن آن (GPT-6.2 /
            Gemini 4) همراه با نکات مهاجرت ساخته شود.
          </p>
        </div>

        <div
          className="inline-flex flex-wrap items-center gap-0.5 rounded-md border p-0.5 self-start"
          style={{
            borderColor: 'var(--border-subtle)',
            backgroundColor: 'var(--bg-subtle)',
          }}
        >
          {(
            [
              { id: 'openai-to-google', label: 'OpenAI → Gemini' },
              { id: 'google-to-openai', label: 'Gemini → OpenAI' },
              { id: 'legacy-to-modern', label: 'قدیمی → مدرن ۲۰۲۶' },
            ] as const
          ).map((tab) => {
            const active = direction === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setDirection(tab.id)}
                className="rounded px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap"
                style={{
                  backgroundColor: active ? 'var(--bg-surface)' : 'transparent',
                  color: active ? 'var(--accent)' : 'var(--text-muted)',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Preset Quick Loaders */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span style={{ color: 'var(--text-muted)' }}>نمونه‌های آماده:</span>
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => applyPreset(p)}
            className="rounded border px-2.5 py-1 text-xs font-medium transition-colors hover:border-[var(--accent)]"
            style={{
              borderColor: 'var(--border-subtle)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-secondary)',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Dual Pane: Editable Source -> Highlighted Converted Output */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div
          className="overflow-hidden rounded-md border"
          style={{
            borderColor: 'var(--code-border)',
            backgroundColor: 'var(--code-bg)',
          }}
        >
          <div
            className="flex items-center justify-between border-b px-3.5 py-2 text-xs"
            style={{
              borderColor: 'var(--code-border)',
              backgroundColor: 'var(--code-header)',
              color: 'var(--text-secondary)',
            }}
          >
            <span className="font-bold">کد ورودی (قابل ویرایش)</span>
            <ArrowLeftRight className="h-3.5 w-3.5" style={{ color: 'var(--text-muted)' }} />
          </div>
          <textarea
            dir="ltr"
            value={sourceCode}
            onChange={(e) => setSourceCode(e.target.value)}
            spellCheck={false}
            rows={12}
            className="code-scroll w-full resize-y bg-transparent p-3.5 font-mono text-[12.5px] leading-[1.65] focus:outline-none"
            style={{ color: 'var(--syn-text)' }}
          />
        </div>

        <div
          className="overflow-hidden rounded-md border"
          style={{
            borderColor: 'var(--code-border)',
            backgroundColor: 'var(--code-bg)',
            borderTopWidth: '2px',
            borderTopColor: 'var(--accent)',
          }}
        >
          <div
            className="flex items-center justify-between border-b px-3.5 py-2 text-xs"
            style={{
              borderColor: 'var(--code-border)',
              backgroundColor: 'var(--code-header)',
            }}
          >
            <span className="font-bold" style={{ color: 'var(--accent)' }}>
              کد تبدیل‌شده
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex h-7 items-center gap-1 rounded border px-2 text-[11px] font-medium"
              style={{
                borderColor: 'var(--border-subtle)',
                backgroundColor: 'var(--bg-surface)',
                color: copied ? 'var(--openai-accent)' : 'var(--text-primary)',
              }}
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              <span>{copied ? 'کپی شد' : 'کپی خروجی'}</span>
            </button>
          </div>
          <div className="code-scroll max-h-[300px] overflow-auto py-3">
            <pre dir="ltr" className="m-0 text-left text-[12.5px] leading-[1.65]">
              <code>
                {result.output.split('\n').map((line, i) => (
                  <div key={i} className="flex px-3">
                    <span
                      aria-hidden="true"
                      className="select-none pr-3 text-right text-[10.5px] tabular-nums"
                      style={{ color: 'var(--code-gutter)', minWidth: '2rem' }}
                    >
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      {highlightCodeLine(line, 'python', i)}
                    </span>
                  </div>
                ))}
              </code>
            </pre>
          </div>
        </div>
      </div>

      {/* Migration Notes */}
      <div
        className="rounded-md border px-4 py-3 text-xs"
        style={{
          borderColor: 'var(--border-subtle)',
          backgroundColor: 'var(--bg-subtle)',
          color: 'var(--text-secondary)',
        }}
      >
        <p className="mb-1 font-bold" style={{ color: 'var(--text-primary)' }}>
          نکات هوشمند مهاجرت
        </p>
        <ul className="space-y-1">
          {result.notes.map((n, i) => (
            <li key={i} className="flex items-start gap-2">
              <span aria-hidden="true">—</span>
              <span>{n}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
