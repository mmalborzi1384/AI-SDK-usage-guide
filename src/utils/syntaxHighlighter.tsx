import React from 'react';

const PYTHON_KEYWORDS = new Set([
  'import',
  'from',
  'as',
  'def',
  'async',
  'await',
  'class',
  'return',
  'if',
  'elif',
  'else',
  'for',
  'in',
  'while',
  'try',
  'except',
  'finally',
  'with',
  'raise',
  'pass',
  'break',
  'continue',
  'yield',
  'lambda',
  'and',
  'or',
  'not',
  'is',
]);

const PYTHON_CONSTANTS = new Set(['True', 'False', 'None']);

const PYTHON_BUILTINS = new Set([
  'print',
  'open',
  'len',
  'range',
  'getattr',
  'setattr',
  'isinstance',
  'type',
  'list',
  'dict',
  'set',
  'tuple',
  'str',
  'int',
  'float',
  'bool',
  'bytes',
  'Exception',
  'RuntimeError',
  'ValueError',
]);

const BASH_COMMANDS = new Set(['pip', 'export', 'echo', 'python', 'python3', 'npm', 'git']);

function renderFString(raw: string, keyPrefix: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /(\{[^}]+\})/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;

  while ((m = regex.exec(raw)) !== null) {
    if (m.index > last) {
      parts.push(
        <span key={`${keyPrefix}-s-${i++}`} style={{ color: 'var(--syn-str)' }}>
          {raw.slice(last, m.index)}
        </span>
      );
    }
    parts.push(
      <span key={`${keyPrefix}-v-${i++}`} style={{ color: 'var(--syn-fvar)' }}>
        {m[0]}
      </span>
    );
    last = m.index + m[0].length;
  }

  if (last < raw.length) {
    parts.push(
      <span key={`${keyPrefix}-e-${i++}`} style={{ color: 'var(--syn-str)' }}>
        {raw.slice(last)}
      </span>
    );
  }

  return <>{parts}</>;
}

function splitComment(line: string): [string, string] {
  let inSingle = false;
  let inDouble = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    const prev = i > 0 ? line[i - 1] : '';
    if (ch === "'" && !inDouble && prev !== '\\') inSingle = !inSingle;
    else if (ch === '"' && !inSingle && prev !== '\\') inDouble = !inDouble;
    else if (ch === '#' && !inSingle && !inDouble) {
      return [line.slice(0, i), line.slice(i)];
    }
  }
  return [line, ''];
}

function highlightPythonLine(line: string, lineIndex: number): React.ReactNode[] {
  const [codePart, commentPart] = splitComment(line);
  const tokens: React.ReactNode[] = [];

  const tokenRegex =
    /(f?"(?:\\.|[^"\\])*"|f?'(?:\\.|[^'\\])*'|@[A-Za-z_][A-Za-z0-9_.]*|\b\d+(?:_\d+)*(?:\.\d+)?\b|\b[A-Za-z_][A-Za-z0-9_]*\b|[=+\-*/<>!&|:%]+|[()[\]{}.,:])/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let idx = 0;

  while ((match = tokenRegex.exec(codePart)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(
        <span key={`w-${lineIndex}-${idx++}`} style={{ color: 'var(--syn-text)' }}>
          {codePart.slice(lastIndex, match.index)}
        </span>
      );
    }

    const value = match[0];
    const nextChar = codePart[match.index + value.length] ?? '';
    const nextTwo = codePart.slice(match.index + value.length, match.index + value.length + 2);
    const prevSlice = codePart.slice(0, match.index).trimEnd();
    const isAfterDefOrClass = /\b(def|class)$/.test(prevSlice);

    if (value.startsWith('f"') || value.startsWith("f'")) {
      tokens.push(
        <React.Fragment key={`fs-${lineIndex}-${idx++}`}>
          {renderFString(value, `${lineIndex}-${idx}`)}
        </React.Fragment>
      );
    } else if (value.startsWith('"') || value.startsWith("'")) {
      tokens.push(
        <span key={`s-${lineIndex}-${idx++}`} style={{ color: 'var(--syn-str)' }}>
          {value}
        </span>
      );
    } else if (value.startsWith('@')) {
      tokens.push(
        <span key={`d-${lineIndex}-${idx++}`} className="font-medium" style={{ color: 'var(--syn-dec)' }}>
          {value}
        </span>
      );
    } else if (/^\d/.test(value)) {
      tokens.push(
        <span key={`n-${lineIndex}-${idx++}`} style={{ color: 'var(--syn-num)' }}>
          {value}
        </span>
      );
    } else if (PYTHON_KEYWORDS.has(value)) {
      tokens.push(
        <span key={`k-${lineIndex}-${idx++}`} className="font-semibold" style={{ color: 'var(--syn-kw)' }}>
          {value}
        </span>
      );
    } else if (PYTHON_CONSTANTS.has(value)) {
      tokens.push(
        <span key={`b-${lineIndex}-${idx++}`} className="font-semibold" style={{ color: 'var(--syn-num)' }}>
          {value}
        </span>
      );
    } else if (/^[A-Za-z_]/.test(value)) {
      if (isAfterDefOrClass) {
        tokens.push(
          <span key={`fn-${lineIndex}-${idx++}`} className="font-semibold" style={{ color: 'var(--syn-fn)' }}>
            {value}
          </span>
        );
      } else if (nextChar === '=' && nextTwo !== '==') {
        // Keyword argument like model=, input=, thinking_budget=
        tokens.push(
          <span key={`arg-${lineIndex}-${idx++}`} style={{ color: 'var(--syn-arg)' }}>
            {value}
          </span>
        );
      } else if (nextChar === '(') {
        // Function or method call / constructor
        const isConstructor = /^[A-Z]/.test(value);
        tokens.push(
          <span
            key={`call-${lineIndex}-${idx++}`}
            style={{ color: isConstructor ? 'var(--syn-type)' : 'var(--syn-fn)' }}
          >
            {value}
          </span>
        );
      } else if (/^[A-Z][A-Za-z0-9_]*$/.test(value) || PYTHON_BUILTINS.has(value)) {
        tokens.push(
          <span key={`t-${lineIndex}-${idx++}`} style={{ color: 'var(--syn-type)' }}>
            {value}
          </span>
        );
      } else {
        tokens.push(
          <span key={`id-${lineIndex}-${idx++}`} style={{ color: 'var(--syn-text)' }}>
            {value}
          </span>
        );
      }
    } else {
      tokens.push(
        <span key={`op-${lineIndex}-${idx++}`} style={{ color: 'var(--syn-op)' }}>
          {value}
        </span>
      );
    }

    lastIndex = match.index + value.length;
  }

  if (lastIndex < codePart.length) {
    tokens.push(
      <span key={`tail-${lineIndex}-${idx++}`} style={{ color: 'var(--syn-text)' }}>
        {codePart.slice(lastIndex)}
      </span>
    );
  }

  if (commentPart) {
    tokens.push(
      <span key={`c-${lineIndex}-${idx++}`} className="italic" style={{ color: 'var(--syn-comment)' }}>
        {commentPart}
      </span>
    );
  }

  return tokens.length > 0 ? tokens : ['\u00A0'];
}

