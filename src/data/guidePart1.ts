import { AuditChange, Chapter, GuidePart, QuickRefRow } from '../types/guide';

export const GUIDE_PARTS: GuidePart[] = [
  {
    id: 'part-1',
    number: 'بخش اول',
    titleFa: 'شروع سریع، پیکربندی و کنترل توکن‌ها',
    subtitle: 'نصب، احراز هویت امن، پرامپت پایه، نقش سیستم، شمارش توکن و انتخاب مدل‌های ۲۰۲۶',
  },
  {
    id: 'part-2',
    number: 'بخش دوم',
    titleFa: 'پردازش چندوجهی و خروجی ساختاریافته',
    subtitle: 'تصویر (OCR)، فایل PDF بومی، صوت و ویدیو، و خروجی تضمین‌شده Pydantic',
  },
  {
    id: 'part-3',
    number: 'بخش سوم',
    titleFa: 'مکالمه، استریم لحظه‌ای و استدلال عمیق',
    subtitle: 'حافظه چت، Interactions API، استریم با Context Manager و سطوح تفکر جدید',
  },
  {
    id: 'part-4',
    number: 'بخش چهارم',
    titleFa: 'ابزارها، MCP، جستجوی زنده و بردارها',
    subtitle: 'جستجوی وب با استناد، File Search، Remote MCP، چرخه Function Calling و Embeddings',
  },
  {
    id: 'part-5',
    number: 'بخش پنجم',
    titleFa: 'مقیاس‌پذیری، بهینه‌سازی هزینه و محیط عملیاتی',
    subtitle: 'اجرای Async با Semaphore، کش ۱۲ ساعته، Batch/Background، ایمنی، Retry و چک‌لیست نهایی',
  },
];

export const AUDIT_CHANGES: AuditChange[] = [
  {
    category: 'تکمیل حفره فنی',
    title: 'به‌روزرسانی کامل مدل‌ها به نسل ۲۰۲۶ (GPT-6.2 و Gemini 4 / 3.8 Flash)',
    detail:
      'تمامی مثال‌ها، جدول انتخاب مدل و ماشین‌حساب هزینه بر اساس مستندات رسمی OpenAI (gpt-6-luna، gpt-6.1-terra، gpt-6.2-sol، gpt-6.2-astra) و Google AI Studio (gemini-3.8-flash، gemini-4-hydrogen، gemini-4-carbon، gemini-4-neon و gemini-embedding-2) به‌روزرسانی شدند.',
  },
  {
    category: 'تکمیل حفره فنی',
    title: 'افزودن Interactions API گوگل، thinking_level و Remote MCP در OpenAI',
    detail:
      'پشتیبانی از client.interactions.create با previous_interaction_id (و جابه‌جایی میان‌مدلی Carbon به Hydrogen)، پارامتر جدید thinking_level ("low" تا "xhigh")، ابزار file_search هر دو سرویس، prompt_cache_retention="12h" و ابزار بومی MCP اضافه شد.',
  },
  {
    category: 'اصلاح نگارشی و صفحه‌آرایی',
    title: 'رفع کامل باگ‌های چاپی، دوجهته (RTL/LTR) و شماره‌گذاری صفحات',
    detail:
      'حذف ستاره‌های خام مارک‌داون (**...**) در صفحات فایل اصلی، اصلاح شماره صفحات معکوس (۴۱ و ۵۱)، رفع هم‌پوشانی جدول مرجع سریع، ایزوله‌سازی کدهای انگلیسی و جلوگیری از شکستن بلوک‌های کد در چاپ PDF.',
  },
  {
    category: 'تکمیل حفره فنی',
    title: 'چرخه کامل Function Calling، استخراج Citations و آپلود فایل حجیم',
    detail:
      'بازگرداندن خروجی تابع با function_call_output و call_id در OpenAI، حالت دستی در Gemini (disable=True + Part.from_function_response)، استخراج لینک منابع از annotations و grounding_metadata و آپلود PDF حجیم با Files API تکمیل شد.',
  },
  {
    category: 'فصل جدید افزوده‌شده',
    title: '۴ فصل جدید: صوت و ویدیو، Code/URL/MCP/FileSearch، Embeddings و ایمنی',
    detail:
      'فصل‌های پردازش بومی صوت و ویدیو، ابزارهای پیشرفته (Code Interpreter / URL Context / File Search / MCP)، بردارهای معنایی (gemini-embedding-2) و تنظیمات SafetySetting و store=False اضافه شدند.',
  },
];

