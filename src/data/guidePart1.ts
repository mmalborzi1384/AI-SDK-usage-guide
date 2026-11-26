import { AuditChange, Chapter, GuidePart, QuickRefRow } from '../types/guide';

export const GUIDE_PARTS: GuidePart[] = [
  {
    id: 'part-1',
    number: 'بخش اول',
    titleFa: 'شروع سریع، پیکربندی و کنترل توکن‌ها',
    subtitle: 'نصب، احراز هویت امن، پرامپت پایه، نقش سیستم، شمارش توکن و انتخاب مدل',
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
    subtitle: 'حافظه چت سمت سرور و کلاینت، استریم با Context Manager و کنترل تفکر داخلی',
  },
  {
    id: 'part-4',
    number: 'بخش چهارم',
    titleFa: 'ابزارها، جستجوی زنده، ایجنت‌ها و بردارها',
    subtitle: 'جستجوی وب با استناد، اجرای کد و URL، چرخه کامل Function Calling و Embeddings',
  },
  {
    id: 'part-5',
    number: 'بخش پنجم',
    titleFa: 'مقیاس‌پذیری، بهینه‌سازی هزینه و محیط عملیاتی',
    subtitle: 'اجرای ناهمزمان کنترل‌شده، کش کانتکست، Batch API، ایمنی، Retry و چک‌لیست نهایی',
  },
];

