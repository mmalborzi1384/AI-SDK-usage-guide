import { Chapter, GoldenTip } from '../types/guide';

export const CHAPTERS_PART_2: Chapter[] = [
  {
    id: 'ch-10',
    number: 10,
    partId: 'part-3',
    titleFa: 'مکالمه چندمرحله‌ای و حفظ حافظه چت (سمت سرور و کلاینت)',
    titleEn: 'Multi-turn Chat & Conversation State Management',
    summary:
      'ساخت چت‌بات یا ادامه مکالمه‌ای که مدل پیام‌های نوبت‌های قبلی را به خاطر بسپارد. تفاوت معماری مهم: OpenAI می‌تواند تاریخچه را با previous_response_id در سرور نگه دارد، در حالی که Gemini تاریخچه را در شیء chat در سمت کلاینت مدیریت می‌کند.',
    isExpanded: true,
    notes: [
      'اگر به دلیل حریم خصوصی (Zero Data Retention) نمی‌خواهید تاریخچه در سرور OpenAI ذخیره شود، store=False بگذارید و آرایه پیام‌ها (input=[...]) را خودتان در هر نوبت ارسال کنید.',
      'در Google Gen AI برای ذخیره تاریخچه چت در دیتابیس می‌توانید از chat.get_history() استفاده کرده و در جلسه بعدی آن را با پارامتر history به client.chats.create(...) پاس دهید.',
    ],
    blocks: [
      {
        provider: 'openai',
        label: 'OpenAI Responses API',
        sublabel: 'حفظ حافظه سمت سرور (یا حالت دستی با store=False)',
        language: 'python',
        code: `# روش ۱: مدیریت وضعیت سمت سرور با previous_response_id
resp1 = client.responses.create(
    model="gpt-4.1-mini",
    input="Hi, my name is Mohammadmahdi and I code in Python.",
)

resp2 = client.responses.create(
    model="gpt-4.1-mini",
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
    model="gpt-4.1-mini",
    input=history,
    store=False,
)
print(stateless.output_text)`,
      },
      {
        provider: 'google',
        label: 'Google Gen AI SDK',
        sublabel: 'جلسه چت سمت کلاینت + استخراج تاریخچه برای دیتابیس',
        language: 'python',
        code: `chat = client.chats.create(model="gemini-2.5-flash")

# نوبت ۱
resp1 = chat.send_message(
    "Hi, my name is Mohammadmahdi and I code in Python."
)

# نوبت ۲: شیء chat تاریخچه را خودکار ارسال می‌کند
resp2 = chat.send_message("What is my name and primary language?")
print(resp2.text)

# مشاهده تاریخچه برای ذخیره در دیتابیس یا بازیابی در نشست بعدی
saved_history = chat.get_history()
print("Turns stored:", len(saved_history))`,
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
      'نمایش کلمه‌به‌کلمه پاسخ به کاربر به محض تولید توکن‌ها برای کاهش چشمگیر زمان انتظار درک‌شده (Time-to-First-Token). در OpenAI استفاده از Context Manager مدرن responses.stream علاوه بر استریم روان، دسترسی به آبجکت نهایی (شامل آمار توکن) را نیز فراهم می‌کند.',
    isExpanded: true,
    blocks: [
      {
        provider: 'openai',
        label: 'OpenAI Responses API',
        sublabel: 'Context Manager مدرن + دریافت پاسخ نهایی',
        language: 'python',
        code: `with client.responses.stream(
    model="gpt-4.1-mini",
    input="Write a 3-paragraph overview of the Transformer architecture.",
) as stream:
    for event in stream:
        if event.type == "response.output_text.delta":
            print(event.delta, end="", flush=True)

    # دسترسی به شیء کامل پاسخ (برای ثبت usage و status) پس از پایان استریم
    final = stream.get_final_response()
    print(f"\\n\\n[Tokens used: {final.usage.total_tokens}]")`,
      },
      {
        provider: 'google',
        label: 'Google Gen AI SDK',
        sublabel: 'استریم تکه به تکه + آمار توکن در آخرین چانک',
        language: 'python',
        code: `stream = client.models.generate_content_stream(
    model="gemini-2.5-flash",
    contents="Write a 3-paragraph overview of the Transformer architecture.",
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
    titleFa: 'کنترل میزان استدلال داخلی و مشاهده خلاصه افکار',
    titleEn: 'Reasoning Effort, Thinking Budget & Thought Summaries',
    summary:
      'موازنه دقیق بین سرعت/هزینه و عمق استدلال؛ خاموش یا کم کردن تفکر در کارهای ساده و افزایش آن در مسائل پیچیده ریاضی، معماری و کدنویسی، همراه با مشاهده خلاصه زنجیره تفکر مدل.',
    isExpanded: true,
    notes: [
      'در OpenAI برای مدل‌های استدلالی (مانند o4-mini و o3) با پارامتر reasoning={"effort": "medium", "summary": "auto"} علاوه بر تنظیم عمق استدلال، خلاصه استدلال را هم در آیتم‌هایی با نوع reasoning دریافت می‌کنید.',
      'در Google Gen AI با include_thoughts=True در ThinkingConfig، بخش‌هایی که ویژگی part.thought برابر True دارند حاوی خلاصه تفکر مدل هستند و جدا از پاسخ نهایی قابل خواندن‌اند.',
    ],
    blocks: [
      {
        provider: 'openai',
        label: 'OpenAI Responses API',
        sublabel: 'تنظیم effort + دریافت خلاصه استدلال',
        language: 'python',
        code: `response = client.responses.create(
    model="o4-mini",
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
        sublabel: 'تنظیم thinking_budget + جداسازی افکار از پاسخ نهایی',
        language: 'python',
        code: `response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Prove the time complexity of Dijkstra's algorithm with a binary heap.",
    config=types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(
            thinking_budget=2048,  # عدد 0 تفکر را خاموش می‌کند
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
    model="gpt-4.1-mini",
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
    model="gemini-2.5-flash",
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
    titleFa: 'ابزارهای داخلی پیشرفته: اجرای کد پایتون و خواندن لینک (URL)',
    titleEn: 'Built-in Code Execution & URL Context',
    summary:
      'استفاده از محیط سندباکس امن پایتون در سمت سرور مدل برای انجام محاسبات دقیق ریاضی، تحلیل داده و رفع خطاهای حسابی LLMها؛ و در Gemini امکان خواندن مستقیم محتوای یک یا چند آدرس وب با ابزار URL Context.',
    isNew: true,
    notes: [
      'اجرای کد در سندباکس برای تحلیل فایل‌های CSV، محاسبات مالی دقیق و رسم نمودار بسیار مطمئن‌تر از محاسبه ذهنی مدل است.',
      'در Gemini ابزار url_context به مدل اجازه می‌دهد محتوای دقیق صفحه وب موجود در پرامپت را بدون نیاز به کتابخانه‌های Scraping واکشی و تحلیل کند.',
    ],
    blocks: [
      {
        provider: 'openai',
        label: 'OpenAI Responses API',
        sublabel: 'ابزار داخلی Code Interpreter در کانتینر امن',
        language: 'python',
        code: `response = client.responses.create(
    model="gpt-4.1",
    tools=[
        {
            "type": "code_interpreter",
            "container": {"type": "auto"},
        }
    ],
    input=(
        "Calculate the exact sum of the first 50 prime numbers "
        "using Python and verify the result."
    ),
)
print(response.output_text)`,
      },
      {
        provider: 'google',
        label: 'Google Gen AI SDK',
        sublabel: 'سندباکس اجرای کد (Code Execution) و خواندن لینک (URL Context)',
        language: 'python',
        code: `# ۱) اجرای امن کد پایتون در سندباکس سرور گوگل
code_resp = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Sum the first 50 prime numbers by writing and running Python.",
    config=types.GenerateContentConfig(
        tools=[types.Tool(code_execution=types.ToolCodeExecution())],
    ),
)
print(code_resp.text)

# ۲) خواندن و تحلیل مستقیم محتوای یک لینک با URL Context
url_resp = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="نکات کلیدی این صفحه را خلاصه کن: https://docs.python.org/3/whatsnew/",
    config=types.GenerateContentConfig(
        tools=[types.Tool(url_context=types.UrlContext())],
    ),
)
print(url_resp.text)`,
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
      'در OpenAI Responses API باید خروجی تابع را به‌صورت آیتم function_call_output همراه با call_id دقیقاً منطبق با درخواست مدل برگردانید (با previous_response_id یا همراه با response.output).',
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
    model="gpt-4.1-mini",
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
    model="gpt-4.1-mini",
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
    model="gemini-2.5-flash",
    contents="What is the weather in Tehran right now?",
    config=types.GenerateContentConfig(tools=[get_weather]),
)
print(auto_resp.text)

# روش ۲: حالت دستی (برای تأیید کاربر یا لاگ امنیتی پیش از اجرا)
manual_1 = client.models.generate_content(
    model="gemini-2.5-flash",
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
        model="gemini-2.5-flash",
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
    titleFa: 'تولید بردارهای معنایی (Embeddings) برای RAG و جستجو',
    titleEn: 'Vector Embeddings for Semantic Search & RAG',
    summary:
      'تبدیل متن به بردارهای عددی برای ساخت سیستم‌های بازیابی اطلاعات (RAG)، جستجوی معنایی، خوشه‌بندی و تشخیص شباهت متون. در هر دو SDK امکان کاهش ابعاد خروجی (Matryoshka Dimensions) برای صرفه‌جویی در حافظه دیتابیس برداری وجود دارد.',
    isNew: true,
    notes: [
      'در Google Gen AI تعیین پارامتر task_type (مانند RETRIEVAL_DOCUMENT برای اسناد و RETRIEVAL_QUERY برای پرسش کاربر) دقت بازیابی در RAG را به‌طور محسوسی بهبود می‌دهد.',
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
        sublabel: 'تولید بردار با gemini-embedding-001 و task_type',
        language: 'python',
        code: `resp = client.models.embed_content(
    model="gemini-embedding-001",
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
            model="gpt-4.1-mini",
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
            model="gemini-2.5-flash",
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
    titleFa: 'کش کردن کانتکست (Context Caching)',
    titleEn: 'Automatic Prefix Caching vs. Explicit Context Cache',
    summary:
      'کاهش شدید هزینه توکن‌های ورودی و کاهش تأخیر زمانی هنگام ارسال مکرر یک سند حجیم (مانند کتابچه راهنما، قرارداد چندصدصفحه‌ای یا پایگاه کد). در OpenAI کش پیشوندهای مشترک (۱۰۲۴ توکن به بالا) خودکار است و با prompt_cache_key بهینه می‌شود؛ در Google Gen AI علاوه بر کش خودکار (ضمنی)، می‌توانید با client.caches.create کش صریح با زمان نگهداری مشخص (TTL) بسازید.',
    blocks: [
      {
        provider: 'openai',
        label: 'OpenAI Responses API (Automatic Prefix Caching)',
        sublabel: 'قرار دادن متن ثابت در ابتدای پرامپت + prompt_cache_key',
        language: 'python',
        code: `# دستورالعمل و سند حجیم ثابت را همیشه در ابتدای پرامپت قرار دهید (>= 1024 توکن)
large_context = open("company_handbook.txt", encoding="utf-8").read()

response = client.responses.create(
    model="gpt-4.1-mini",
    instructions=f"Answer strictly from this handbook:\\n\\n{large_context}",
    input="What is the remote work policy for engineers?",
    # کلید مسیریابی اختیاری برای بیشینه‌سازی نرخ برخورد به کش (Cache Hit Rate)
    prompt_cache_key="handbook-v1",
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
    model="gemini-2.5-flash",
    config=types.CreateCachedContentConfig(
        display_name="handbook-cache-v1",
        system_instruction="Answer strictly based on the attached handbook.",
        contents=[doc],
        ttl="3600s",
    ),
)

# ۳) استفاده مکرر از کش با تخفیف چشمگیر در هزینه ورودی
response = client.models.generate_content(
    model="gemini-2.5-flash",
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
      'پردازش هزاران سند، فاکتور یا رکورد داده که نیاز به پاسخ آنی ندارند (تحویل ظرف حداکثر ۲۴ ساعت) با ۵۰ درصد کاهش هزینه و سقف سهمیه جداگانه. همچنین OpenAI برای کارهای طولانی ایجنتی حالت background=True را پشتیبانی می‌کند.',
    isExpanded: true,
    blocks: [
      {
        provider: 'openai',
        label: 'OpenAI Responses API',
        sublabel: 'JSONL Batch Job (۵۰٪ تخفیف) + Background Mode',
        language: 'python',
        code: `import json

# ۱) آماده‌سازی فایل JSONL با هدف /v1/responses
tasks = [
    {
        "custom_id": "doc-1",
        "method": "POST",
        "url": "/v1/responses",
        "body": {"model": "gpt-4.1-mini", "input": "Summarize report #1."},
    },
    {
        "custom_id": "doc-2",
        "method": "POST",
        "url": "/v1/responses",
        "body": {"model": "gpt-4.1-mini", "input": "Summarize report #2."},
    },
]
with open("batch_input.jsonl", "w", encoding="utf-8") as f:
    for row in tasks:
        f.write(json.dumps(row) + "\\n")

# ۲) آپلود فایل و ثبت Batch Job
with open("batch_input.jsonl", "rb") as f:
    batch_file = client.files.create(file=f, purpose="batch")

batch_job = client.batches.create(
    input_file_id=batch_file.id,
    endpoint="/v1/responses",
    completion_window="24h",
)
print("Batch ID:", batch_job.id, "| Status:", batch_job.status)

# ۳) بررسی وضعیت و دریافت خروجی پس از تکمیل
job = client.batches.retrieve(batch_job.id)
if job.status == "completed":
    print(client.files.content(job.output_file_id).text)

# نکته تکمیلی: برای تک‌درخواست‌های سنگین استدلالی از background=True استفاده کنید:
# bg = client.responses.create(model="o3", input="...", background=True)
# result = client.responses.retrieve(bg.id)`,
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
    model="gemini-2.5-flash",
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
    model="gpt-4.1-mini",
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
    model="gemini-2.5-flash",
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
                model="gpt-4.1-mini",
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
                model="gemini-2.5-flash",
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
    title: 'تأثیر توکن‌های تفکر داخلی در Gemini 2.5',
    body: 'توکن‌های تفکر داخلی (thinking_budget) از همان سقف max_output_tokens کسر می‌شوند؛ بنابراین در کارهای استخراج ساده، دسته‌بندی سریع یا خروجی‌های کوتاه، مقدار thinking_budget=0 بگذارید تا پاسخ قطع نشود و هزینه اضافه نپردازید.',
    codeHint: 'thinking_config=types.ThinkingConfig(thinking_budget=0)',
  },
  {
    id: 'tip-3',
    number: '۰۳',
    title: 'حداقل سقف توکن در OpenAI Responses API',
    body: 'مقدار max_output_tokens در Responses API نباید کمتر از ۱۶ باشد؛ در غیر این صورت بلافاصله با خطای اعتبارسنجی 400 BadRequestError مواجه می‌شوید.',
    codeHint: 'max_output_tokens=16  # minimum allowed',
  },
  {
    id: 'tip-4',
    number: '۰۴',
    title: 'کنترل کیفیت پیش از پارس JSON در محیط عملیاتی',
    body: 'پیش از پارس کردن JSON یا ذخیره نتیجه در دیتابیس، همیشه کامل بودن پاسخ را بررسی کنید: در OpenAI مقدار response.status == "completed" و در Google مقدار finish_reason == FinishReason.STOP.',
    codeHint: 'response.status == "completed"  |  FinishReason.STOP',
  },
  {
    id: 'tip-5',
    number: '۰۵',
    title: 'بهینه‌سازی هوشمند هزینه در مقیاس بالا',
    body: 'برای اسناد تمیز دیجیتالی از پارسرهای محلی رایگان (مانند pdfplumber یا PyMuPDF) استفاده کرده و تنها صفحات اسکن‌شده یا دارای جدول پیچیده را به مدل چندوجهی بفرستید. در پردازش‌های غیرآنی از Batch API (۵۰٪ تخفیف) و برای اسناد پرتکرار از Context Caching بهره ببرید.',
  },
  {
    id: 'tip-6',
    number: '۰۶',
    title: 'محدودسازی همزمانی و پاک‌سازی فایل‌های آپلودشده',
    body: 'هنگام استفاده از asyncio.gather همیشه از asyncio.Semaphore برای کنترل سقف درخواست‌های موازی استفاده کنید تا درگیر خطای 429 نشوید. همچنین فایل‌های آپلودشده در Files API و کش‌های صریح را درون بلوک try...finally حذف کنید.',
    codeHint: 'async with asyncio.Semaphore(5): ...',
  },
];