export const QUICK_REF_ROWS: QuickRefRow[] = [
  {
    operation: 'نصب کتابخانه رسمی',
    chapterId: 'ch-1',
    chapterNumber: 1,
    openaiCode: 'pip install -U openai',
    googleCode: 'pip install -U google-genai',
  },
  {
    operation: 'متغیر محیطی کلید API',
    chapterId: 'ch-1',
    chapterNumber: 1,
    openaiCode: 'OPENAI_API_KEY',
    googleCode: 'GEMINI_API_KEY',
    googleNote: 'یا GOOGLE_API_KEY',
  },
  {
    operation: 'ایمپورت و ساخت کلاینت',
    chapterId: 'ch-1',
    chapterNumber: 1,
    openaiCode: 'from openai import OpenAI\nclient = OpenAI()',
    googleCode: 'from google import genai\nfrom google.genai import types\nclient = genai.Client()',
  },
  {
    operation: 'متد اصلی تولید پاسخ',
    chapterId: 'ch-2',
    chapterNumber: 2,
    openaiCode: 'client.responses.create(...)',
    googleCode: 'client.models.generate_content(...)\nیا client.interactions.create(...)',
  },
  {
    operation: 'دسترسی به متن خروجی',
    chapterId: 'ch-2',
    chapterNumber: 2,
    openaiCode: 'response.output_text',
    googleCode: 'response.text\n(در Interactions: interaction.output_text)',
  },
  {
    operation: 'تنظیم نقش سیستم و پارامترها',
    chapterId: 'ch-3',
    chapterNumber: 3,
    openaiCode: 'instructions="..."\ntemperature=0.2\nmax_output_tokens=300',
    openaiNote: 'آرگومان مستقیم در create()',
    googleCode: 'config=types.GenerateContentConfig(\n  system_instruction="...",\n  temperature=0.2,\n  max_output_tokens=300\n)',
    googleNote: 'داخل شیء GenerateContentConfig',
  },
  {
    operation: 'بررسی کامل بودن پاسخ (Truncation)',
    chapterId: 'ch-4',
    chapterNumber: 4,
    openaiCode: 'response.status\nresponse.incomplete_details',
    googleCode: 'response.candidates[0].finish_reason',
  },
  {
    operation: 'آمار مصرف توکن و شمارش پیش‌فرض',
    chapterId: 'ch-4',
    chapterNumber: 4,
    openaiCode: 'response.usage\nusage.output_tokens_details.reasoning_tokens',
    googleCode: 'response.usage_metadata\nclient.models.count_tokens(...)',
  },
  {
    operation: 'مدل‌های پیشنهادی ۲۰۲۶',
    chapterId: 'ch-5',
    chapterNumber: 5,
    openaiCode: 'gpt-6-luna · gpt-6.1-terra\ngpt-6.2-sol · gpt-6.2-astra',
    googleCode: 'gemini-3.8-flash · gemini-4-hydrogen\ngemini-4-carbon · gemini-4-neon',
  },
  {
    operation: 'ارسال تصویر و PDF بومی',
    chapterId: 'ch-7',
    chapterNumber: 7,
    openaiCode: 'type: "input_image" / "input_file"\nfile_data (Base64) یا file_id',
    googleCode: 'types.Part.from_bytes(...)\nیا client.files.upload(file=...)',
  },
  {
    operation: 'پردازش صوت و ویدیو',
    chapterId: 'ch-8',
    chapterNumber: 8,
    openaiCode: 'client.audio.transcriptions.create(...)\n+ تحلیل در responses.create',
    googleCode: 'client.files.upload(file="video.mp4")\nیا Part.from_bytes(mime_type="audio/mp3")',
  },
  {
    operation: 'خروجی ساختاریافته Pydantic',
    chapterId: 'ch-9',
    chapterNumber: 9,
    openaiCode: 'client.responses.parse(..., text_format=Schema)\nresponse.output_parsed',
    googleCode: 'GenerateContentConfig(\n  response_mime_type="application/json",\n  response_schema=Schema\n)  # response.parsed',
  },
  {
    operation: 'مکالمه چندمرحله‌ای و حالت سرور',
    chapterId: 'ch-10',
    chapterNumber: 10,
    openaiCode: 'previous_response_id=resp1.id',
    openaiNote: 'یا حالت بدون ذخیره با store=False',
    googleCode: 'client.interactions.create(previous_interaction_id=...)\nیا client.chats.create()',
    googleNote: 'پشتیبانی از حالت سرور (Interactions) و کلاینت (Chats)',
  },
  {
    operation: 'پاسخ‌دهی جریانی (Streaming)',
    chapterId: 'ch-11',
    chapterNumber: 11,
    openaiCode: 'with client.responses.stream(...) as s:',
    openaiNote: 'رویداد response.output_text.delta',
    googleCode: 'client.models.generate_content_stream(...)',
    googleNote: 'دریافت chunk.text',
  },
  {
    operation: 'کنترل استدلال (Reasoning / Thinking)',
    chapterId: 'ch-12',
    chapterNumber: 12,
    openaiCode: 'reasoning={"effort": "medium", "summary": "auto"}',
    googleCode: 'thinking_config=types.ThinkingConfig(\n  thinking_level="high",\n  include_thoughts=True\n)',
    googleNote: 'low | medium | high | xhigh (در Gemini 4)',
  },
  {
    operation: 'جستجوی وب داخلی + استنادها',
    chapterId: 'ch-13',
    chapterNumber: 13,
    openaiCode: 'tools=[{"type": "web_search"}]',
    openaiNote: 'منابع در annotations',
    googleCode: 'tools=[types.Tool(google_search=types.GoogleSearch())]',
    googleNote: 'منابع در grounding_metadata',
  },
  {
    operation: 'اجرای کد، File Search، URL و MCP',
    chapterId: 'ch-14',
    chapterNumber: 14,
    openaiCode: 'type: "code_interpreter" | "file_search" | "mcp"',
    googleCode: 'ToolCodeExecution() · UrlContext()\nclient.file_search_stores + interactions',
  },
  {
    operation: 'فراخوانی توابع سفارشی (Tools)',
    chapterId: 'ch-15',
    chapterNumber: 15,
    openaiCode: 'type: "function" + بازگشت با\ntype: "function_call_output" و call_id',
    googleCode: 'ارسال مستقیم تابع پایتون (خودکار)\nیا disable=True + Part.from_function_response',
  },
  {
    operation: 'بردارهای معنایی (Embeddings)',
    chapterId: 'ch-16',
    chapterNumber: 16,
    openaiCode: 'client.embeddings.create(model="text-embedding-3-small", ...)',
    googleCode: 'client.models.embed_content(model="gemini-embedding-2", ...)',
    googleNote: 'پشتیبانی متنی و چندوجهی',
  },
  {
    operation: 'اجرای غیرهمزمان (Async)',
    chapterId: 'ch-17',
    chapterNumber: 17,
    openaiCode: 'from openai import AsyncOpenAI\nawait async_client.responses.create(...)',
    googleCode: 'await client.aio.models.generate_content(...)',
    googleNote: 'روی همان کلاینت از طریق .aio',
  },
  {
    operation: 'کش کردن کانتکست (Context Caching)',
    chapterId: 'ch-18',
    chapterNumber: 18,
    openaiCode: 'خودکار + prompt_cache_key\n+ prompt_cache_retention="12h"',
    googleCode: 'کش ضمنی خودکار + کش صریح با\nclient.caches.create(..., ttl="3600s")',
  },
  {
    operation: 'پردازش انبوه (۵۰٪ تخفیف) و Background',
    chapterId: 'ch-19',
    chapterNumber: 19,
    openaiCode: 'client.batches.create(...) | background=True\nbackground_options={"completion_window": "2h"}',
    googleCode: 'client.batches.create(src=...)\nerrors.APIError (e.code == 429)',
  },
];

