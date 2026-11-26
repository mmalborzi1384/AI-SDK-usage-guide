import React, { useMemo, useState } from 'react';
import { Scale } from 'lucide-react';
import { toPersianDigits } from '../data/guideData';
import { ThemedCheckbox, ThemedSelect } from './ui/ThemedControls';

interface ModelPricing {
  id: string;
  provider: 'OpenAI' | 'Google';
  tier: string;
  inputPer1M: number; // USD per 1M input tokens (<= 272K context)
  cachedInputPer1M: number; // USD per 1M cached input tokens
  outputPer1M: number; // USD per 1M output tokens (incl. reasoning)
}

// Verified late-2026 official standard pricing (USD per 1M tokens)
const MODELS: ModelPricing[] = [
  {
    id: 'gpt-6-luna',
    provider: 'OpenAI',
    tier: 'فوق‌اقتصادی حجم بالا',
    inputPer1M: 0.1,
    cachedInputPer1M: 0.01,
    outputPer1M: 0.5,
  },
  {
    id: 'gemini-3.8-flash',
    provider: 'Google',
    tier: 'فلش سریع (نرخ معارفه ۲۰۲۶)',
    inputPer1M: 0.75,
    cachedInputPer1M: 0.1875,
    outputPer1M: 3.75,
  },
  {
    id: 'gpt-6.1-terra',
    provider: 'OpenAI',
    tier: 'بینایی و OCR',
    inputPer1M: 1.0,
    cachedInputPer1M: 0.05,
    outputPer1M: 5.0,
  },
  {
    id: 'gemini-4-hydrogen',
    provider: 'Google',
    tier: 'روزمره سریع (پنجره ۱M)',
    inputPer1M: 1.5,
    cachedInputPer1M: 0.375,
    outputPer1M: 7.5,
  },
  {
    id: 'gpt-6.2-sol',
    provider: 'OpenAI',
    tier: 'متعادل کد و ایجنت (پنجره ۱M)',
    inputPer1M: 2.0,
    cachedInputPer1M: 0.1,
    outputPer1M: 10.0,
  },
  {
    id: 'gemini-4-carbon',
    provider: 'Google',
    tier: 'استدلالی مرزی (نرخ معارفه)',
    inputPer1M: 2.0,
    cachedInputPer1M: 0.5,
    outputPer1M: 10.0,
  },
  {
    id: 'gemini-4-neon',
    provider: 'Google',
    tier: 'پرچم‌دار دقیق',
    inputPer1M: 3.0,
    cachedInputPer1M: 0.75,
    outputPer1M: 15.0,
  },
  {
    id: 'gpt-6.2-astra',
    provider: 'OpenAI',
    tier: 'استدلال مرزی پرچم‌دار',
    inputPer1M: 8.0,
    cachedInputPer1M: 0.4,
    outputPer1M: 40.0,
  },
];

const OPENAI_MODELS = MODELS.filter((m) => m.provider === 'OpenAI');
const GOOGLE_MODELS = MODELS.filter((m) => m.provider === 'Google');

const WORKLOAD_PRESETS = [
  { label: 'چت سریع (1K / 400)', inTok: 1_000, outTok: 400, reqs: 10_000 },
  { label: 'تحلیل PDF (12K / 1.5K)', inTok: 12_000, outTok: 1_500, reqs: 5_000 },
  { label: 'کدنویسی ایجنتی (35K / 4K)', inTok: 35_000, outTok: 4_000, reqs: 2_500 },
  { label: 'یک درخواست تکی', inTok: 8_000, outTok: 1_200, reqs: 1 },
];