export const AUDIT_CHANGES: AuditChange[] = [
  {
    category: 'اصلاح نگارشی و صفحه‌آرایی',
    title: 'رفع کامل باگ‌های چاپی، دوجهته (RTL/LTR) و شماره‌گذاری صفحات',
    detail:
      'حذف ستاره‌های خام مارک‌داون (**...**) در صفحات ۱، ۱۳، ۱۴ و ۱۵؛ اصلاح شماره صفحات معکوس (۴۱ و ۵۱ در فایل اصلی)؛ رفع هم‌پوشانی متن جدول مرجع سریع؛ ایزوله‌سازی کدهای انگلیسی برای جلوگیری از برعکس شدن پرانتزها و جلوگیری از شکسته شدن بلوک‌های کد میان صفحات.',
  },
  {
    category: 'تکمیل حفره فنی',
    title: 'تکمیل چرخه کامل Function Calling (رفت‌وبرگشت)',
    detail:
      'در نسخه قبلی، مثال OpenAI فقط درخواست تابع را چاپ می‌کرد. اکنون اجرای محلی تابع و بازگرداندن خروجی با function_call_output و call_id، و در Gemini تفاوت حالت خودکار با حالت دستی (disable=True + Part.from_function_response) اضافه شده است.',
  },
  {
    category: 'تکمیل حفره فنی',
    title: 'استخراج منابع جستجوی وب (Citations) و خلاصه افکار (Thought Summary)',
    detail:
      'نحوه استخراج لینک‌ها و عناوین منابع از annotations در OpenAI و grounding_metadata.grounding_chunks در Gemini، همچنین مشاهده خلاصه تفکر (include_thoughts و reasoning summary) و توکن‌های تفکر اضافه شد.',
  },
  {
    category: 'تکمیل حفره فنی',
    title: 'آپلود PDF حجیم در OpenAI، استریم با Context Manager و Async Semaphore',
    detail:
      'روش client.files.create + file_id برای PDFهای بزرگ در OpenAI، استفاده از with client.responses.stream() همراه با get_final_response()، شمارش توکن پیش از ارسال (count_tokens) و مدیریت همزمانی با asyncio.Semaphore اضافه شد.',
  },
  {
    category: 'فصل جدید افزوده‌شده',
    title: '۴ فصل ضروری جدید: صوت و ویدیو، اجرای کد/URL، Embeddings و ایمنی/حریم خصوصی',
    detail:
      'بر اساس مستندات رسمی OpenAI Responses API و Google Gen AI SDK، فصل‌های پردازش صوت و ویدیو، ابزارهای Code Interpreter / Code Execution / URL Context، تولید Embeddings برای RAG و تنظیمات Safety و store=False اضافه شدند.',
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
    googleCode: 'client.models.generate_content(...)',
  },
  {
    operation: 'دسترسی به متن خروجی',
    chapterId: 'ch-2',
    chapterNumber: 2,
    openaiCode: 'response.output_text',
    googleCode: 'response.text',
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
    operation: 'لیست مدل‌های در دسترس',
    chapterId: 'ch-5',
    chapterNumber: 5,
    openaiCode: 'client.models.list()  # m.id',
    googleCode: 'client.models.list()  # m.name',
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
    openaiCode: 'client.audio.transcriptions.create(...)\nیا input_audio در مدل‌های صوتی',
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
    operation: 'مکالمه چندمرحله‌ای (Chat)',
    chapterId: 'ch-10',
    chapterNumber: 10,
    openaiCode: 'previous_response_id=resp1.id',
    openaiNote: 'مدیریت وضعیت سمت سرور (یا ارسال دستی با store=False)',
    googleCode: 'chat = client.chats.create(...)\nchat.send_message(...)',
    googleNote: 'مدیریت تاریخچه سمت کلاینت',
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
    googleCode: 'thinking_config=types.ThinkingConfig(\n  thinking_budget=2048,\n  include_thoughts=True\n)',
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
    operation: 'اجرای کد و خواندن لینک (URL)',
    chapterId: 'ch-14',
    chapterNumber: 14,
    openaiCode: 'tools=[{"type": "code_interpreter", "container": {"type": "auto"}}]',
    googleCode: 'Tool(code_execution=ToolCodeExecution())\nTool(url_context=UrlContext())',
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
    googleCode: 'client.models.embed_content(model="gemini-embedding-001", ...)',
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
    openaiCode: 'خودکار (حداقل ۱۰۲۴ توکن) + prompt_cache_key',
    googleCode: 'کش ضمنی خودکار + کش صریح با\nclient.caches.create(..., ttl="3600s")',
  },
  {
    operation: 'پردازش انبوه (۵۰٪ تخفیف) و خطای 429',
    chapterId: 'ch-19',
    chapterNumber: 19,
    openaiCode: 'client.batches.create(endpoint="/v1/responses")\nRateLimitError + max_retries',
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
      'نصب آخرین نسخه کتابخانه‌های رسمی و اتصال امن به سرور بدون نوشتن مستقیم کلید API در فایل‌های کد. همیشه کلیدها را از طریق متغیرهای محیطی سیستم یا فایل env. مدیریت کنید.',
    notes: [
      'برای گوگل حتماً از بسته جدید google-genai استفاده کنید؛ بسته قدیمی google-generativeai منسوخ شده است.',
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
      'ارسال یک سؤال یا دستور متنی ساده و دریافت پاسخ مستقیم مدل. در OpenAI از متد مدرن responses.create (جایگزین جدید Chat Completions) و در گوگل از models.generate_content استفاده می‌شود.',
    blocks: [
      {
        provider: 'openai',
        label: 'OpenAI Responses API',
        language: 'python',
        code: `response = client.responses.create(
    model="gpt-4.1-mini",
    input="تفاوت API و SDK را در دو جمله توضیح بده.",
)
print(response.output_text)`,
      },
      {
        provider: 'google',
        label: 'Google Gen AI SDK',
        language: 'python',
        code: `response = client.models.generate_content(
    model="gemini-2.5-flash",
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
      'در مدل‌های استدلالی (مانند o4-mini یا سری Gemini 2.5 با تفکر فعال)، ممکن است پارامتر temperature نادیده گرفته شود یا سقف max_output_tokens شامل توکن‌های تفکر داخلی نیز باشد.',
    ],
    blocks: [
      {
        provider: 'openai',
        label: 'OpenAI Responses API',
        language: 'python',
        code: `response = client.responses.create(
    model="gpt-4.1-mini",
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
    model="gemini-2.5-flash",
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
      'در Gemini 2.5، بودجه توکن‌های تفکر داخلی (thinking_budget) از همان سقف max_output_tokens کسر می‌شود؛ برای خروجی‌های بسیار کوتاه، thinking_budget=0 بگذارید.',
      'در گوگل می‌توانید پیش از ارسال درخواست با client.models.count_tokens هزینه ورودی (حتی PDF و تصویر) را دقیق محاسبه کنید. در OpenAI معمولاً از کتابخانه محلی tiktoken برای تخمین پیش از ارسال استفاده می‌شود.',
    ],
    blocks: [
      {
        provider: 'openai',
        label: 'OpenAI Responses API',
        sublabel: 'بررسی قطع‌شدگی + تفکیک کامل توکن‌ها',
        language: 'python',
        code: `response = client.responses.create(
    model="gpt-4.1-mini",
    input="Write a 5-paragraph history of OCR systems.",
    max_output_tokens=25,
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
count = client.models.count_tokens(model="gemini-2.5-flash", contents=prompt)
print("Estimated input tokens:", count.total_tokens)

# ۲) ارسال درخواست و بررسی کامل بودن خروجی
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=prompt,
    config=types.GenerateContentConfig(
        max_output_tokens=25,
        # خاموش کردن تفکر داخلی تا کل ۲۵ توکن به متن قابل‌مشاهده اختصاص یابد
        thinking_config=types.ThinkingConfig(thinking_budget=0),
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
    titleFa: 'لیست کردن مدل‌های در دسترس و راهنمای انتخاب مدل',
    titleEn: 'Listing Available Models & Model Selection Guide',
    summary:
      'مشاهده شناسه دقیق مدل‌های فعال روی کلید API شما برای پیشگیری از خطای 404 Model Not Found و انتخاب سریع مدل متناسب با تعادل سرعت، هزینه و دقت استدلال.',
    isExpanded: true,
    miniTable: [
      {
        feature: 'سریع و کم‌هزینه (روزمره، استخراج، چت)',
        openai: 'gpt-4.1-mini / gpt-4o-mini',
        google: 'gemini-2.5-flash / gemini-2.5-flash-lite',
      },
      {
        feature: 'دقت بالا و چندوجهی پیچیده (PDF/تصویر)',
        openai: 'gpt-4.1 / gpt-4o',
        google: 'gemini-2.5-pro',
      },
      {
        feature: 'استدلال عمیق (ریاضی، الگوریتم، معماری)',
        openai: 'o3 / o4-mini (با پارامتر reasoning)',
        google: 'gemini-2.5-pro / flash (با thinking_budget)',
      },
      {
        feature: 'تولید بردار معنایی (RAG / Search)',
        openai: 'text-embedding-3-small / large',
        google: 'gemini-embedding-001',
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
    print(model.name)  # مثلاً: models/gemini-2.5-flash`,
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
      'خواندن متن از صفحات اسکن‌شده، تحلیل نمودارها، استخراج جدول به فرمت Markdown یا پردازش اسکرین‌شات‌ها. در گوگل امکان ارسال مستقیم بایت خام (بدون سربار ۳۳ درصدی Base64) یا شیء PIL.Image نیز وجود دارد.',
    blocks: [
      {
        provider: 'openai',
        label: 'OpenAI Responses API',
        sublabel: 'ارسال Base64 (یا لینک مستقیم HTTPS / file_id)',
        language: 'python',
        code: `import base64

with open("page.png", "rb") as f:
    b64_image = base64.standard_b64encode(f.read()).decode("utf-8")

response = client.responses.create(
    model="gpt-4.1",
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
        sublabel: 'بایت خام (بدون سربار Base64) یا شیء PIL.Image',
        language: 'python',
        code: `# روش ۱: ارسال مستقیم بایت خام (سریع و بدون افزایش حجم Base64)
with open("page.png", "rb") as f:
    image_bytes = f.read()

response = client.models.generate_content(
    model="gemini-2.5-pro",
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
#     model="gemini-2.5-pro", contents=[img, "Describe this chart."]
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
      'در OpenAI برای PDFهای کوچک ارسال Base64 سریع است، اما برای فایل‌های حجیم یا اسنادی که چند بار تحلیل می‌شوند، ابتدا فایل را با client.files.create آپلود کنید و file_id را بفرستید.',
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
    model="gpt-4.1",
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
        model="gpt-4.1",
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
    model="gemini-2.5-pro",
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
        model="gemini-2.5-pro",
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
      'در OpenAI برای رونویسی دقیق جلسات فارسی و انگلیسی، مدل‌های gpt-4o-transcribe یا gpt-4o-mini-transcribe بهترین دقت را ارائه می‌دهند و متن خروجی را می‌توان به Responses API سپرد.',
    ],
    blocks: [
      {
        provider: 'openai',
        label: 'OpenAI SDK (Audio + Responses)',
        sublabel: 'رونویسی دقیق صوت و تحلیل ساختاریافته جلسه',
        language: 'python',
        code: `# ۱) تبدیل صوت به متن با مدل‌های رونویسی مدرن OpenAI
with open("meeting.mp3", "rb") as audio_file:
    transcript = client.audio.transcriptions.create(
        model="gpt-4o-mini-transcribe",
        file=audio_file,
    )

# ۲) ارسال متن رونویسی‌شده به Responses API برای خلاصه‌سازی
summary = client.responses.create(
    model="gpt-4.1-mini",
    instructions="Extract action items and decisions in Persian.",
    input=transcript.text,
)
print(summary.output_text)`,
      },
      {
        provider: 'google',
        label: 'Google Gen AI SDK',
        sublabel: 'درک بومی صوت و ویدیو بدون نیاز به ابزار جداگانه',
        language: 'python',
        code: `import time

# مثال ۱: تحلیل مستقیم فایل صوتی (زیر ۲۰ مگابایت)
with open("meeting.mp3", "rb") as f:
    audio_bytes = f.read()

audio_resp = client.models.generate_content(
    model="gemini-2.5-flash",
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
        model="gemini-2.5-flash",
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
    model="gpt-4.1-mini",
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
    model="gemini-2.5-flash",
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