export const CHAPTERS_PART_1: Chapter[] = [
  {
    id: 'ch-1',
    number: 1,
    partId: 'part-1',
    titleFa: 'نصب، احراز هویت و ساخت کلاینت',
    titleEn: 'Installation, Authentication & Client Setup',
    summary:
      'نصب آخرین نسخه کتابخانه‌های رسمی (OpenAI Python SDK v3+ و Google Gen AI SDK) و اتصال امن به سرور بدون نوشتن مستقیم کلید API در فایل‌های کد. همیشه کلیدها را از طریق متغیرهای محیطی سیستم یا فایل env. مدیریت کنید.',
    notes: [
      'برای گوگل حتماً از بسته رسمی و یکپارچه google-genai استفاده کنید (بسته قدیمی google-generativeai منسوخ شده است).',
      'تنظیم تایم‌اوت سراسری (timeout) در زمان ساخت کلاینت باعث می‌شود درخواست‌های معلق شبکه برنامه شما را قفل نکنند.',
    ],
    blocks: [
      {
        provider: 'terminal',
        label: 'نصب و تنظیم کلیدها در ترمینال',
        sublabel: 'Linux / macOS / .env',
        language: 'bash',
        code: `# نصب یا به‌روزرسانی هر دو کتابخانه رسمی و ابزار مدیریت .env
pip install --upgrade openai google-genai python-dotenv pydantic

# تنظیم امن کلیدهای API به‌عنوان متغیر محیطی (یا ذخیره در فایل .env)
export OPENAI_API_KEY="sk-..."
export GEMINI_API_KEY="AIza..."`,
      },
      {
        provider: 'openai',
        label: 'OpenAI Responses API',
        sublabel: 'ساخت کلاینت استاندارد',
        language: 'python',
        code: `from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()  # خواندن خودکار متغیرها از فایل .env

# کلید OPENAI_API_KEY به‌صورت خودکار از محیط خوانده می‌شود
client = OpenAI(timeout=30.0, max_retries=2)`,
      },
      {
        provider: 'google',
        label: 'Google Gen AI SDK',
        sublabel: 'ساخت کلاینت استاندارد',
        language: 'python',
        code: `from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()  # خواندن خودکار متغیرها از فایل .env

# کلید GEMINI_API_KEY (یا GOOGLE_API_KEY) خودکار خوانده می‌شود
# timeout در Google SDK بر حسب میلی‌ثانیه است
client = genai.Client(
    http_options=types.HttpOptions(timeout=30_000)
)`,
      },
    ],
  },
  {
    id: 'ch-2',
    number: 2,
    partId: 'part-1',
    titleFa: 'تولید متن ساده',
    titleEn: 'Basic Text Prompt',
    summary:
      'ارسال یک سؤال یا دستور متنی ساده و دریافت پاسخ مستقیم مدل با مدل‌های روزمره سریع ۲۰۲۶. در OpenAI از متد مدرن responses.create و در گوگل از models.generate_content (یا Interactions API) استفاده می‌شود.',
    blocks: [
      {
        provider: 'openai',
        label: 'OpenAI Responses API',
        sublabel: 'مدل سریع روزمره gpt-6.2-sol (یا gpt-6-luna برای حجم بالا)',
        language: 'python',
        code: `response = client.responses.create(
    model="gpt-6.2-sol",
    input="تفاوت API و SDK را در دو جمله توضیح بده.",
)
print(response.output_text)`,
      },
      {
        provider: 'google',
        label: 'Google Gen AI SDK',
        sublabel: 'مدل سریع روزمره gemini-4-hydrogen (یا gemini-3.8-flash)',
        language: 'python',
        code: `response = client.models.generate_content(
    model="gemini-4-hydrogen",
    contents="تفاوت API و SDK را در دو جمله توضیح بده.",
)
print(response.text)`,
      },
    ],
  },
  {
    id: 'ch-3',
    number: 3,
    partId: 'part-1',
    titleFa: 'تنظیم نقش سیستم، دما و سقف توکن خروجی',
    titleEn: 'System Instructions, Temperature & Max Output Tokens',
    summary:
      'تعیین نقش تخصصی و لحن پاسخ‌دهی مدل (System Prompt)، کنترل میزان خلاقیت یا قطعیت پاسخ (Temperature) و محدود کردن حداکثر طول پاسخ برای مدیریت هزینه و زمان اجرا.',
    notes: [
      'در OpenAI Responses API حداقل مقدار مجاز برای max_output_tokens برابر ۱۶ توکن است؛ مقدار کمتر خطای 400 BadRequestError برمی‌گرداند.',
      'در مدل‌های استدلالی (مانند gpt-6.2-astra و خانواده Gemini 4)، توکن‌های استدلال داخلی به عنوان توکن خروجی محاسبه می‌شوند؛ برای پاسخ‌های کوتاه سطح تفکر را روی low قرار دهید.',
    ],
    blocks: [
      {
        provider: 'openai',
        label: 'OpenAI Responses API',
        language: 'python',
        code: `response = client.responses.create(
    model="gpt-6.2-sol",
    instructions=(
        "You are a senior software engineer. "
        "Reply concisely and technically."
    ),
    input="Why is parsing PDF layouts difficult?",
    temperature=0.2,
    max_output_tokens=300,  # حداقل مقدار مجاز ۱۶ است
)
print(response.output_text)`,
      },
      {
        provider: 'google',
        label: 'Google Gen AI SDK',
        language: 'python',
        code: `response = client.models.generate_content(
    model="gemini-4-hydrogen",
    contents="Why is parsing PDF layouts difficult?",
    config=types.GenerateContentConfig(
        system_instruction=(
            "You are a senior software engineer. "
            "Reply concisely and technically."
        ),
        temperature=0.2,
        max_output_tokens=300,
    ),
)
print(response.text)`,
      },
    ],
  },
  {
    id: 'ch-4',
    number: 4,
    partId: 'part-1',
    titleFa: 'بررسی کامل بودن پاسخ (Truncation)، شمارش توکن و آمار مصرف',
    titleEn: 'Truncation Checks, Token Counting & Usage Accounting',
    summary:
      'اطمینان از اینکه پاسخ مدل به دلیل پر شدن سقف max_output_tokens وسط جمله یا وسط ساختار JSON قطع نشده است، شمارش دقیق توکن‌ها پیش از ارسال درخواست، و ثبت تفکیک‌شده توکن‌های ورودی، خروجی، کش‌شده و استدلالی.',
    isExpanded: true,
    notes: [
      'در مدل‌های استدلالی جدید (Gemini 4 و GPT-6.2)، بودجه توکن‌های تفکر داخلی از سقف خروجی کسر شده و به‌عنوان Output Token صورت‌حساب می‌شود؛ در کارهای کوتاه thinking_level="low" یا reasoning={"effort": "low"} تنظیم کنید.',
      'در گوگل می‌توانید پیش از ارسال درخواست با client.models.count_tokens هزینه دقیق ورودی (متن، تصویر و PDF) را محاسبه کنید.',
    ],
    blocks: [
      {
        provider: 'openai',
        label: 'OpenAI Responses API',
        sublabel: 'بررسی قطع‌شدگی + تفکیک کامل توکن‌ها',
        language: 'python',
        code: `response = client.responses.create(
    model="gpt-6-luna",
    input="Write a 5-paragraph history of OCR systems.",
    max_output_tokens=40,
)

print("Status:", response.status)                # "completed" | "incomplete"
print("Incomplete:", response.incomplete_details) # reason="max_output_tokens"

usage = response.usage
print("Input tokens:", usage.input_tokens)
print("Output tokens:", usage.output_tokens)
print("Cached input:", usage.input_tokens_details.cached_tokens)
print("Reasoning tokens:", usage.output_tokens_details.reasoning_tokens)`,
      },
      {
        provider: 'google',
        label: 'Google Gen AI SDK',
        sublabel: 'شمارش پیش‌فرض + بررسی FinishReason + آمار کامل',
        language: 'python',
        code: `# ۱) شمارش دقیق توکن‌ها پیش از ارسال درخواست (بدون هزینه تولید)
prompt = "Write a 5-paragraph history of OCR systems."
count = client.models.count_tokens(model="gemini-3.8-flash", contents=prompt)
print("Estimated input tokens:", count.total_tokens)

# ۲) ارسال درخواست با کمترین سطح تفکر برای جلوگیری از هدررفت سقف توکن
response = client.models.generate_content(
    model="gemini-4-hydrogen",
    contents=prompt,
    config=types.GenerateContentConfig(
        max_output_tokens=40,
        thinking_config=types.ThinkingConfig(thinking_level="low"),
    ),
)

finish_reason = response.candidates[0].finish_reason
print("Finish reason:", finish_reason)  # FinishReason.STOP یا MAX_TOKENS

meta = response.usage_metadata
print("Prompt tokens:", meta.prompt_token_count)
print("Output tokens:", meta.candidates_token_count)
print("Thoughts tokens:", getattr(meta, "thoughts_token_count", 0))
print("Cached tokens:", getattr(meta, "cached_content_token_count", 0))`,
      },
    ],
  },
  {
    id: 'ch-5',
    number: 5,
    partId: 'part-1',
    titleFa: 'لیست کردن مدل‌های در دسترس و راهنمای انتخاب مدل‌های ۲۰۲۶',
    titleEn: 'Listing Available Models & 2026 Model Selection Guide',
    summary:
      'مشاهده شناسه دقیق مدل‌های فعال روی کلید API شما برای پیشگیری از خطای 404 Model Not Found و انتخاب دقیق‌ترین مدل از نسل جدید ۲۰۲۶ متناسب با سرعت، بودجه و عمق استدلال.',
    isExpanded: true,
    miniTable: [
      {
        feature: 'فوق‌سریع و بسیار اقتصادی (حجم بالا)',
        openai: 'gpt-6-luna ($0.10 / $0.50)',
        google: 'gemini-3.8-flash (رایگان / $0.75)',
      },
      {
        feature: 'روزمره متعادل، کدنویسی و ایجنت (پنجره ۱M)',
        openai: 'gpt-6.2-sol ($2.00 / $10.00)',
        google: 'gemini-4-hydrogen ($1.50 / $7.50)',
      },
      {
        feature: 'بینایی، OCR پیچیده و تحلیل PDF',
        openai: 'gpt-6.1-terra ($1.00 / $5.00)',
        google: 'gemini-4-neon ($3.00 / $15.00)',
      },
      {
        feature: 'استدلال مرزی، معماری و برنامه‌ریزی عمیق',
        openai: 'gpt-6.2-astra ($8.00 / $40.00)',
        google: 'gemini-4-carbon / argon ($2.00–$4.00)',
      },
      {
        feature: 'تولید بردار معنایی (RAG متنی و چندوجهی)',
        openai: 'text-embedding-3-small / large',
        google: 'gemini-embedding-2 / 001',
      },
    ],
    blocks: [
      {
        provider: 'openai',
        label: 'OpenAI Responses API',
        language: 'python',
        code: `for model in client.models.list():
    print(model.id)`,
      },
      {
        provider: 'google',
        label: 'Google Gen AI SDK',
        language: 'python',
        code: `for model in client.models.list():
    print(model.name)  # مثلاً: models/gemini-4-hydrogen`,
      },
    ],
  },
  {
    id: 'ch-6',
    number: 6,
    partId: 'part-2',
    titleFa: 'ارسال تصویر به مدل چندوجهی (Vision / OCR)',
    titleEn: 'Image Understanding, OCR & Chart Analysis',
    summary:
      'خواندن متن از صفحات اسکن‌شده، تحلیل نمودارها، استخراج جدول به فرمت Markdown یا پردازش اسکرین‌شات‌ها. در OpenAI مدل gpt-6.1-terra برای استدلال بصری بهینه شده است و در گوگل امکان ارسال مستقیم بایت خام (بدون سربار ۳۳ درصدی Base64) وجود دارد.',
    blocks: [
      {
        provider: 'openai',
        label: 'OpenAI Responses API',
        sublabel: 'بهینه‌شده برای بینایی با gpt-6.1-terra',
        language: 'python',
        code: `import base64

with open("page.png", "rb") as f:
    b64_image = base64.standard_b64encode(f.read()).decode("utf-8")

response = client.responses.create(
    model="gpt-6.1-terra",
    input=[
        {
            "role": "user",
            "content": [
                {
                    "type": "input_image",
                    "image_url": f"data:image/png;base64,{b64_image}",
                    "detail": "high",  # "low" | "high" | "auto"
                },
                {
                    "type": "input_text",
                    "text": "Transcribe all text and tables into Markdown.",
                },
            ],
        }
    ],
)
print(response.output_text)`,
      },
      {
        provider: 'google',
        label: 'Google Gen AI SDK',
        sublabel: 'بایت خام (بدون سربار Base64) با gemini-4-neon یا hydrogen',
        language: 'python',
        code: `# روش ۱: ارسال مستقیم بایت خام (سریع و بدون افزایش حجم Base64)
with open("page.png", "rb") as f:
    image_bytes = f.read()

response = client.models.generate_content(
    model="gemini-4-neon",
    contents=[
        types.Part.from_bytes(data=image_bytes, mime_type="image/png"),
        "Transcribe all text and tables into Markdown.",
    ],
)
print(response.text)

# روش ۲: ارسال مستقیم شیء PIL.Image
# from PIL import Image
# img = Image.open("page.png")
# resp = client.models.generate_content(
#     model="gemini-4-hydrogen", contents=[img, "Describe this chart."]
# )`,
      },
    ],
  },
  {
    id: 'ch-7',
    number: 7,
    partId: 'part-2',
    titleFa: 'ارسال مستقیم فایل PDF (بومی و فایل‌های حجیم)',
    titleEn: 'Native PDF Understanding & Large Files API',
    summary:
      'تحلیل کامل اسناد PDF شامل متن، جداول، نمودارها و صفحات اسکن‌شده بدون نیاز به تبدیل دستی صفحات به تصویر با ابزارهایی مانند pdf2image و poppler. برای فایل‌های بزرگ، هر دو پلتفرم Files API اختصاصی دارند.',
    isExpanded: true,
    notes: [
      'در OpenAI برای PDFهای سبک ارسال Base64 سریع است، اما برای فایل‌های حجیم یا اسنادی که چند بار تحلیل می‌شوند، ابتدا فایل را با client.files.create آپلود کنید و file_id را بفرستید.',
      'در Google Gen AI برای PDF زیر ۲۰ مگابایت از Part.from_bytes و برای اسناد ۲۰ تا ۵۰ مگابایت (تا ۱٬۰۰۰ صفحه) از client.files.upload استفاده کرده و در پایان با finally فایل را پاک کنید.',
    ],
    blocks: [
      {
        provider: 'openai',
        label: 'OpenAI Responses API',
        sublabel: 'روش ۱: Base64 سریع | روش ۲: Files API برای فایل‌های حجیم',
        language: 'python',
        code: `import base64

# روش ۱: ارسال مستقیم Base64 برای PDFهای سبک
with open("report.pdf", "rb") as f:
    b64_pdf = base64.standard_b64encode(f.read()).decode("utf-8")

response = client.responses.create(
    model="gpt-6.1-terra",
    input=[
        {
            "role": "user",
            "content": [
                {
                    "type": "input_file",
                    "filename": "report.pdf",
                    "file_data": f"data:application/pdf;base64,{b64_pdf}",
                },
                {
                    "type": "input_text",
                    "text": "Extract key tables from this PDF page by page.",
                },
            ],
        }
    ],
    max_output_tokens=4096,
)
print(response.output_text)

# روش ۲: آپلود یک‌باره با Files API (مناسب فایل‌های حجیم یا پرسش‌های متعدد)
with open("large_report.pdf", "rb") as f:
    uploaded = client.files.create(file=f, purpose="user_data")

try:
    resp_large = client.responses.create(
        model="gpt-6.2-sol",
        input=[
            {
                "role": "user",
                "content": [
                    {"type": "input_file", "file_id": uploaded.id},
                    {"type": "input_text", "text": "Summarize key findings."},
                ],
            }
        ],
    )
    print(resp_large.output_text)
finally:
    client.files.delete(uploaded.id)`,
      },
      {
        provider: 'google',
        label: 'Google Gen AI SDK',
        sublabel: 'روش ۱: زیر ۲۰ مگابایت (Inline) | روش ۲: Files API تا ۱٬۰۰۰ صفحه',
        language: 'python',
        code: `# روش ۱: PDF زیر ۲۰ مگابایت -> ارسال مستقیم بایت
with open("report.pdf", "rb") as f:
    pdf_bytes = f.read()

response = client.models.generate_content(
    model="gemini-4-hydrogen",
    contents=[
        types.Part.from_bytes(data=pdf_bytes, mime_type="application/pdf"),
        "Extract key tables from this PDF page by page.",
    ],
)
print(response.text)

# روش ۲: PDF حجیم (۲۰ تا ۵۰ مگابایت / تا ۱٬۰۰۰ صفحه) -> Files API
uploaded = client.files.upload(file="large_report.pdf")
try:
    resp_large = client.models.generate_content(
        model="gemini-4-neon",
        contents=[uploaded, "Summarize all key operational findings."],
    )
    print(resp_large.text)
finally:
    client.files.delete(name=uploaded.name)`,
      },
    ],
  },
  {
    id: 'ch-8',
    number: 8,
    partId: 'part-2',
    titleFa: 'پردازش صوت و ویدیو (Audio & Video Multimodal)',
    titleEn: 'Audio Transcription & Native Video Understanding',
    summary:
      'پیاده‌سازی رونویسی صوت (Speech-to-Text)، خلاصه‌سازی جلسات ضبط‌شده و تحلیل مستقیم ویدیو. Gemini به‌صورت بومی صدا و ویدیو را هم‌زمان در یک درخواست درک می‌کند، در حالی که در OpenAI برای رونویسی دقیق از Audio API در کنار Responses API استفاده می‌شود.',
    isNew: true,
    notes: [
      'در Google Gen AI پس از آپلود فایل ویدیویی با client.files.upload، ممکن است پردازش فایل چند ثانیه طول بکشد؛ پیش از فراخوانی مدل، وضعیت file.state.name == "ACTIVE" را بررسی کنید.',
      'در OpenAI مدل‌های قدیمی gpt-4o-transcribe و whisper-1 منسوخ شده‌اند (توقف فوریه ۲۰۲۷)؛ طبق مستندات رسمی، برای رونویسی فایل‌های ضبط‌شده از gpt-transcribe و برای جریان صوتی زنده (Realtime) از gpt-live-transcribe استفاده کنید.',
    ],
    blocks: [
      {
        provider: 'openai',
        label: 'OpenAI SDK (Audio + Responses)',
        sublabel: 'رونویسی دقیق صوت با gpt-transcribe و تحلیل جلسه',
        language: 'python',
        code: `# ۱) تبدیل صوت به متن با مدل رسمی جدید OpenAI (جایگزین gpt-4o-transcribe)
with open("meeting.mp3", "rb") as audio_file:
    transcript = client.audio.transcriptions.create(
        model="gpt-transcribe",
        file=audio_file,
    )

# ۲) ارسال متن رونویسی‌شده به Responses API برای خلاصه‌سازی
summary = client.responses.create(
    model="gpt-6.2-sol",
    instructions="Extract action items and decisions in Persian.",
    input=transcript.text,
)
print(summary.output_text)`,
      },
      {
        provider: 'google',
        label: 'Google Gen AI SDK',
        sublabel: 'درک بومی صوت و ویدیو با gemini-4-hydrogen / 3.8-flash',
        language: 'python',
        code: `import time

# مثال ۱: تحلیل مستقیم فایل صوتی (زیر ۲۰ مگابایت)
with open("meeting.mp3", "rb") as f:
    audio_bytes = f.read()

audio_resp = client.models.generate_content(
    model="gemini-3.8-flash",
    contents=[
        types.Part.from_bytes(data=audio_bytes, mime_type="audio/mp3"),
        "جلسه را خلاصه کن و کارهای محول‌شده را با زمان (Timestamp) فهرست کن.",
    ],
)
print(audio_resp.text)

# مثال ۲: آپلود و تحلیل مستقیم ویدیو با Files API
video_file = client.files.upload(file="demo.mp4")
try:
    while video_file.state.name == "PROCESSING":
        time.sleep(3)
        video_file = client.files.get(name=video_file.name)

    video_resp = client.models.generate_content(
        model="gemini-4-hydrogen",
        contents=[video_file, "مراحل کلیدی نمایش‌داده‌شده در این ویدیو چیست؟"],
    )
    print(video_resp.text)
finally:
    client.files.delete(name=video_file.name)`,
      },
    ],
  },
  {
    id: 'ch-9',
    number: 9,
    partId: 'part-2',
    titleFa: 'خروجی ساختاریافته JSON با Pydantic و بررسی امتناع مدل',
    titleEn: 'Structured Outputs (Pydantic) & Refusal Checks',
    summary:
      'الزام مدل به تولید خروجی ۱۰۰٪ منطبق با یک اسکیمای مشخص پایتون؛ ایده‌آل برای استخراج فاکتور، فرم، داده‌های حقوقی و ذخیره مستقیم در دیتابیس بدون خطای پارس کردن JSON.',
    isExpanded: true,
    notes: [
      'در OpenAI با متد responses.parse، اگر مدل به دلیل سیاست ایمنی از پاسخ خودداری کند، خروجی در فیلد refusal ثبت می‌شود و output_parsed برابر None خواهد بود.',
      'در Gemini پس از دریافت پاسخ، مطمئن شوید response.parsed مقدار None ندارد (مثلاً در صورت قطع شدن پاسخ یا فیلتر ایمنی).',
    ],
    blocks: [
      {
        provider: 'shared',
        label: 'اسکیمای مشترک Pydantic',
        sublabel: 'قابل استفاده در هر دو SDK بدون تغییر',
        language: 'python',
        code: `from pydantic import BaseModel, Field

class Invoice(BaseModel):
    invoice_id: str = Field(description="شماره یکتای فاکتور")
    vendor_name: str = Field(description="نام فروشنده یا شرکت")
    total_amount: float = Field(description="مبلغ کل به عدد")
    items: list[str] = Field(description="فهرست اقلام فاکتور")`,
      },
      {
        provider: 'openai',
        label: 'OpenAI Responses API',
        sublabel: 'Structured Output با بررسی refusal',
        language: 'python',
        code: `response = client.responses.parse(
    model="gpt-6.2-sol",
    input=(
        "Invoice INV-402 from ParsData Corp for $1250.50 "
        "covering Server and License."
    ),
    text_format=Invoice,
)

invoice: Invoice | None = response.output_parsed
if invoice is None:
    raise RuntimeError(f"Parsing failed or refused: {response.status}")

print(invoice.invoice_id, invoice.total_amount)`,
      },
      {
        provider: 'google',
        label: 'Google Gen AI SDK',
        sublabel: 'Structured Output با response_schema',
        language: 'python',
        code: `response = client.models.generate_content(
    model="gemini-4-hydrogen",
    contents=(
        "Invoice INV-402 from ParsData Corp for $1250.50 "
        "covering Server and License."
    ),
    config=types.GenerateContentConfig(
        response_mime_type="application/json",
        response_schema=Invoice,
    ),
)

invoice: Invoice | None = response.parsed
if invoice is None:
    reason = response.candidates[0].finish_reason
    raise RuntimeError(f"Structured output unavailable: {reason}")

print(invoice.invoice_id, invoice.total_amount)`,
      },
    ],
  },
];