function formatUsd(amount: number): string {
  if (amount === 0) return '$0.00';
  if (amount < 0.01) return `$${amount.toFixed(5)}`;
  if (amount < 1) return `$${amount.toFixed(4)}`;
  return `$${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function clampNonNegativeInt(raw: string, max: number): number {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.min(max, Math.round(parsed));
}

export const CostCalculator: React.FC = () => {
  const [selectedOpenAIId, setSelectedOpenAIId] = useState<string>('gpt-6.2-sol');
  const [selectedGoogleId, setSelectedGoogleId] = useState<string>('gemini-4-hydrogen');

  const [monthlyRequests, setMonthlyRequests] = useState<number>(25_000);
  const [inputTokens, setInputTokens] = useState<number>(2_500);
  const [outputTokens, setOutputTokens] = useState<number>(500);
  const [cacheHitRate, setCacheHitRate] = useState<number>(60);
  const [useBatch, setUseBatch] = useState<boolean>(false);

  const estimates = useMemo(() => {
    const safeReqs = Math.max(1, monthlyRequests);
    const totalInM = (safeReqs * inputTokens) / 1_000_000;
    const totalOutM = (safeReqs * outputTokens) / 1_000_000;
    const cachedFraction = cacheHitRate / 100;
    const batchMultiplier = useBatch ? 0.5 : 1;

    const rows = MODELS.map((m) => {
      const baseInputCost = totalInM * m.inputPer1M;
      const baseOutputCost = totalOutM * m.outputPer1M;
      const baseCost = baseInputCost + baseOutputCost;

      const optInputCost =
        totalInM *
        ((1 - cachedFraction) * m.inputPer1M + cachedFraction * m.cachedInputPer1M) *
        batchMultiplier;
      const optOutputCost = baseOutputCost * batchMultiplier;
      const optimizedCost = optInputCost + optOutputCost;
      const perRequestCost = optimizedCost / safeReqs;
      const savedPct = baseCost > 0 ? Math.round(((baseCost - optimizedCost) / baseCost) * 100) : 0;

      return {
        ...m,
        baseCost,
        optInputCost,
        optOutputCost,
        optimizedCost,
        perRequestCost,
        savedPct,
      };
    });

    const openaiRow = rows.find((r) => r.id === selectedOpenAIId) ?? rows[0];
    const googleRow = rows.find((r) => r.id === selectedGoogleId) ?? rows[1];
    const maxCost = Math.max(...rows.map((r) => r.optimizedCost), 0.0001);

    const diffUsd = Math.abs(openaiRow.optimizedCost - googleRow.optimizedCost);
    const higher = Math.max(openaiRow.optimizedCost, googleRow.optimizedCost);
    const diffPct = higher > 0 ? Math.round((diffUsd / higher) * 100) : 0;
    const winner: 'OpenAI' | 'Google' | 'Tie' =
      diffUsd < 0.00001
        ? 'Tie'
        : openaiRow.optimizedCost < googleRow.optimizedCost
          ? 'OpenAI'
          : 'Google';

    return {
      rows,
      openaiRow,
      googleRow,
      maxCost,
      totalInM,
      totalOutM,
      diffUsd,
      diffPct,
      winner,
    };
  }, [
    monthlyRequests,
    inputTokens,
    outputTokens,
    cacheHitRate,
    useBatch,
    selectedOpenAIId,
    selectedGoogleId,
  ]);

  const estimatedPdfPages = Math.max(1, Math.round(inputTokens / 300));

  return (
    <div className="space-y-5">
      {/* Header + Quick Presets */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-base font-extrabold" style={{ color: 'var(--text-primary)' }}>
            برآوردگر زنده هزینه API (مقایسه مستقیم OpenAI در برابر Google)
          </h3>
          <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
            تعداد توکن ورودی/خروجی و مدل دلخواه هر دو سرویس‌دهنده را انتخاب کنید تا هزینه لحظه‌ای
            هر درخواست و کل ماه را مقایسه کنید.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {WORKLOAD_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setInputTokens(preset.inTok);
                setOutputTokens(preset.outTok);
                setMonthlyRequests(preset.reqs);
              }}
              className="h-7 rounded border px-2 text-[11px] font-medium transition-colors whitespace-nowrap"
              style={{
                borderColor: 'var(--border-subtle)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-secondary)',
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Head-to-Head Model Picker + Token Controls */}
      <div
        className="grid grid-cols-1 gap-4 rounded-md border p-4 lg:grid-cols-12"
        style={{
          borderColor: 'var(--border-subtle)',
          backgroundColor: 'var(--bg-surface)',
        }}
      >
        {/* OpenAI Model Selector */}
        <div className="lg:col-span-3">
          <label
            htmlFor="openai-model-select"
            className="mb-1.5 block text-xs font-bold"
            style={{ color: 'var(--openai-accent)' }}
          >
            مدل OpenAI
          </label>
          <ThemedSelect
            id="openai-model-select"
            ariaLabel="انتخاب مدل OpenAI"
            value={selectedOpenAIId}
            onChange={setSelectedOpenAIId}
            accentColor="var(--openai-accent)"
            softBg="var(--openai-soft)"
            options={OPENAI_MODELS.map((m) => ({
              value: m.id,
              label: m.id,
              meta: `$${m.inputPer1M}/$${m.outputPer1M}`,
              description: m.tier,
            }))}
          />
          <p className="mt-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
            {estimates.openaiRow.tier}
          </p>
        </div>

        {/* Google Model Selector */}
        <div className="lg:col-span-3">
          <label
            htmlFor="google-model-select"
            className="mb-1.5 block text-xs font-bold"
            style={{ color: 'var(--google-accent)' }}
          >
            مدل Google Gemini
          </label>
          <ThemedSelect
            id="google-model-select"
            ariaLabel="انتخاب مدل Google Gemini"
            value={selectedGoogleId}
            onChange={setSelectedGoogleId}
            accentColor="var(--google-accent)"
            softBg="var(--google-soft)"
            options={GOOGLE_MODELS.map((m) => ({
              value: m.id,
              label: m.id,
              meta: `$${m.inputPer1M}/$${m.outputPer1M}`,
              description: m.tier,
            }))}
          />
          <p className="mt-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
            {estimates.googleRow.tier}
          </p>
        </div>

        {/* Expected Input Tokens */}
        <div className="lg:col-span-2">
          <label
            htmlFor="input-tokens-number"
            className="mb-1.5 block text-xs font-medium"
            style={{ color: 'var(--text-secondary)' }}
          >
            توکن ورودی / درخواست
          </label>
          <input
            id="input-tokens-number"
            type="number"
            dir="ltr"
            min={0}
            max={1_000_000}
            step={100}
            value={inputTokens}
            onChange={(e) => setInputTokens(clampNonNegativeInt(e.target.value, 1_000_000))}
            className="h-9 w-full rounded border px-2.5 font-mono text-xs font-bold tabular-nums outline-none"
            style={{
              borderColor: 'var(--border-strong)',
              backgroundColor: 'var(--bg-canvas)',
              color: 'var(--text-primary)',
            }}
          />
          <input
            type="range"
            min={0}
            max={100_000}
            step={250}
            value={Math.min(inputTokens, 100_000)}
            onChange={(e) => setInputTokens(Number(e.target.value))}
            aria-label="اسلایدر توکن ورودی"
            className="editorial-range mt-2 w-full"
          />
          <p className="mt-1 text-[10.5px] tabular-nums" style={{ color: 'var(--text-muted)' }}>
            حدود {toPersianDigits(estimatedPdfPages)} صفحه PDF
          </p>
        </div>

        {/* Expected Output Tokens */}
        <div className="lg:col-span-2">
          <label
            htmlFor="output-tokens-number"
            className="mb-1.5 block text-xs font-medium"
            style={{ color: 'var(--text-secondary)' }}
          >
            توکن خروجی / درخواست
          </label>
          <input
            id="output-tokens-number"
            type="number"
            dir="ltr"
            min={0}
            max={200_000}
            step={50}
            value={outputTokens}
            onChange={(e) => setOutputTokens(clampNonNegativeInt(e.target.value, 200_000))}
            className="h-9 w-full rounded border px-2.5 font-mono text-xs font-bold tabular-nums outline-none"
            style={{
              borderColor: 'var(--border-strong)',
              backgroundColor: 'var(--bg-canvas)',
              color: 'var(--text-primary)',
            }}
          />
          <input
            type="range"
            min={0}
            max={16_000}
            step={100}
            value={Math.min(outputTokens, 16_000)}
            onChange={(e) => setOutputTokens(Number(e.target.value))}
            aria-label="اسلایدر توکن خروجی"
            className="editorial-range mt-2 w-full"
          />
          <p className="mt-1 text-[10.5px]" style={{ color: 'var(--text-muted)' }}>
            شامل توکن استدلال
          </p>
        </div>

        {/* Request Volume */}
        <div className="lg:col-span-2">
          <label
            htmlFor="requests-count-number"
            className="mb-1.5 block text-xs font-medium"
            style={{ color: 'var(--text-secondary)' }}
          >
            تعداد درخواست
          </label>
          <input
            id="requests-count-number"
            type="number"
            dir="ltr"
            min={1}
            max={5_000_000}
            step={100}
            value={monthlyRequests}
            onChange={(e) =>
              setMonthlyRequests(Math.max(1, clampNonNegativeInt(e.target.value, 5_000_000)))
            }
            className="h-9 w-full rounded border px-2.5 font-mono text-xs font-bold tabular-nums outline-none"
            style={{
              borderColor: 'var(--border-strong)',
              backgroundColor: 'var(--bg-canvas)',
              color: 'var(--text-primary)',
            }}
          />
          <input
            type="range"
            min={1}
            max={200_000}
            step={1_000}
            value={Math.min(monthlyRequests, 200_000)}
            onChange={(e) => setMonthlyRequests(Math.max(1, Number(e.target.value)))}
            aria-label="اسلایدر تعداد درخواست"
            className="editorial-range mt-2 w-full"
          />
          <p className="mt-1 text-[10.5px] tabular-nums" style={{ color: 'var(--text-muted)' }}>
            {monthlyRequests === 1 ? 'محاسبه تک‌درخواست' : 'دوره ماهانه'}
          </p>
        </div>

        {/* Cache & Batch Row */}
        <div
          className="flex flex-col gap-3 border-t pt-3 sm:flex-row sm:items-center sm:justify-between lg:col-span-12"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <div className="flex flex-1 flex-wrap items-center gap-3">
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              نرخ برخورد کش (Cache Hit):
            </span>
            <input
              type="range"
              min={0}
              max={95}
              step={5}
              value={cacheHitRate}
              onChange={(e) => setCacheHitRate(Number(e.target.value))}
              aria-label="نرخ برخورد کش"
              className="editorial-range w-36"
            />
            <span
              dir="ltr"
              className="font-mono text-xs font-bold tabular-nums"
              style={{ color: 'var(--accent)' }}
            >
              {cacheHitRate}%
            </span>
          </div>

          <ThemedCheckbox
            checked={useBatch}
            onChange={setUseBatch}
            label="فعال‌سازی Batch API (۵۰٪ تخفیف هر دو سرویس‌دهنده)"
          />
        </div>
      </div>

      {/* Real-Time Side-by-Side Comparison Panel */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[estimates.openaiRow, estimates.googleRow].map((row) => {
          const isOpenAI = row.provider === 'OpenAI';
          const isCheaper = estimates.winner === row.provider;
          const accentColor = isOpenAI ? 'var(--openai-accent)' : 'var(--google-accent)';
          const softBg = isOpenAI ? 'var(--openai-soft)' : 'var(--google-soft)';
          const inputShare =
            row.optimizedCost > 0
              ? Math.round((row.optInputCost / row.optimizedCost) * 100)
              : 50;

          return (
            <div
              key={row.id}
              className="rounded-md border p-4"
              style={{
                borderColor: isCheaper ? accentColor : 'var(--border-subtle)',
                backgroundColor: 'var(--bg-surface)',
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold" style={{ color: accentColor }}>
                      {row.provider}
                    </span>
                    <span aria-hidden="true" style={{ color: 'var(--border-strong)' }}>
                      ·
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>{row.tier}</span>
                  </div>
                  <h4
                    dir="ltr"
                    className="mt-1 text-right font-mono text-base font-extrabold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {row.id}
                  </h4>
                </div>

                {isCheaper && (
                  <span
                    className="text-xs font-bold"
                    style={{ color: accentColor }}
                  >
                    به‌صرفه‌تر ({toPersianDigits(estimates.diffPct)}٪ صرفه‌جویی)
                  </span>
                )}
              </div>

              <div
                className="mt-4 grid grid-cols-2 gap-3 border-y py-3"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <div>
                  <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    {monthlyRequests === 1 ? 'هزینه کل درخواست' : 'هزینه کل بهینه‌شده'}
                  </div>
                  <div
                    dir="ltr"
                    className="mt-0.5 text-right font-mono text-2xl font-extrabold tabular-nums"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {formatUsd(row.optimizedCost)}
                  </div>
                  {row.savedPct > 0 && (
                    <div
                      dir="ltr"
                      className="text-right font-mono text-[11px] tabular-nums"
                      style={{ color: accentColor }}
                    >
                      Base {formatUsd(row.baseCost)} (-{row.savedPct}%)
                    </div>
                  )}
                </div>

                <div
                  className="border-r pr-3"
                  style={{ borderColor: 'var(--border-subtle)' }}
                >
                  <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    هزینه هر درخواست
                  </div>
                  <div
                    dir="ltr"
                    className="mt-0.5 text-right font-mono text-lg font-bold tabular-nums"
                    style={{ color: accentColor }}
                  >
                    {formatUsd(row.perRequestCost)}
                  </div>
                  <div
                    dir="ltr"
                    className="text-right font-mono text-[10.5px] tabular-nums"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    ${row.inputPer1M} in · ${row.outputPer1M} out / 1M
                  </div>
                </div>
              </div>

              {/* Input vs Output Cost Split Bar */}
              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between text-[11px]">
                  <span style={{ color: 'var(--text-secondary)' }}>
                    ورودی:{' '}
                    <strong dir="ltr" className="font-mono tabular-nums">
                      {formatUsd(row.optInputCost)}
                    </strong>{' '}
                    ({toPersianDigits(inputShare)}٪)
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    خروجی:{' '}
                    <strong dir="ltr" className="font-mono tabular-nums">
                      {formatUsd(row.optOutputCost)}
                    </strong>{' '}
                    ({toPersianDigits(100 - inputShare)}٪)
                  </span>
                </div>
                <div
                  className="flex h-2 w-full overflow-hidden rounded-xs"
                  style={{ backgroundColor: softBg }}
                >
                  <div
                    className="h-full transition-[width] duration-200"
                    style={{
                      width: `${inputShare}%`,
                      backgroundColor: accentColor,
                      opacity: 0.55,
                    }}
                  />
                  <div
                    className="h-full transition-[width] duration-200"
                    style={{
                      width: `${100 - inputShare}%`,
                      backgroundColor: accentColor,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Head-to-Head Verdict Strip */}
      <div
        className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-4 py-2.5 text-xs"
        style={{
          borderColor: 'var(--border-subtle)',
          backgroundColor: 'var(--bg-subtle)',
          color: 'var(--text-secondary)',
        }}
      >
        <div className="flex items-center gap-2">
          <Scale className="h-4 w-4 shrink-0" style={{ color: 'var(--accent)' }} />
          {estimates.winner === 'Tie' ? (
            <span>
              هزینه کل{' '}
              <strong className="font-mono" dir="ltr">
                {estimates.openaiRow.id}
              </strong>{' '}
              و{' '}
              <strong className="font-mono" dir="ltr">
                {estimates.googleRow.id}
              </strong>{' '}
              در این سناریو دقیقاً برابر است.
            </span>
          ) : (
            <span>
              در این سناریو{' '}
              <strong
                dir="ltr"
                className="font-mono"
                style={{
                  color:
                    estimates.winner === 'OpenAI'
                      ? 'var(--openai-accent)'
                      : 'var(--google-accent)',
                }}
              >
                {estimates.winner === 'OpenAI'
                  ? estimates.openaiRow.id
                  : estimates.googleRow.id}
              </strong>{' '}
              به میزان{' '}
              <strong dir="ltr" className="font-mono tabular-nums">
                {formatUsd(estimates.diffUsd)}
              </strong>{' '}
              ({toPersianDigits(estimates.diffPct)}٪) ارزان‌تر است.
            </span>
          )}
        </div>

        <span dir="ltr" className="font-mono text-[11px] tabular-nums" style={{ color: 'var(--text-muted)' }}>
          {estimates.totalInM.toFixed(2)}M in · {estimates.totalOutM.toFixed(2)}M out
        </span>
      </div>

      {/* Full 2026 Model Matrix (Click any row to select for comparison) */}
      <div
        className="overflow-x-auto rounded-md border"
        style={{
          borderColor: 'var(--border-subtle)',
          backgroundColor: 'var(--bg-surface)',
        }}
      >
        <table className="w-full min-w-[580px] border-collapse text-right text-xs">
          <thead>
            <tr
              className="border-b font-bold"
              style={{
                borderColor: 'var(--border-subtle)',
                backgroundColor: 'var(--bg-subtle)',
                color: 'var(--text-primary)',
              }}
            >
              <th className="px-4 py-2.5 text-right">
                جدول کامل مدل‌های رسمی ۲۰۲۶ (کلیک برای انتخاب)
              </th>
              <th className="px-4 py-2.5 text-left" dir="ltr">
                Standard
              </th>
              <th className="px-4 py-2.5 text-left" dir="ltr">
                Optimized
              </th>
              <th className="w-[28%] px-4 py-2.5 text-right">مقایسه نسبی هزینه</th>
            </tr>
          </thead>
          <tbody>
            {estimates.rows.map((row) => {
              const barWidth = Math.max(4, Math.round((row.optimizedCost / estimates.maxCost) * 100));
              const isOpenAI = row.provider === 'OpenAI';
              const isSelected =
                row.id === selectedOpenAIId || row.id === selectedGoogleId;

              return (
                <tr
                  key={row.id}
                  onClick={() => {
                    if (isOpenAI) {
                      setSelectedOpenAIId(row.id);
                    } else {
                      setSelectedGoogleId(row.id);
                    }
                  }}
                  className="cursor-pointer border-b transition-colors last:border-b-0"
                  style={{
                    borderColor: 'var(--border-subtle)',
                    backgroundColor: isSelected
                      ? isOpenAI
                        ? 'var(--openai-soft)'
                        : 'var(--google-soft)'
                      : 'transparent',
                  }}
                >
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span
                        dir="ltr"
                        className="font-mono font-bold"
                        style={{
                          color: isOpenAI ? 'var(--openai-accent)' : 'var(--google-accent)',
                        }}
                      >
                        {row.id}
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>· {row.tier}</span>
                      {isSelected && (
                        <span
                          className="text-[10.5px] font-bold"
                          style={{
                            color: isOpenAI ? 'var(--openai-accent)' : 'var(--google-accent)',
                          }}
                        >
                          (انتخاب‌شده)
                        </span>
                      )}
                    </div>
                  </td>
                  <td
                    dir="ltr"
                    className="px-4 py-2.5 text-left font-mono tabular-nums"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {formatUsd(row.baseCost)}
                  </td>
                  <td
                    dir="ltr"
                    className="px-4 py-2.5 text-left font-mono font-bold tabular-nums"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {formatUsd(row.optimizedCost)}
                    {row.savedPct > 0 && (
                      <span
                        className="ml-1.5 text-[10.5px] font-medium"
                        style={{ color: 'var(--openai-accent)' }}
                      >
                        (-{row.savedPct}%)
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <div
                      className="h-2 w-full overflow-hidden rounded-xs"
                      style={{ backgroundColor: 'var(--bg-subtle)' }}
                    >
                      <div
                        className="h-full transition-[width] duration-200"
                        style={{
                          width: `${barWidth}%`,
                          backgroundColor: isOpenAI
                            ? 'var(--openai-accent)'
                            : 'var(--google-accent)',
                        }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
        نرخ‌ها بر اساس تعرفه رسمی نوامبر ۲۰۲۶ برای کانتکست استاندارد زیر ۲۷۲ هزار توکن محاسبه
        شده‌اند؛ توکن‌های استدلالی (Reasoning / Thinking) در هر دو پلتفرم با نرخ خروجی محاسبه
        می‌شوند.
      </p>
    </div>
  );
};
