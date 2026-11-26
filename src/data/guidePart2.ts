import { Chapter, GoldenTip } from '../types/guide';

export const CHAPTERS_PART_2: Chapter[] = [
  {
    id: 'ch-10',
    number: 10,
    partId: 'part-3',
    titleFa: 'مکالمه چندمرحله‌ای، Interactions API و حفظ حافظه چت',
    titleEn: 'Multi-turn Chat, Interactions API & Multi-Model Handoff',
    summary:
      'ساخت چت‌بات یا مکالمه چندنوبتی با حفظ تاریخچه. هر دو پلتفرم در نسخه ۲۰۲۶ از حفظ وضعیت سمت سرور پشتیبانی می‌کنند: OpenAI با previous_response_id و Google با Interactions API جدید (previous_interaction_id) که حتی امکان جابه‌جایی بین مدل‌ها در طول یک مکالمه را می‌دهد.',
    isExpanded: true,
    notes: [
      'در OpenAI برای حفظ حریم خصوصی (عدم ذخیره روی سرور) از store=False همراه با ارسال دستی آرایه پیام‌ها استفاده کنید. همچنین برای حفظ کش استدلال، پیشوند مکالمه را تغییر ندهید.',
      'در Google Gen AI، Interactions API اجازه می‌دهد نوبت اول (طراحی معماری) را با gemini-4-carbon انجام دهید و نوبت دوم (پیاده‌سازی سریع کد) را با همان previous_interaction_id به gemini-4-hydrogen بسپارید.',
    ],
    blocks: [
      {
        provider: 'openai',
        label: 'OpenAI Responses API',
        sublabel: 'حفظ حافظه سمت سرور (یا حالت دستی با store=False)',
        language: 'python',
        code: `# روش ۱: مدیریت وضعیت سمت سرور با previous_response_id
resp1 = client.responses.create(
    model="gpt-6.2-sol",
    input="Hi, my name is Mohammadmahdi and I code in Python.",
)

resp2 = client.responses.create(
    model="gpt-6.2-sol",
    previous_response_id=resp1.id,
    input="What is my name and primary language?",
)
print(resp2.output_text)

# روش ۲: حالت بدون ذخیره سمت سرور (Stateless / Privacy-first)
history = [
    {"role": "user", "content": "My name is Mohammadmahdi."},
    {"role": "assistant", "content": "Nice to meet you, Mohammadmahdi!"},
    {"role": "user", "content": "What is my name?"},
]
stateless = client.responses.create(
    model="gpt-6-luna",
    input=history,
    store=False,
)
print(stateless.output_text)`,
      },
      {
        provider: 'google',
        label: 'Google Gen AI SDK',
        sublabel: 'Interactions API سمت سرور (با جابه‌جایی مدل) + چت سمت کلاینت',
        language: 'python',
        code: `# روش ۱ (مدرن ۲۰۲۶): Interactions API با وضعیت سمت سرور و جابه‌جایی مدل
plan = client.interactions.create(
    model="gemini-4-carbon",
    input="Design a thread-safe rate limiter in Python.",
)

impl = client.interactions.create(
    model="gemini-4-hydrogen",
    previous_interaction_id=plan.id,
    input="Now write the clean Python code and pytest suite for your design.",
)
print(impl.output_text)

# روش ۲: جلسه چت کلاسیک سمت کلاینت + استخراج تاریخچه برای دیتابیس
chat = client.chats.create(model="gemini-4-hydrogen")
chat.send_message("Hi, my name is Mohammadmahdi and I code in Python.")
resp2 = chat.send_message("What is my name and primary language?")
print(resp2.text)
print("Turns stored:", len(chat.get_history()))`,
      },
    ],
  },
  {
    id: 'ch-11',
    number: 11,
    partId: 'part-3',
    titleFa: 'پاسخ‌دهی جریانی / لحظه‌ای (Streaming)',
    titleEn: 'Real-Time Token Streaming & Final Response Capture',
    summary:
      'نمایش کلمه‌به‌کلمه پاسخ به کاربر به محض تولید توکن‌ها برای کاهش چشمگیر زمان انتظار درک‌شده (Time-to-First-Token). در OpenAI استفاده از Context Manager مدرن responses.stream علاوه بر استریم متن و خلاصه تفکر، دسترسی به آبجکت نهایی (شامل آمار توکن) را نیز فراهم می‌کند.',
    isExpanded: true,
    blocks: [
      {
        provider: 'openai',
        label: 'OpenAI Responses API',
        sublabel: 'Context Manager مدرن + دریافت پاسخ نهایی',
        language: 'python',
        code: `with client.responses.stream(
    model="gpt-6.2-sol",
    input="Write a 3-paragraph overview of modern attention architectures.",
) as stream:
    for event in stream:
        if event.type == "response.output_text.delta":
            print(event.delta, end="", flush=True)
        elif event.type == "response.reasoning_summary_text.delta":
            # در صورت فعال بودن summary، خلاصه تفکر لحظه‌ای اینجا می‌آید
            pass

    final = stream.get_final_response()
    print(f"\\n\\n[Tokens used: {final.usage.total_tokens}]")`,
      },
      {
        provider: 'google',
        label: 'Google Gen AI SDK',
        sublabel: 'استریم تکه به تکه + آمار توکن در آخرین چانک',
        language: 'python',
        code: `stream = client.models.generate_content_stream(
    model="gemini-4-hydrogen",
    contents="Write a 3-paragraph overview of modern attention architectures.",
)

last_chunk = None
for chunk in stream:
    if chunk.text:
        print(chunk.text, end="", flush=True)
    last_chunk = chunk

if last_chunk and last_chunk.usage_metadata:
    print(f"\\n\\n[Tokens used: {last_chunk.usage_metadata.total_token_count}]")`,
      },
    ],
  },
  {
    id: 'ch-12',
    number: 12,
    partId: 'part-3',
    titleFa: 'کنترل میزان استدلال داخلی (Reasoning / thinking_level) و خلاصه افکار',
    titleEn: 'Reasoning Effort, Thinking Levels & Thought Summaries',
    summary:
      'موازنه دقیق بین سرعت/هزینه و عمق استدلال؛ استفاده از سطوح پایین در کارهای روزمره و افزایش آن تا high یا xhigh در مسائل پیچیده ریاضی، معماری و کدنویسی، همراه با مشاهده خلاصه زنجیره تفکر مدل.',
    isExpanded: true,
    notes: [
      'در نسل جدید Gemini 4 به جای تعیین دستی تعداد توکن، از پارامتر استاندارد thinking_level با مقادیر "low"، "medium"، "high" و "xhigh" استفاده می‌شود (برای مدل‌های قدیمی‌تر Gemini 2.5 همچنان thinking_budget کاربرد دارد).',
      'در OpenAI برای مدل‌های استدلالی مانند gpt-6.2-astra با reasoning={"effort": "medium", "summary": "auto"} عمق استدلال و دریافت خلاصه قابل‌خواندن کنترل می‌شود.',
    ],
    blocks: [
      {
        provider: 'openai',
        label: 'OpenAI Responses API',
        sublabel: 'تنظیم effort + دریافت خلاصه استدلال در gpt-6.2-astra',
        language: 'python',
        code: `response = client.responses.create(
    model="gpt-6.2-astra",
    input="Prove the time complexity of Dijkstra's algorithm with a binary heap.",
    reasoning={
        "effort": "medium",   # "low" | "medium" | "high"
        "summary": "auto",    # درخواست خلاصه قابل‌خواندن از زنجیره تفکر
    },
)

for item in response.output:
    if item.type == "reasoning" and item.summary:
        print("[Reasoning Summary]:", item.summary[0].text)

print("\\n[Final Answer]:\\n", response.output_text)`,
      },
      {
        provider: 'google',
        label: 'Google Gen AI SDK',
        sublabel: 'پارامتر مدرن thinking_level + جداسازی افکار از پاسخ نهایی',
        language: 'python',
        code: `response = client.models.generate_content(
    model="gemini-4-carbon",
    contents="Prove the time complexity of Dijkstra's algorithm with a binary heap.",
    config=types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(
            thinking_level="high",  # "low" | "medium" | "high" | "xhigh"
            include_thoughts=True,
        ),
    ),
)

for part in response.candidates[0].content.parts:
    if getattr(part, "thought", False):
        print("[Thought Summary]:\\n", part.text)
    else:
        print("\\n[Final Answer]:\\n", part.text)`,
      },
    ],
  },
  {
    id: 'ch-13',
    number: 13,
    partId: 'part-4',
    titleFa: 'ابزار داخلی جستجوی وب و استخراج منابع (Citations)',
    titleEn: 'Built-in Web Search & Grounding Citations',
    summary:
      'اتصال مستقیم مدل به جستجوی زنده وب برای دریافت اطلاعات به‌روز بدون نیاز به نوشتن خزنده (Crawler) یا خرید API جستجوی جداگانه، همراه با استخراج لینک منابع برای راستی‌آزمایی و نمایش به کاربر.',
    isExpanded: true,
    blocks: [
      {
        provider: 'openai',
        label: 'OpenAI Responses API',
        sublabel: 'جستجوی وب + استخراج لینک‌های استناد (annotations)',
        language: 'python',
        code: `response = client.responses.create(
    model="gpt-6.2-sol",
    tools=[{"type": "web_search"}],
    input="What is the latest stable release of Python?",
)
print(response.output_text)

# استخراج منابع و لینک‌های استفاده‌شده در پاسخ
print("\\n--- Sources ---")
for item in response.output:
    if item.type == "message":
        for block in item.content:
            for ann in getattr(block, "annotations", []):
                if ann.type == "url_citation":
                    print(f"- {ann.title}: {ann.url}")`,
      },
      {
        provider: 'google',
        label: 'Google Gen AI SDK',
        sublabel: 'Google Search Grounding + استخراج منابع و کوئری‌ها',
        language: 'python',
        code: `response = client.models.generate_content(
    model="gemini-4-hydrogen",
    contents="What is the latest stable release of Python?",
    config=types.GenerateContentConfig(
        tools=[types.Tool(google_search=types.GoogleSearch())],
    ),
)
print(response.text)

# استخراج کوئری‌های جستجو و لینک منابع (Grounding Metadata)
meta = response.candidates[0].grounding_metadata
if meta:
    print("\\nQueries:", meta.web_search_queries)
    for chunk in meta.grounding_chunks or []:
        if chunk.web:
            print(f"- {chunk.web.title}: {chunk.web.uri}")`,
      },
    ],
  },
  {
    id: 'ch-14',
    number: 14,
    partId: 'part-4',
    titleFa: 'ابزارهای داخلی پیشرفته: File Search، اجرای کد، URL Context و MCP',
    titleEn: 'Built-in File Search (RAG), Code Execution, URL Context & Remote MCP',
    summary:
      'استفاده از ابزارهای آماده سمت سرور برای RAG مدیریت‌شده روی اسناد (File Search)، اجرای کد در سندباکس امن پایتون، خواندن مستقیم لینک‌ها (URL Context در Gemini) و اتصال مستقیم به سرورهای Remote MCP (در OpenAI Responses API).',
    isNew: true,
    notes: [
      'ابزار file_search در هر دو سرویس (Vector Stores در OpenAI و File Search Stores با gemini-embedding-2 در گوگل) نیاز به پیاده‌سازی دستی Chunking و دیتابیس برداری را در بسیاری از پروژه‌ها حذف می‌کند.',
      'در OpenAI Responses API با نوع ابزار "mcp" می‌توانید مدل را مستقیم به سرورهای Model Context Protocol داخلی یا ابری (مثل GitHub، Sentry یا ابزارهای سازمانی) متصل کنید.',
    ],
    blocks: [
      {
        provider: 'openai',
        label: 'OpenAI Responses API',
        sublabel: 'File Search (RAG) + Code Interpreter + اتصال مستقیم Remote MCP',
        language: 'python',
        code: `# ۱) جستجو در پایگاه دانش (File Search) + اجرای کد پایتون
rag_resp = client.responses.create(
    model="gpt-6.2-sol",
    tools=[
        {"type": "file_search", "vector_store_ids": ["vs_abc123"]},
        {"type": "code_interpreter", "container": {"type": "auto"}},
    ],
    input="Extract Q3 revenue from our report and compute YoY growth in Python.",
)
print(rag_resp.output_text)

# ۲) اتصال مستقیم به سرور Remote MCP بدون نوشتن Wrapper دستی
mcp_resp = client.responses.create(
    model="gpt-6.2-sol",
    tools=[
        {
            "type": "mcp",
            "server_label": "internal-docs-mcp",
            "server_url": "https://mcp.example.com/endpoint",
            "authorization": "Bearer mcp_token_abc123",
        }
    ],
    input="Fetch the latest error logs from Sentry and summarize root causes.",
)
print(mcp_resp.output_text)`,
      },
      {
        provider: 'google',
        label: 'Google Gen AI SDK',
        sublabel: 'File Search Store + سندباکس اجرای کد + خواندن لینک (URL Context)',
        language: 'python',
        code: `# ۱) RAG مدیریت‌شده با File Search Store و gemini-embedding-2
store = client.file_search_stores.create(
    config={
        "display_name": "my-docs-store",
        "embedding_model": "models/gemini-embedding-2",
    }
)
doc = client.files.upload(file="report.pdf")
client.file_search_stores.import_file(
    file_search_store_name=store.name, file_name=doc.name
)

rag_resp = client.interactions.create(
    model="gemini-3.8-flash",
    input="What were the Q3 revenue metrics?",
    tools=[{"type": "file_search", "file_search_store_names": [store.name]}],
)
print(rag_resp.output_text)

# ۲) اجرای کد پایتون + خواندن مستقیم لینک با URL Context
resp = client.models.generate_content(
    model="gemini-4-hydrogen",
    contents="نکات کلیدی این صفحه را تحلیل کن: https://docs.python.org/3/whatsnew/",
    config=types.GenerateContentConfig(
        tools=[
            types.Tool(url_context=types.UrlContext()),
            types.Tool(code_execution=types.ToolCodeExecution()),
        ],
    ),
)
print(resp.text)`,
      },
    ],
  },
  {
    id: 'ch-15',
    number: 15,
    partId: 'part-4',
    titleFa: 'فراخوانی توابع سفارشی — چرخه کامل (Function Calling)',
    titleEn: 'Custom Function Calling (Complete Round-Trip Loop)',
    summary:
      'اتصال مدل به توابع پایتون، پایگاه‌داده یا سرویس‌های داخلی سازمان برای ساخت ایجنت‌های هوشمند. شامل هر دو مرحله کلیدی: دریافت درخواست فراخوانی از مدل، اجرای تابع محلی و بازگرداندن خروجی تابع به مدل برای تولید پاسخ نهایی.',
    isExpanded: true,
    notes: [
      'در OpenAI Responses API باید خروجی تابع را به‌صورت آیتم function_call_output همراه با call_id دقیقاً منطبق با درخواست مدل برگردانید (با previous_response_id یا همراه با response.output شامل آیتم‌های reasoning).',
      'در Google Gen AI، ارسال مستقیم تابع پایتون باعث اجرای خودکار (Automatic Function Calling) می‌شود؛ اما در سیستم‌های حساس (مثل پرداخت یا حذف داده) می‌توانید با disable=True کنترل کامل تأیید و اجرا را به دست بگیرید.',
    ],
    blocks: [
      {
        provider: 'openai',
        label: 'OpenAI Responses API',
        sublabel: 'چرخه کامل: تعریف ابزار + اجرا + بازگرداندن function_call_output',
        language: 'python',
        code: `import json

def get_weather(city: str) -> str:
    return json.dumps({"city": city, "temp_c": 22, "condition": "Sunny"})

tools = [
    {
        "type": "function",
        "name": "get_weather",
        "description": "Return current temperature in Celsius for a city.",
        "strict": True,
        "parameters": {
            "type": "object",
            "properties": {"city": {"type": "string"}},
            "required": ["city"],
            "additionalProperties": False,
        },
    }
]

# گام ۱: مدل تصمیم می‌گیرد کدام تابع را با چه ورودی صدا بزند
resp1 = client.responses.create(
    model="gpt-6.2-sol",
    input="What is the weather in Tehran right now?",
    tools=tools,
)

# گام ۲: اجرای محلی تابع و ساخت لیست function_call_output
tool_outputs = []
for item in resp1.output:
    if item.type == "function_call" and item.name == "get_weather":
        args = json.loads(item.arguments)
        result = get_weather(**args)
        tool_outputs.append(
            {
                "type": "function_call_output",
                "call_id": item.call_id,
                "output": result,
            }
        )

# گام ۳: ارسال نتیجه تابع به مدل برای تولید پاسخ نهایی به کاربر
resp2 = client.responses.create(
    model="gpt-6.2-sol",
    previous_response_id=resp1.id,
    input=tool_outputs,
    tools=tools,
)
print(resp2.output_text)`,
      },
      {
        provider: 'google',
        label: 'Google Gen AI SDK',
        sublabel: 'روش خودکار (پیش‌فرض) + روش دستی برای عملیات حساس',
        language: 'python',
        code: `def get_weather(city: str) -> str:
    """Return current temperature in Celsius for a given city."""
    return f"Current weather in {city}: 22C and sunny."

# روش ۱: حالت خودکار (SDK اسکیما را می‌سازد، تابع را اجرا و پاسخ نهایی را برمی‌گرداند)
auto_resp = client.models.generate_content(
    model="gemini-4-hydrogen",
    contents="What is the weather in Tehran right now?",
    config=types.GenerateContentConfig(tools=[get_weather]),
)
print(auto_resp.text)

# روش ۲: حالت دستی (برای تأیید کاربر یا لاگ امنیتی پیش از اجرا)
manual_1 = client.models.generate_content(
    model="gemini-4-hydrogen",
    contents="What is the weather in Tehran right now?",
    config=types.GenerateContentConfig(
        tools=[get_weather],
        automatic_function_calling=types.AutomaticFunctionCallingConfig(
            disable=True
        ),
    ),
)

if manual_1.function_calls:
    call = manual_1.function_calls[0]
    result = get_weather(**call.args)
    fn_part = types.Part.from_function_response(
        name=call.name,
        response={"result": result},
    )
    manual_2 = client.models.generate_content(
        model="gemini-4-hydrogen",
        contents=[
            "What is the weather in Tehran right now?",
            manual_1.candidates[0].content,
            types.Content(role="user", parts=[fn_part]),
        ],
    )
    print(manual_2.text)`,
      },
    ],
  },
  {
    id: 'ch-16',
    number: 16,
    partId: 'part-4',
    titleFa: 'تولید بردارهای معنایی (Embeddings) برای RAG متنی و چندوجهی',
    titleEn: 'Vector Embeddings (Text & Multimodal) for RAG',
    summary:
      'تبدیل متن (و در gemini-embedding-2 حتی تصویر و اسناد چندوجهی) به بردارهای عددی برای ساخت سیستم‌های بازیابی اطلاعات (RAG)، جستجوی معنایی و خوشه‌بندی، با قابلیت کاهش ابعاد خروجی (Matryoshka Dimensions).',
    isNew: true,
    notes: [
      'در Google Gen AI، مدل جدید gemini-embedding-2 علاوه بر متن از بردارسازی چندوجهی نیز پشتیبانی می‌کند و تعیین task_type (مانند RETRIEVAL_DOCUMENT و RETRIEVAL_QUERY) دقت بازیابی را به‌طور محسوسی افزایش می‌دهد.',
    ],
    blocks: [
      {
        provider: 'openai',
        label: 'OpenAI Embeddings API',
        sublabel: 'تولید بردار با ابعاد سفارشی (text-embedding-3-small)',
        language: 'python',
        code: `resp = client.embeddings.create(
    model="text-embedding-3-small",
    input=[
        "راهنمای معماری سیستم‌های RAG",
        "بهینه‌سازی مصرف توکن در مدل‌های زبانی",
    ],
    dimensions=768,  # کاهش اختیاری ابعاد برای ذخیره سبک‌تر در Vector DB
)

vectors = [item.embedding for item in resp.data]
print("Count:", len(vectors), "| Dim:", len(vectors[0]))`,
      },
      {
        provider: 'google',
        label: 'Google Gen AI SDK',
        sublabel: 'تولید بردار با مدل جدید gemini-embedding-2 و task_type',
        language: 'python',
        code: `resp = client.models.embed_content(
    model="gemini-embedding-2",
    contents=[
        "راهنمای معماری سیستم‌های RAG",
        "بهینه‌سازی مصرف توکن در مدل‌های زبانی",
    ],
    config=types.EmbedContentConfig(
        task_type="RETRIEVAL_DOCUMENT",
        output_dimensionality=768,
    ),
)

vectors = [emb.values for emb in resp.embeddings]
print("Count:", len(vectors), "| Dim:", len(vectors[0]))`,
      },
    ],
  },
  {
    id: 'ch-17',
    number: 17,
    partId: 'part-5',
    titleFa: 'اجرای همزمان و غیرهمزمان با کنترل نرخ (Async & Semaphore)',
    titleEn: 'Async Concurrency with Rate-Limit Protection',
    summary:
      'ارسال موازی ده‌ها درخواست (مانند پردازش همزمان تمام صفحات یک سند طولانی) برای کاهش چشمگیر زمان کل اجرا، همراه با استفاده از asyncio.Semaphore برای جلوگیری از برخورد آنی با خطای 429.',
    isExpanded: true,
    blocks: [
      {
        provider: 'openai',
        label: 'OpenAI Responses API',
        sublabel: 'استفاده از AsyncOpenAI + Semaphore',
        language: 'python',
        code: `import asyncio
from openai import AsyncOpenAI

async_client = AsyncOpenAI()
sem = asyncio.Semaphore(5)  # حداکثر ۵ درخواست موازی همزمان

async def ask_openai(prompt: str) -> str:
    async with sem:
        resp = await async_client.responses.create(
            model="gpt-6-luna",
            input=prompt,
        )
        return resp.output_text

async def main():
    prompts = ["Capital of Japan?", "Capital of Canada?", "Capital of Iran?"]
    results = await asyncio.gather(*(ask_openai(p) for p in prompts))
    print(results)

# asyncio.run(main())`,
      },
      {
        provider: 'google',
        label: 'Google Gen AI SDK',
        sublabel: 'فضای نام .aio روی همان کلاینت + Semaphore',
        language: 'python',
        code: `import asyncio
from google import genai

client = genai.Client()  # بدون نیاز به ساخت کلاینت جداگانه
sem = asyncio.Semaphore(5)

async def ask_gemini(prompt: str) -> str:
    async with sem:
        resp = await client.aio.models.generate_content(
            model="gemini-3.8-flash",
            contents=prompt,
        )
        return resp.text

async def main():
    prompts = ["Capital of Japan?", "Capital of Canada?", "Capital of Iran?"]
    results = await asyncio.gather(*(ask_gemini(p) for p in prompts))
    print(results)

# asyncio.run(main())`,
      },
    ],
  },
  {
    id: 'ch-18',
    number: 18,
    partId: 'part-5',
    titleFa: 'کش کردن کانتکست (Context Caching & Extended Retention)',
    titleEn: 'Automatic Prefix Caching (Up to 12h) vs. Explicit Context Cache',
    summary:
      'کاهش تا ۹۵٪ هزینه توکن‌های ورودی و کاهش تأخیر زمانی هنگام ارسال مکرر اسناد حجیم. در OpenAI کش پیشوند خودکار است و با prompt_cache_key و prompt_cache_retention="12h" ماندگاری کش تا ۱۲ ساعت افزایش می‌یابد؛ در گوگل علاوه بر کش ضمنی، کش صریح با TTL مشخص وجود دارد.',
    isExpanded: true,
    blocks: [
      {
        provider: 'openai',
        label: 'OpenAI Responses API (Prefix Caching + 12h Retention)',
        sublabel: 'ثابت نگه داشتن پیشوند + prompt_cache_key + retention',
        language: 'python',
        code: `# دستورالعمل و سند حجیم ثابت را در ابتدای پرامپت قرار دهید (>= 1024 توکن)
large_context = open("company_handbook.txt", encoding="utf-8").read()

response = client.responses.create(
    model="gpt-6.2-sol",
    instructions=f"Answer strictly from this handbook:\\n\\n{large_context}",
    input="What is the remote work policy for engineers?",
    prompt_cache_key="handbook-v1",
    prompt_cache_retention="12h",  # "30m" (پیش‌فرض) یا "12h"
)

print(response.output_text)
print("Cached input tokens:", response.usage.input_tokens_details.cached_tokens)`,
      },
      {
        provider: 'google',
        label: 'Google Gen AI SDK (Explicit Context Cache)',
        sublabel: 'ساخت کش صریح با TTL تضمینی',
        language: 'python',
        code: `# ۱) آپلود یک‌باره فایل حجیم
doc = client.files.upload(file="company_handbook.pdf")

# ۲) ساخت کش صریح با اعتبار ۱ ساعته
cache = client.caches.create(
    model="gemini-4-hydrogen",
    config=types.CreateCachedContentConfig(
        display_name="handbook-cache-v1",
        system_instruction="Answer strictly based on the attached handbook.",
        contents=[doc],
        ttl="3600s",
    ),
)

# ۳) استفاده مکرر از کش با تخفیف چشمگیر در هزینه ورودی
response = client.models.generate_content(
    model="gemini-4-hydrogen",
    contents="What is the remote work policy for engineers?",
    config=types.GenerateContentConfig(cached_content=cache.name),
)
print(response.text)
print("Cached tokens:", response.usage_metadata.cached_content_token_count)

# ۴) پاک‌سازی اختیاری پس از اتمام کار (توقف هزینه نگهداری)
client.caches.delete(name=cache.name)`,
      },
    ],
  },
  {
    id: 'ch-19',
    number: 19,
    partId: 'part-5',
    titleFa: 'پردازش انبوه با ۵۰٪ تخفیف (Batch API) و حالت پس‌زمینه',
    titleEn: 'Batch Processing (50% Discount) & Background Mode',
    summary:
      'پردازش هزاران سند، فاکتور یا رکورد داده بدون نیاز به پاسخ آنی (تحویل تا ۲۴ ساعت) با ۵۰٪ تخفیف و سهمیه جداگانه. در OpenAI همچنین برای کارهای سنگین ایجنتی می‌توان از background=True با پنجره‌های تخفیف ۲ ساعته (۳۰٪) یا ۸ ساعته (۴۰٪) بهره برد.',
    isExpanded: true,
    blocks: [
      {
        provider: 'openai',
        label: 'OpenAI Responses API',
        sublabel: 'JSONL Batch Job (۵۰٪ تخفیف) + Background Options (۳۰٪ تا ۴۰٪ تخفیف)',
        language: 'python',
        code: `import json

# ۱) آماده‌سازی فایل JSONL با هدف /v1/responses
tasks = [
    {
        "custom_id": "doc-1",
        "method": "POST",
        "url": "/v1/responses",
        "body": {"model": "gpt-6-luna", "input": "Summarize report #1."},
    },
    {
        "custom_id": "doc-2",
        "method": "POST",
        "url": "/v1/responses",
        "body": {"model": "gpt-6-luna", "input": "Summarize report #2."},
    },
]
with open("batch_input.jsonl", "w", encoding="utf-8") as f:
    for row in tasks:
        f.write(json.dumps(row) + "\\n")

# ۲) آپلود فایل و ثبت Batch Job (۵۰٪ تخفیف)
with open("batch_input.jsonl", "rb") as f:
    batch_file = client.files.create(file=f, purpose="batch")

batch_job = client.batches.create(
    input_file_id=batch_file.id,
    endpoint="/v1/responses",
    completion_window="24h",
)

# ۳) استعلام وضعیت و دریافت نتایج
job = client.batches.retrieve(batch_job.id)
if job.status == "completed":
    print(client.files.content(job.output_file_id).text)

# ۴) حالت پس‌زمینه (Background Mode) برای تک‌درخواست‌های سنگین استدلالی
bg = client.responses.create(
    model="gpt-6.2-astra",
    input="Audit this distributed consensus design...",
    background=True,
    background_options={"completion_window": "2h"},  # "soonest" | "2h" | "8h"
)
# later: done = client.responses.retrieve(bg.id)`,
      },
      {
        provider: 'google',
        label: 'Google Gen AI SDK',
        sublabel: 'Inline Batch (یا فایل JSONL برای حجم بسیار بالا)',
        language: 'python',
        code: `# ۱) تعریف لیست درخواست‌های Inline (یا آپلود JSONL با client.files.upload)
inline_requests = [
    {
        "contents": [
            {"parts": [{"text": "Summarize report #1."}], "role": "user"}
        ]
    },
    {
        "contents": [
            {"parts": [{"text": "Summarize report #2."}], "role": "user"}
        ]
    },
]

batch_job = client.batches.create(
    model="gemini-3.8-flash",
    src=inline_requests,
    config={"display_name": "reports-batch-01"},
)
print("Job Name:", batch_job.name, "| State:", batch_job.state.name)

# ۲) استعلام وضعیت و خواندن نتایج پس از اتمام
job = client.batches.get(name=batch_job.name)
if job.state.name == "JOB_STATE_SUCCEEDED":
    for item in job.dest.inlined_responses:
        if item.response:
            print(item.response.text)`,
      },
    ],
  },
  {
    id: 'ch-20',
    number: 20,
    partId: 'part-5',
    titleFa: 'تنظیمات ایمنی، فیلتر محتوا و حریم خصوصی',
    titleEn: 'Safety Settings, Content Moderation & Data Privacy',
    summary:
      'کنترل حساسیت فیلترهای ایمنی در حوزه‌هایی مانند اسناد پزشکی، حقوقی یا اخبار (جلوگیری از مسدودسازی اشتباه) و مدیریت حفظ حریم خصوصی داده‌های ارسالی در محیط‌های سازمانی.',
    isNew: true,
    blocks: [
      {
        provider: 'openai',
        label: 'OpenAI SDK (Privacy & Moderation)',
        sublabel: 'عدم ذخیره سمت سرور + بررسی محتوای ورودی کاربر',
        language: 'python',
        code: `# ۱) بررسی ایمنی ورودی کاربر با Moderation API (رایگان)
mod = client.moderations.create(
    model="omni-moderation-latest",
    input="متن ورودی کاربر برای بررسی...",
)
if mod.results[0].flagged:
    raise ValueError("Input violates safety policy.")

# ۲) ارسال درخواست بدون ذخیره لاگ در سرورهای OpenAI
resp = client.responses.create(
    model="gpt-6.2-sol",
    input="تحلیل این گزارش داخلی...",
    store=False,  # جلوگیری از ذخیره وضعیت پاسخ در سرور
)
print(resp.output_text)`,
      },
      {
        provider: 'google',
        label: 'Google Gen AI SDK',
        sublabel: 'تنظیم دقیق آستانه فیلترهای ایمنی با SafetySetting',
        language: 'python',
        code: `response = client.models.generate_content(
    model="gemini-4-hydrogen",
    contents="تحلیل گزارش خبری تاریخی...",
    config=types.GenerateContentConfig(
        safety_settings=[
            types.SafetySetting(
                category=types.HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                threshold=types.HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
            ),
            types.SafetySetting(
                category=types.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold=types.HarmBlockThreshold.BLOCK_ONLY_HIGH,
            ),
        ]
    ),
)

if response.candidates[0].finish_reason == types.FinishReason.SAFETY:
    print("پاسخ توسط فیلتر ایمنی متوقف شد.")
else:
    print(response.text)`,
      },
    ],
  },
  {
    id: 'ch-21',
    number: 21,
    partId: 'part-5',
    titleFa: 'مدیریت خطاها، محدودیت نرخ (429) و تلاش مجدد هوشمند',
    titleEn: 'Error Handling, Rate Limits (429) & Exponential Backoff',
    summary:
      'پایدارسازی پایپ‌لاین‌های عملیاتی در برابر خطاهای موقت شبکه، شلوغی سرور (503) و محدودیت تعداد درخواست در دقیقه (429 Rate Limit) با الگوریتم تأخیر نمایی همراه با تصادفی‌سازی (Exponential Backoff + Jitter).',
    notes: [
      'هرگز خطاهای سمت کلاینت مانند 400 BadRequest، 401 Unauthorized یا 404 NotFound را Retry نکنید؛ این خطاها با تکرار حل نمی‌شوند و باید ورودی یا تنظیمات اصلاح شود.',
    ],
    blocks: [
      {
        provider: 'openai',
        label: 'OpenAI Responses API',
        sublabel: 'الگوی ایمن و آماده محیط عملیاتی',
        language: 'python',
        code: `import random
import time
from openai import (
    OpenAI,
    RateLimitError,
    APITimeoutError,
    APIConnectionError,
    BadRequestError,
    APIStatusError,
)

client = OpenAI(timeout=30.0, max_retries=2)

def safe_openai_call(prompt: str, max_attempts: int = 5) -> str:
    for attempt in range(max_attempts):
        try:
            resp = client.responses.create(
                model="gpt-6.2-sol",
                input=prompt,
            )
            if resp.status != "completed":
                raise RuntimeError(f"Incomplete: {resp.incomplete_details}")
            return resp.output_text
        except (RateLimitError, APITimeoutError, APIConnectionError) as e:
            if attempt == max_attempts - 1:
                raise
            delay = (2 ** attempt) + random.uniform(0.1, 1.0)
            print(f"Transient ({type(e).__name__}). Retry in {delay:.1f}s...")
            time.sleep(delay)
        except BadRequestError:
            # خطاهای اعتبارسنجی 400 هرگز نباید تکرار شوند
            raise
        except APIStatusError as e:
            if e.status_code >= 500 and attempt < max_attempts - 1:
                time.sleep((2 ** attempt) + random.uniform(0.1, 1.0))
            else:
                raise`,
      },
      {
        provider: 'google',
        label: 'Google Gen AI SDK',
        sublabel: 'تفکیک کدهای قابل تکرار (429/5xx) از خطاهای کلاینت',
        language: 'python',
        code: `import random
import time
from google import genai
from google.genai import types, errors

client = genai.Client(http_options=types.HttpOptions(timeout=30_000))
RETRYABLE_CODES = {429, 500, 502, 503, 504}

def safe_gemini_call(prompt: str, max_attempts: int = 5) -> str:
    for attempt in range(max_attempts):
        try:
            resp = client.models.generate_content(
                model="gemini-4-hydrogen",
                contents=prompt,
            )
            reason = resp.candidates[0].finish_reason
            if reason != types.FinishReason.STOP:
                raise RuntimeError(f"Unexpected finish_reason: {reason}")
            return resp.text or ""
        except errors.APIError as e:
            if e.code in RETRYABLE_CODES and attempt < max_attempts - 1:
                delay = (2 ** attempt) + random.uniform(0.1, 1.0)
                print(f"APIError {e.code}. Retry in {delay:.1f}s...")
                time.sleep(delay)
            else:
                # خطاهای 400/401/403/404 را هرگز تکرار نکنید
                raise`,
      },
    ],
  },
];

