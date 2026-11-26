import React from 'react';
import {
  ArrowLeftRight,
  Calculator,
  ChevronDown,
  ChevronUp,
  Code2,
  Network,
  SlidersHorizontal,
} from 'lucide-react';
import { ThemeId } from '../types/theme';
import { CodeScaffolder } from './CodeScaffolder';
import { SdkTranslator } from './SdkTranslator';
import { CostCalculator } from './CostCalculator';
import { ArchitectureExplorer } from './ArchitectureExplorer';
import { ExportStudio, PrintConfig } from './ExportStudio';

export type WorkbenchTab =
  | 'scaffolder'
  | 'translator'
  | 'calculator'
  | 'architecture'
  | 'export';

interface WorkbenchPanelProps {
  open: boolean;
  activeTab: WorkbenchTab;
  theme: ThemeId;
  onToggleOpen: () => void;
  onSelectTab: (tab: WorkbenchTab) => void;
  onNavigate?: (id: string) => void;
  printConfig: PrintConfig;
  onChangePrintConfig: (next: PrintConfig) => void;
  bookmarks: string[];
  personalNotes: Record<string, string>;
  masteredIds: string[];
  onImportBackup: (data: {
    bookmarks?: string[];
    personalNotes?: Record<string, string>;
    masteredIds?: string[];
  }) => void;
}

const TABS: Array<{
  id: WorkbenchTab;
  label: string;
  shortLabel: string;
  icon: React.FC<{ className?: string }>;
}> = [
  { id: 'scaffolder', label: 'سازنده کد', shortLabel: 'سازنده کد', icon: Code2 },
  { id: 'translator', label: 'مبدل OpenAI ↔ Gemini', shortLabel: 'مبدل کد', icon: ArrowLeftRight },
  { id: 'calculator', label: 'برآوردگر هزینه API', shortLabel: 'هزینه API', icon: Calculator },
  { id: 'architecture', label: 'کاوشگر معماری', shortLabel: 'معماری SDK', icon: Network },
  { id: 'export', label: 'خروجی و پشتیبان', shortLabel: 'خروجی', icon: SlidersHorizontal },
];

export const WorkbenchPanel: React.FC<WorkbenchPanelProps> = ({
  open,
  activeTab,
  theme,
  onToggleOpen,
  onSelectTab,
  onNavigate,
  printConfig,
  onChangePrintConfig,
  bookmarks,
  personalNotes,
  masteredIds,
  onImportBackup,
}) => {
  return (
    <section
      aria-label="میز کار مهندسی تعاملی"
      className="no-print relative my-6 overflow-hidden rounded-lg border"
      style={{
        borderColor: 'var(--border-strong)',
        backgroundColor: 'var(--bg-subtle)',
      }}
    >
      {/* Subtle architectural drafting ticks at top corners */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1.5 right-2 font-mono text-[10px] leading-none select-none"
        style={{ color: 'var(--border-strong)' }}
      >
        +
      </span>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1.5 left-2 font-mono text-[10px] leading-none select-none"
        style={{ color: 'var(--border-strong)' }}
      >
        +
      </span>

      {/* Workbench Header & Tab Bar */}
      <div
        className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5"
        style={{
          borderBottom: open ? '1px solid var(--border-subtle)' : 'none',
        }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="ml-2 text-xs font-extrabold tracking-tight whitespace-nowrap"
            style={{ color: 'var(--text-primary)' }}
          >
            میز کار مهندسی
          </span>

          <div
            className="flex flex-wrap items-center gap-1 rounded-md border p-0.5"
            style={{
              borderColor: 'var(--border-subtle)',
              backgroundColor: 'var(--bg-canvas)',
            }}
          >
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = open && activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    onSelectTab(tab.id);
                    if (!open) onToggleOpen();
                  }}
                  className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded px-2.5 text-xs font-medium transition-colors whitespace-nowrap"
                  style={{
                    backgroundColor: isActive ? 'var(--accent)' : 'transparent',
                    color: isActive ? 'var(--accent-contrast)' : 'var(--text-secondary)',
                  }}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="hidden md:inline">{tab.label}</span>
                  <span className="md:hidden">{tab.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleOpen}
          className="inline-flex h-8 shrink-0 items-center gap-1 self-end rounded-md border px-2.5 text-xs font-medium transition-colors sm:self-auto whitespace-nowrap"
          style={{
            borderColor: 'var(--border-subtle)',
            backgroundColor: 'var(--bg-surface)',
            color: 'var(--text-secondary)',
          }}
        >
          <span>{open ? 'جمع کردن' : 'باز کردن ابزارها'}</span>
          {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Active Tool Canvas */}
      {open && (
        <div
          className="p-4 sm:p-5"
          style={{ backgroundColor: 'var(--bg-canvas)' }}
        >
          {activeTab === 'scaffolder' && <CodeScaffolder />}
          {activeTab === 'translator' && <SdkTranslator />}
          {activeTab === 'calculator' && <CostCalculator />}
          {activeTab === 'architecture' && (
            <ArchitectureExplorer theme={theme} onNavigate={onNavigate} />
          )}
          {activeTab === 'export' && (
            <ExportStudio
              printConfig={printConfig}
              onChangePrintConfig={onChangePrintConfig}
              bookmarks={bookmarks}
              personalNotes={personalNotes}
              masteredIds={masteredIds}
              onImportBackup={onImportBackup}
            />
          )}
        </div>
      )}
    </section>
  );
};
