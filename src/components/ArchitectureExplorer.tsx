import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import {
  ArrowUpLeft,
  Check,
  Code2,
  Copy,
  Download,
  RotateCcw,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { ThemeId } from '../types/theme';
import { toPersianDigits } from '../data/guideData';

type FlowScenarioId = 'core' | 'state' | 'tools' | 'async';

interface FlowScenario {
  id: FlowScenarioId;
  title: string;
  shortTitle: string;
  subtitle: string;
  diagramTitle: string;
  relatedChapterId: string;
  relatedChapterLabel: string;
  mermaidCode: string;
  openaiHighlights: Array<{ stage: string; detail: string }>;
  googleHighlights: Array<{ stage: string; detail: string }>;
}

const FLOW_SCENARIOS: FlowScenario[] = [
  {
    id: 'core',
    title: 'جریان پایه درخواست و پاسخ',
    shortTitle: 'درخواست و پاسخ',
    subtitle:
      'مقایسه مسیر یک فراخوانی استاندارد متن یا خروجی ساختاریافته از لحظه ساخت کلاینت تا استخراج متن نهایی.',
    diagramTitle: 'Core Request / Response Pipeline',
    relatedChapterId: 'ch-3',
    relatedChapterLabel: 'فصل ۳: تولید متن و پارامترها',
    mermaidCode: `flowchart LR
  App(["Python App"])

  subgraph OAI["OpenAI Responses API"]
    direction TB
    O1["OpenAI() Client<br/>OPENAI_API_KEY"]
    O2["client.responses.create()<br/>model + instructions + input"]
    O3["Response Object<br/>id + output items"]
    O4["response.output_text<br/>or .output_parsed"]
    O1 --> O2
    O2 --> O3
    O3 --> O4
  end

  subgraph GEM["Google Gen AI SDK"]
    direction TB
    G1["genai.Client()<br/>GEMINI_API_KEY"]
    G2["client.models.generate_content()<br/>model + contents + config"]
    G3["GenerateContentResponse<br/>candidates / content / parts"]
    G4["response.text<br/>or .parsed"]
    G1 --> G2
    G2 --> G3
    G3 --> G4
  end

  App -->|Responses Endpoint| O1
  App -->|GenerateContent Endpoint| G1`,
    openaiHighlights: [
      {
        stage: 'قرارداد ورودی (Input Contract)',
        detail:
          'ورودی اصلی با پارامتر input (رشته یا آرایه آیتم‌های چندرسانه‌ای) و نقش سیستمی به‌صورت مجزا با instructions ارسال می‌شود.',
      },
      {
        stage: 'ساختار پاسخ (Response Items)',
        detail:
          'پاسخ شامل آرایه‌ای تایپ‌شده از آیتم‌ها (reasoning، tool_call و message) است و property کمکی response.output_text متن نهایی را جمع‌بندی می‌کند.',
      },
      {
        stage: 'خروجی ساختاریافته (Structured)',
        detail:
          'با client.responses.parse(..., text_format=PydanticModel) خروجی مستقیماً به نمونه معتبر Pydantic در response.output_parsed تبدیل می‌شود.',
      },
    ],
    googleHighlights: [
      {
        stage: 'قرارداد ورودی (Contents & Config)',
        detail:
          'محتوا در contents (متن، فایل، Part) و تمامی تنظیمات شامل system_instruction، دما و اسکیما درون GenerateContentConfig بسته‌بندی می‌شوند.',
      },
      {
        stage: 'ساختار پاسخ (Candidates Tree)',
        detail:
          'خروجی درون سلسله‌مراتب candidates -> content -> parts قرار می‌گیرد و response.text دسترسی سریع به متن اصلی را فراهم می‌کند.',
      },
      {
        stage: 'خروجی ساختاریافته (Structured)',
        detail:
          'با تنظیم response_mime_type="application/json" و response_schema=PydanticModel در config، نتیجه معتبر در response.parsed در دسترس است.',
      },
    ],
  },
  {
    id: 'state',
    title: 'حافظه و مکالمه چندمرحله‌ای',
    shortTitle: 'حافظه و چت',
    subtitle:
      'نحوه حفظ تاریخچه مکالمه در سرور (Stateful) در مقایسه با مدیریت تاریخچه در کلاینت و جابه‌جایی بین مدل‌ها (Cross-Model Handoff).',
    diagramTitle: 'Multi-Turn State & Cross-Model Handoff',
    relatedChapterId: 'ch-10',
    relatedChapterLabel: 'فصل ۱۰: چت، حافظه و Interactions API',
    mermaidCode: `sequenceDiagram
  autonumber
  participant Dev as Python App
  participant OAI as OpenAI Responses API
  participant GemChat as Gemini chats.create()
  participant GemInt as Gemini Interactions API

  Note over Dev,OAI: Server-Side State Chain
  Dev->>OAI: responses.create(model="gpt-6.2-sol", input="Turn 1")
  OAI-->>Dev: response (id="resp_01")
  Dev->>OAI: responses.create(previous_response_id="resp_01", input="Turn 2")
  OAI-->>Dev: response (id="resp_02", full context loaded)

  Note over Dev,GemChat: Client-Managed History
  Dev->>GemChat: chat = client.chats.create(model="gemini-4-hydrogen")
  Dev->>GemChat: chat.send_message("Turn 1")
  GemChat-->>Dev: response + local history appended

  Note over Dev,GemInt: Server State + Cross-Model Handoff
  Dev->>GemInt: interactions.create(model="gemini-4-carbon", input="Plan")
  GemInt-->>Dev: interaction (id="int_01")
  Dev->>GemInt: interactions.create(model="gemini-4-hydrogen", previous_interaction_id="int_01")
  GemInt-->>Dev: interaction (id="int_02", handoff complete)`,
    openaiHighlights: [
      {
        stage: 'زنجیره سروری (previous_response_id)',
        detail:
          'بدون نیاز به ارسال دوباره کل تاریخچه پیام‌ها، فقط شناسه پاسخ قبلی ارسال می‌شود و OpenAI وضعیت و حافظه استدلال را در سرور ادامه می‌دهد.',
      },
      {
        stage: 'انشعاب مکالمه (Forking)',
        detail:
          'با ارجاع چند درخواست به یک previous_response_id ثابت می‌توانید شاخه‌های موازی (Branching) برای آزمون مسیرهای مختلف بسازید.',
      },
      {
        stage: 'کنترل نگهداری داده (store=False)',
        detail:
          'برای محیط‌های حساس می‌توانید store=False بگذارید و وضعیت را به‌صورت Stateless روی دیتابیس خودتان مدیریت کنید.',
      },
    ],
    googleHighlights: [
      {
        stage: 'کلاس Chat محلی (client.chats)',
        detail:
          'برای چت‌های ساده و تک‌سشن، شیء chat تاریخچه را در حافظه پایتون نگه می‌دارد و با هر send_message کل آرایه history را ارسال می‌کند.',
      },
      {
        stage: 'معماری Interactions API (سروری)',
        detail:
          'با client.interactions.create و previous_interaction_id وضعیت مکالمه در سرور گوگل ذخیره شده و پهنای باند ارسال کاهش می‌یابد.',
      },
      {
        stage: 'جابه‌جایی مدل (Cross-Model Handoff)',
        detail:
          'می‌توانید مرحله طراحی معماری را با gemini-4-carbon انجام دهید و ادامه همان previous_interaction_id را به gemini-4-hydrogen بسپارید.',
      },
    ],
  },
  {
    id: 'tools',
    title: 'ابزارها، File Search و MCP',
    shortTitle: 'ابزارها و MCP',
    subtitle:
      'تفاوت حلقه اجرای ابزارهای سفارشی (Function Calling) و ابزارهای میزبانی‌شده مانند جستجوی وب، RAG سروری و سرورهای MCP.',
    diagramTitle: 'Tool Execution, Grounding & MCP Architecture',
    relatedChapterId: 'ch-14',
    relatedChapterLabel: 'فصل ۱۴: ابزارهای بومی، RAG و MCP',
    mermaidCode: `flowchart TD
  Start(["User Query + Tool Definitions"])

  subgraph OpenAI_Loop["OpenAI Responses Orchestration"]
    direction TB
    OA_Req["responses.create(tools=...)"]
    OA_Dec{"Tool Type?"}
    OA_Built["Server-Executed Built-ins<br/>web_search / file_search / code_interpreter / mcp"]
    OA_Func["Returns function_call item<br/>App executes locally"]
    OA_Feed["Send function_call_output<br/>with previous_response_id"]
    OA_Out(["Final Grounded Answer"])

    OA_Req --> OA_Dec
    OA_Dec -->|Hosted or Remote MCP| OA_Built
    OA_Built --> OA_Out
    OA_Dec -->|Custom Function| OA_Func
    OA_Func --> OA_Feed
    OA_Feed --> OA_Out
  end

  subgraph Google_Loop["Google Gen AI Orchestration"]
    direction TB
    GA_Req["generate_content(config=tools)"]
    GA_Dec{"Tool Type?"}
    GA_Built["Native Grounding and RAG<br/>GoogleSearch / UrlContext / File Search Stores"]
    GA_Auto["Automatic Python Function Calling<br/>SDK runs Python fn and loops"]
    GA_Out(["Final Answer + Citations"])

    GA_Req --> GA_Dec
    GA_Dec -->|Built-in Grounding| GA_Built
    GA_Built --> GA_Out
    GA_Dec -->|Python Callable| GA_Auto
    GA_Auto --> GA_Out
  end

  Start --> OA_Req
  Start --> GA_Req`,
    openaiHighlights: [
      {
        stage: 'پشتیبانی بومی از Remote MCP',
        detail:
          'سرورهای MCP خارجی مستقیماً در آرایه tools با type="mcp" و server_url تعریف می‌شوند و خود سرویس OpenAI فراخوانی آن‌ها را هماهنگ می‌کند.',
      },
      {
        stage: 'Vector Stores و Code Interpreter',
        detail:
          'ابزارهای file_search (متصل به Vector Store) و code_interpreter (کانتینر ایزوله پایتون) بدون کدنویسی اضافه در سمت سرور اجرا می‌شوند.',
      },
      {
        stage: 'کنترل صریح Function Loop',
        detail:
          'برای توابع محلی، مدل آیتم function_call برمی‌گرداند؛ اپلیکیشن تابع را اجرا کرده و نتیجه را در قالب function_call_output بازمی‌گرداند.',
      },
    ],
    googleHighlights: [
      {
        stage: 'اجرای خودکار توابع پایتون',
        detail:
          'کافی است خود تابع پایتون (دارای Type Hints و Docstring) را در لیست tools بگذارید تا SDK به‌صورت خودکار اسکیما بسازد، تابع را اجرا کند و پاسخ نهایی دهد.',
      },
      {
        stage: 'File Search Stores + gemini-embedding-2',
        detail:
          'فایل‌ها در Store مدیریت‌شده ایندکس می‌شوند و همراه با UrlContext و GoogleSearch مستقیماً استناد (Grounding Metadata) برمی‌گردانند.',
      },
      {
        stage: 'جداسازی دقیق استنادها',
        detail:
          'منابع جستجوی وب و قطعات بازیابی‌شده در candidates[0].grounding_metadata قابل ممیزی و نمایش به کاربر هستند.',
      },
    ],
  },
  {
    id: 'async',
    title: 'استدلال، کش و پردازش پس‌زمینه',
    shortTitle: 'استدلال و کش',
    subtitle:
      'معماری کنترل عمق استدلال، بهینه‌سازی هزینه با Prompt/Context Caching و پردازش کارهای سنگین بدون Timeout.',
    diagramTitle: 'Reasoning, Context Caching & Long-Running Jobs',
    relatedChapterId: 'ch-18',
    relatedChapterLabel: 'فصل ۱۸ و ۱۹: کشینگ و Batch/Background',
    mermaidCode: `flowchart LR
  Task(["Complex Prompt + Large Context"])

  subgraph OAI_Opt["OpenAI Optimization Path"]
    direction TB
    OR1["Prompt Prefix Cache<br/>prompt_cache_key + retention 12h"]
    OR2["Reasoning Effort<br/>low / medium / high + summary"]
    OR3["Background Mode<br/>background=True + completion_window"]
    OR4["Poll responses.retrieve(id)<br/>or Webhook Callback"]
    OR1 --> OR2
    OR2 --> OR3
    OR3 --> OR4
  end

  subgraph GEM_Opt["Google Optimization Path"]
    direction TB
    GR1["Explicit Context Cache<br/>client.caches.create(ttl=3600s)"]
    GR2["ThinkingConfig<br/>thinking_level: low to xhigh"]
    GR3["Batch API Job<br/>client.batches.create (50% off)"]
    GR4["Poll batches.get(name)<br/>Retrieve Bulk Results"]
    GR1 --> GR2
    GR2 --> GR3
    GR3 --> GR4
  end

  Task --> OR1
  Task --> GR1`,
    openaiHighlights: [
      {
        stage: 'کش خودکار + نگهداری ۱۲ ساعته',
        detail:
          'پیشوندهای تکراری به‌صورت خودکار کش می‌شوند (تا ۹۵٪ تخفیف روی GPT-6.2) و با prompt_cache_retention="12h" ماندگاری آن افزایش می‌یابد.',
      },
      {
        stage: 'کنترل استدلال (reasoning.effort)',
        detail:
          'عمق تفکر مدل‌های استدلالی با سطوح low / medium / high و خلاصه تفکر با summary="auto" تنظیم می‌شود.',
      },
      {
        stage: 'اجرای پس‌زمینه (Background Mode)',
        detail:
          'با background=True و background_options={"completion_window": "2h"} کارهای طولانی بدون قطع اتصال HTTP و با ۳۰٪ تا ۴۰٪ تخفیف اجرا می‌شوند.',
      },
    ],
    googleHighlights: [
      {
        stage: 'کش صریح (Explicit Context Cache)',
        detail:
          'اسناد حجیم، کدبیس یا ویدیو یک‌بار در client.caches.create() ذخیره و با cached_content در صدها درخواست با ۷۵٪ تخفیف بازاستفاده می‌شوند.',
      },
      {
        stage: 'کنترل استدلال (thinking_level)',
        detail:
          'در نسل Gemini 4 به جای بودجه توکنی قدیمی، سطوح استاندارد low، medium، high و xhigh در ThinkingConfig عمق استدلال را کنترل می‌کنند.',
      },
      {
        stage: 'پردازش انبوه (Batch API)',
        detail:
          'هزاران درخواست غیرفوری با client.batches.create() و ۵۰٪ تخفیف به‌صورت ناهمگام پردازش می‌شوند.',
      },
    ],
  },
];

let renderCounter = 0;
let mermaidQueue: Promise<void> = Promise.resolve();

function parseSanitizedSvg(svgMarkup: string): SVGSVGElement | null {
  const parser = new DOMParser();

  // First attempt strict XML SVG parsing (succeeds cleanly when htmlLabels: false)
  const xmlDoc = parser.parseFromString(svgMarkup, 'image/svg+xml');
  let svgEl: Element | null =
    !xmlDoc.querySelector('parsererror') ? xmlDoc.querySelector('svg') : null;

  // Fallback to HTML parser if Mermaid emitted HTML tags inside foreignObject
  if (!svgEl) {
    const htmlDoc = parser.parseFromString(svgMarkup, 'text/html');
    svgEl = htmlDoc.body.querySelector('svg');
  }

  if (!svgEl) return null;

  // Defensively strip any script nodes or inline event handlers
  svgEl.querySelectorAll('script').forEach((node) => node.remove());
  svgEl.querySelectorAll('*').forEach((el) => {
    for (const attr of Array.from(el.attributes)) {
      if (attr.name.toLowerCase().startsWith('on')) {
        el.removeAttribute(attr.name);
      }
    }
  });

  return document.importNode(svgEl, true) as SVGSVGElement;
}

interface ArchitectureExplorerProps {
  theme: ThemeId;
  onNavigate?: (id: string) => void;
}

export const ArchitectureExplorer: React.FC<ArchitectureExplorerProps> = ({
  theme,
  onNavigate,
}) => {
  const [scenarioId, setScenarioId] = useState<FlowScenarioId>('core');
  const [zoom, setZoom] = useState<number>(100);
  const [showSource, setShowSource] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [renderState, setRenderState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [lastSvgMarkup, setLastSvgMarkup] = useState<string>('');

  const svgHostRef = useRef<HTMLDivElement>(null);

  const activeScenario =
    FLOW_SCENARIOS.find((item) => item.id === scenarioId) ?? FLOW_SCENARIOS[0];

  useEffect(() => {
    let cancelled = false;

    const runRender = async () => {
      if (cancelled) return;
      setRenderState('loading');
      setErrorMessage('');

      // Dedicated offscreen sandbox so Mermaid never pollutes document.body layout
      const sandbox = document.createElement('div');
      sandbox.setAttribute('aria-hidden', 'true');
      sandbox.style.position = 'fixed';
      sandbox.style.left = '-99999px';
      sandbox.style.top = '0';
      sandbox.style.width = '1200px';
      sandbox.style.height = '0';
      sandbox.style.overflow = 'hidden';
      sandbox.style.visibility = 'hidden';
      sandbox.style.pointerEvents = 'none';
      document.body.appendChild(sandbox);

      renderCounter += 1;
      const uniqueId = `arch_mermaid_${scenarioId}_${renderCounter}`;

      try {
        const styles = window.getComputedStyle(document.documentElement);
        const cssVar = (name: string, fallback: string) =>
          styles.getPropertyValue(name).trim() || fallback;

        const isDark = theme === 'obsidian-dark' || theme === 'nordic-dark';
        const bgCanvas = cssVar('--bg-canvas', isDark ? '#0B0E14' : '#FBF9F5');
        const bgSurface = cssVar('--bg-surface', isDark ? '#11151E' : '#FFFFFF');
        const bgSubtle = cssVar('--bg-subtle', isDark ? '#161C27' : '#F3EFE7');
        const borderStrong = cssVar('--border-strong', isDark ? '#354156' : '#CEC6B6');
        const textPrimary = cssVar('--text-primary', isDark ? '#EDF2F7' : '#141311');
        const textSecondary = cssVar('--text-secondary', isDark ? '#B8C4D6' : '#3D3832');
        const accent = cssVar('--accent', isDark ? '#7AA2F7' : '#1D3557');
        const openaiSoft = cssVar('--openai-soft', isDark ? '#102627' : '#EDF5F0');
        const googleSoft = cssVar('--google-soft', isDark ? '#142038' : '#EEF3FC');

        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          suppressErrorRendering: true,
          htmlLabels: false,
          theme: 'base',
          fontFamily: '"JetBrains Mono", "Vazirmatn", ui-monospace, sans-serif',
          flowchart: {
            useMaxWidth: true,
            htmlLabels: false,
            curve: 'basis',
            padding: 16,
            nodeSpacing: 36,
            rankSpacing: 48,
          },
          sequence: {
            useMaxWidth: true,
            mirrorActors: false,
            actorMargin: 42,
            messageMargin: 32,
            boxMargin: 10,
          },
          themeVariables: {
            darkMode: isDark,
            background: bgCanvas,
            primaryColor: bgSurface,
            primaryTextColor: textPrimary,
            primaryBorderColor: accent,
            secondaryColor: openaiSoft,
            secondaryTextColor: textPrimary,
            secondaryBorderColor: borderStrong,
            tertiaryColor: googleSoft,
            tertiaryTextColor: textPrimary,
            tertiaryBorderColor: borderStrong,
            lineColor: borderStrong,
            textColor: textPrimary,
            mainBkg: bgSurface,
            nodeBorder: borderStrong,
            clusterBkg: bgSubtle,
            clusterBorder: borderStrong,
            titleColor: textPrimary,
            edgeLabelBackground: bgCanvas,
            actorBkg: bgSurface,
            actorBorder: accent,
            actorTextColor: textPrimary,
            actorLineColor: borderStrong,
            signalColor: textSecondary,
            signalTextColor: textPrimary,
            noteBkgColor: bgSubtle,
            noteBorderColor: borderStrong,
            noteTextColor: textPrimary,
            activationBkgColor: bgSubtle,
            activationBorderColor: accent,
            fontSize: '13px',
          },
        });

        const { svg } = await mermaid.render(uniqueId, activeScenario.mermaidCode, sandbox);

        if (cancelled) return;

        const importedSvg = parseSanitizedSvg(svg);
        if (!importedSvg) {
          throw new Error('SVG parsing returned an empty diagram.');
        }

        importedSvg.style.maxWidth = '100%';
        importedSvg.style.height = 'auto';
        importedSvg.style.display = 'block';
        importedSvg.setAttribute('role', 'img');
        importedSvg.setAttribute('aria-label', activeScenario.diagramTitle);

        if (svgHostRef.current) {
          svgHostRef.current.replaceChildren(importedSvg);
        }
        setLastSvgMarkup(svg);
        setRenderState('ready');
      } catch (err) {
        if (cancelled) return;
        setRenderState('error');
        setErrorMessage(
          err instanceof Error ? err.message : 'خطا در رندر نمودار معماری Mermaid.'
        );
      } finally {
        sandbox.remove();
        document.getElementById(`d${uniqueId}`)?.remove();
        document.getElementById(uniqueId)?.remove();
      }
    };

    // Serialize renders to prevent concurrent Mermaid global config races
    mermaidQueue = mermaidQueue.then(runRender, runRender);

    return () => {
      cancelled = true;
    };
  }, [scenarioId, theme, activeScenario.mermaidCode, activeScenario.diagramTitle]);

  const handleCopyMermaid = async () => {
    try {
      await navigator.clipboard.writeText(activeScenario.mermaidCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore clipboard restrictions
    }
  };

  const handleDownloadSvg = () => {
    if (!lastSvgMarkup) return;
    const blob = new Blob([lastSvgMarkup], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sdk-architecture-${activeScenario.id}.svg`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* Header Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-base font-extrabold" style={{ color: 'var(--text-primary)' }}>
            کاوشگر تعاملی معماری دو SDK (Mermaid.js)
          </h3>
          <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
            جریان واقعی درخواست/پاسخ، مدیریت وضعیت، حلقه ابزارها و کشینگ در OpenAI Responses API و
            Google Gen AI SDK را به‌صورت تصویری مقایسه کنید.
          </p>
        </div>

        {/* Scenario Switcher Tabs */}
        <div
          className="flex flex-wrap items-center gap-1 rounded-md border p-0.5"
          style={{
            borderColor: 'var(--border-subtle)',
            backgroundColor: 'var(--bg-subtle)',
          }}
        >
          {FLOW_SCENARIOS.map((item) => {
            const isActive = item.id === scenarioId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setScenarioId(item.id);
                  setZoom(100);
                }}
                className="h-8 shrink-0 rounded px-2.5 text-xs font-medium transition-colors whitespace-nowrap"
                style={{
                  backgroundColor: isActive ? 'var(--bg-surface)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                }}
              >
                {item.shortTitle}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Diagram Stage */}
      <div
        className="overflow-hidden rounded-md border"
        style={{
          borderColor: 'var(--border-subtle)',
          backgroundColor: 'var(--bg-surface)',
        }}
      >
        {/* Diagram Toolbar */}
        <div
          className="flex flex-wrap items-center justify-between gap-2 border-b px-3.5 py-2.5"
          style={{
            borderColor: 'var(--border-subtle)',
            backgroundColor: 'var(--bg-subtle)',
          }}
        >
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
              {activeScenario.title}
            </span>
            <span aria-hidden="true" style={{ color: 'var(--border-strong)' }}>
              ·
            </span>
            <span dir="ltr" className="font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>
              {activeScenario.diagramTitle}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {/* Zoom Controls */}
            <div
              className="inline-flex items-center rounded border"
              style={{
                borderColor: 'var(--border-subtle)',
                backgroundColor: 'var(--bg-canvas)',
              }}
            >
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(60, z - 15))}
                aria-label="کوچک‌نمایی نمودار"
                className="inline-flex h-7 w-7 items-center justify-center transition-colors hover:opacity-80"
                style={{ color: 'var(--text-secondary)' }}
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <span
                dir="ltr"
                className="min-w-[44px] border-x px-1.5 text-center font-mono text-[11px] font-semibold tabular-nums"
                style={{
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              >
                {zoom}%
              </span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(175, z + 15))}
                aria-label="بزرگ‌نمایی نمودار"
                className="inline-flex h-7 w-7 items-center justify-center transition-colors hover:opacity-80"
                style={{ color: 'var(--text-secondary)' }}
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoom(100)}
                aria-label="بازنشانی بزرگ‌نمایی"
                className="inline-flex h-7 w-7 items-center justify-center border-r transition-colors hover:opacity-80"
                style={{
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-muted)',
                }}
              >
                <RotateCcw className="h-3 w-3" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowSource((v) => !v)}
              className="inline-flex h-7 items-center gap-1 rounded border px-2 text-[11px] font-medium transition-colors whitespace-nowrap"
              style={{
                borderColor: showSource ? 'var(--accent)' : 'var(--border-subtle)',
                backgroundColor: showSource ? 'var(--accent-soft)' : 'var(--bg-canvas)',
                color: showSource ? 'var(--accent)' : 'var(--text-secondary)',
              }}
            >
              <Code2 className="h-3 w-3" />
              <span>کد Mermaid</span>
            </button>

            <button
              type="button"
              onClick={handleCopyMermaid}
              className="inline-flex h-7 items-center gap-1 rounded border px-2 text-[11px] font-medium transition-colors whitespace-nowrap"
              style={{
                borderColor: 'var(--border-subtle)',
                backgroundColor: 'var(--bg-canvas)',
                color: copied ? 'var(--openai-accent)' : 'var(--text-secondary)',
              }}
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              <span>{copied ? 'کپی شد' : 'کپی'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadSvg}
              disabled={!lastSvgMarkup}
              className="inline-flex h-7 items-center gap-1 rounded border px-2 text-[11px] font-medium transition-colors disabled:opacity-40 whitespace-nowrap"
              style={{
                borderColor: 'var(--border-subtle)',
                backgroundColor: 'var(--bg-canvas)',
                color: 'var(--text-secondary)',
              }}
            >
              <Download className="h-3 w-3" />
              <span>SVG</span>
            </button>
          </div>
        </div>

        {/* Subtitle strip */}
        <div
          className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2 text-xs"
          style={{
            borderColor: 'var(--border-subtle)',
            backgroundColor: 'var(--bg-canvas)',
            color: 'var(--text-secondary)',
          }}
        >
          <span>{activeScenario.subtitle}</span>
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate(activeScenario.relatedChapterId)}
              className="inline-flex items-center gap-1 font-semibold hover:underline whitespace-nowrap"
              style={{ color: 'var(--accent)' }}
            >
              <span>{activeScenario.relatedChapterLabel}</span>
              <ArrowUpLeft className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* SVG Viewport */}
        <div
          dir="ltr"
          className="code-scroll relative min-h-[260px] w-full overflow-x-auto p-5"
          style={{ backgroundColor: 'var(--bg-canvas)' }}
        >
          {renderState === 'loading' && (
            <div
              className="flex h-56 items-center justify-center text-xs"
              style={{ color: 'var(--text-muted)' }}
              dir="rtl"
            >
              در حال ترسیم نمودار معماری با Mermaid.js...
            </div>
          )}

          {renderState === 'error' && (
            <div
              className="rounded border p-4 text-xs"
              style={{
                borderColor: 'var(--border-strong)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
              }}
              dir="rtl"
            >
              <p className="font-bold">امکان ترسیم نمودار وجود نداشت</p>
              <p className="mt-1 font-mono text-[11px]" dir="ltr" style={{ color: 'var(--text-muted)' }}>
                {errorMessage}
              </p>
            </div>
          )}

          <div
            ref={svgHostRef}
            className="mx-auto flex justify-center transition-transform duration-150"
            style={{
              display: renderState === 'ready' ? 'flex' : 'none',
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
            }}
          />
        </div>

        {/* Optional Collapsible Raw Mermaid Source */}
        {showSource && (
          <div
            className="border-t p-3.5"
            style={{
              borderColor: 'var(--border-subtle)',
              backgroundColor: 'var(--code-bg)',
            }}
          >
            <div className="mb-1.5 flex items-center justify-between text-[11px]">
              <span className="font-mono font-semibold" style={{ color: 'var(--text-muted)' }}>
                mermaid-definition.mmd
              </span>
              <span style={{ color: 'var(--text-muted)' }}>
                قابل استفاده در GitHub Markdown و Notion
              </span>
            </div>
            <pre
              dir="ltr"
              className="code-scroll max-h-60 overflow-auto rounded border p-3 font-mono text-[11.5px] leading-relaxed"
              style={{
                borderColor: 'var(--code-border)',
                backgroundColor: 'var(--bg-canvas)',
                color: 'var(--syn-text)',
              }}
            >
              {activeScenario.mermaidCode}
            </pre>
          </div>
        )}
      </div>

      {/* Side-by-Side Architectural Breakdown */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div
          className="rounded-md border p-4"
          style={{
            borderColor: 'var(--border-subtle)',
            backgroundColor: 'var(--bg-surface)',
          }}
        >
          <div
            className="mb-3 flex items-center justify-between border-b pb-2"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <span className="text-xs font-extrabold" style={{ color: 'var(--openai-accent)' }}>
              معماری OpenAI Responses API
            </span>
            <span dir="ltr" className="font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>
              openai Python SDK
            </span>
          </div>
          <ol className="space-y-3">
            {activeScenario.openaiHighlights.map((item, idx) => (
              <li key={item.stage} className="text-xs leading-relaxed">
                <div className="font-bold" style={{ color: 'var(--text-primary)' }}>
                  {toPersianDigits(idx + 1)}. {item.stage}
                </div>
                <p className="mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  {item.detail}
                </p>
              </li>
            ))}
          </ol>
        </div>

        <div
          className="rounded-md border p-4"
          style={{
            borderColor: 'var(--border-subtle)',
            backgroundColor: 'var(--bg-surface)',
          }}
        >
          <div
            className="mb-3 flex items-center justify-between border-b pb-2"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <span className="text-xs font-extrabold" style={{ color: 'var(--google-accent)' }}>
              معماری Google Gen AI SDK
            </span>
            <span dir="ltr" className="font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>
              google-genai SDK
            </span>
          </div>
          <ol className="space-y-3">
            {activeScenario.googleHighlights.map((item, idx) => (
              <li key={item.stage} className="text-xs leading-relaxed">
                <div className="font-bold" style={{ color: 'var(--text-primary)' }}>
                  {toPersianDigits(idx + 1)}. {item.stage}
                </div>
                <p className="mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  {item.detail}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};