export const GOLDEN_TIPS: GoldenTip[] = [
  {
    id: 'tip-1',
    number: '۰۱',
    title: 'امنیت کلیدهای API و جلوگیری از نشت در گیت',
    body: 'هرگز کلید API را داخل فایل‌های py. یا ipynb. ذخیره نکنید. همیشه از فایل env. به همراه python-dotenv استفاده کرده و env. را پیش از اولین کامیت در gitignore. قرار دهید.',
    codeHint: 'echo ".env" >> .gitignore',
  },
  {
    id: 'tip-2',
    number: '۰۲',
    title: 'تنظیم سطح تفکر در Gemini 4 و GPT-6.2 برای کنترل هزینه',
    body: 'توکن‌های استدلال داخلی به‌عنوان توکن خروجی محاسبه می‌شوند و از سقف max_output_tokens کسر می‌گردند. در کارهای ساده و سریع، thinking_level="low" (در گوگل) یا reasoning={"effort": "low"} (در OpenAI) بگذارید و high/xhigh را برای مسائل پیچیده نگه دارید.',
    codeHint: 'thinking_level="low"  |  reasoning={"effort": "low"}',
  },
  {
    id: 'tip-3',
    number: '۰۳',
    title: 'ثبات پیشوند پرامپت برای گرفتن تا ۹۵٪ تخفیف کش',
    body: 'در OpenAI برای بهره‌مندی از تعرفه کش (تا ۹۵٪ ارزان‌تر در سری GPT-6.2)، دستورالعمل سیستم و کانتکست ثابت را در ابتدای پرامپت بدون تغییر نگه دارید و از prompt_cache_key به همراه prompt_cache_retention="12h" استفاده کنید.',
    codeHint: 'prompt_cache_key="docs-v1", prompt_cache_retention="12h"',
  },
  {
    id: 'tip-4',
    number: '۰۴',
    title: 'کنترل کیفیت پیش از پارس JSON در محیط عملیاتی',
    body: 'پیش از پارس کردن JSON یا ذخیره نتیجه در دیتابیس، همیشه کامل بودن پاسخ را بررسی کنید: در OpenAI مقدار response.status == "completed" (با حداقل ۱۶ توکن خروجی) و در Google مقدار finish_reason == FinishReason.STOP.',
    codeHint: 'response.status == "completed"  |  FinishReason.STOP',
  },
  {
    id: 'tip-5',
    number: '۰۵',
    title: 'بهینه‌سازی هوشمند هزینه با معماری ترکیبی مدل‌ها',
    body: 'برای اسناد تمیز دیجیتالی از پارسر محلی (pdfplumber) استفاده کنید و برای کارهای چندمرحله‌ای، طراحی را به مدل قوی‌تر (gpt-6.2-astra / gemini-4-carbon) و اجرا را به مدل سریع‌تر (gpt-6-luna / gemini-4-hydrogen) بسپارید. برای پردازش غیرآنی از Batch API (۵۰٪ تخفیف) بهره ببرید.',
  },
  {
    id: 'tip-6',
    number: '۰۶',
    title: 'محدودسازی همزمانی و پاک‌سازی فایل‌های آپلودشده',
    body: 'هنگام استفاده از asyncio.gather همیشه از asyncio.Semaphore برای کنترل سقف درخواست‌های موازی استفاده کنید تا درگیر خطای 429 نشوید. همچنین فایل‌های آپلودشده در Files API و کش‌های صریح را درون بلوک try...finally حذف کنید.',
    codeHint: 'async with asyncio.Semaphore(5): ...',
  },
];