function highlightBashLine(line: string, lineIndex: number): React.ReactNode[] {
  const [codePart, commentPart] = splitComment(line);
  const tokens: React.ReactNode[] = [];

  const tokenRegex =
    /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|--?[A-Za-z0-9_-]+|\b[A-Z][A-Z0-9_]{2,}\b|\b[a-z][a-z0-9_-]*\b|[=|>]+)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let idx = 0;

  while ((match = tokenRegex.exec(codePart)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(
        <span key={`bw-${lineIndex}-${idx++}`} style={{ color: 'var(--syn-text)' }}>
          {codePart.slice(lastIndex, match.index)}
        </span>
      );
    }
    const value = match[0];
    if (value.startsWith('"') || value.startsWith("'")) {
      tokens.push(
        <span key={`bs-${lineIndex}-${idx++}`} style={{ color: 'var(--syn-str)' }}>
          {value}
        </span>
      );
    } else if (value.startsWith('-')) {
      tokens.push(
        <span key={`bf-${lineIndex}-${idx++}`} style={{ color: 'var(--syn-arg)' }}>
          {value}
        </span>
      );
    } else if (/^[A-Z][A-Z0-9_]{2,}$/.test(value)) {
      tokens.push(
        <span key={`be-${lineIndex}-${idx++}`} className="font-medium" style={{ color: 'var(--syn-type)' }}>
          {value}
        </span>
      );
    } else if (BASH_COMMANDS.has(value)) {
      tokens.push(
        <span key={`bc-${lineIndex}-${idx++}`} className="font-semibold" style={{ color: 'var(--syn-kw)' }}>
          {value}
        </span>
      );
    } else if (/^[=|>]+$/.test(value)) {
      tokens.push(
        <span key={`bo-${lineIndex}-${idx++}`} style={{ color: 'var(--syn-op)' }}>
          {value}
        </span>
      );
    } else {
      tokens.push(
        <span key={`bi-${lineIndex}-${idx++}`} style={{ color: 'var(--syn-fn)' }}>
          {value}
        </span>
      );
    }
    lastIndex = match.index + value.length;
  }

  if (lastIndex < codePart.length) {
    tokens.push(
      <span key={`bt-${lineIndex}-${idx++}`} style={{ color: 'var(--syn-text)' }}>
        {codePart.slice(lastIndex)}
      </span>
    );
  }

  if (commentPart) {
    tokens.push(
      <span key={`bm-${lineIndex}-${idx++}`} className="italic" style={{ color: 'var(--syn-comment)' }}>
        {commentPart}
      </span>
    );
  }

  return tokens.length > 0 ? tokens : ['\u00A0'];
}

export function highlightCodeLine(
  line: string,
  language: 'python' | 'bash',
  lineIndex: number
): React.ReactNode[] {
  return language === 'bash'
    ? highlightBashLine(line, lineIndex)
    : highlightPythonLine(line, lineIndex);
}
