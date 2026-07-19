import { Bold, Italic, List } from 'lucide-react';
import React, { useRef } from 'react';
import {
  applyInlineStyle,
  normalizeInlineStyles,
  reconcileInlineStylesForTextChange,
  toggleBulletForLine,
} from '../utils/richText.js';

function FormatButton({ active, title, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`inline-flex h-7 w-7 items-center justify-center rounded border text-xs transition ${
        active
          ? 'border-resumeBlue bg-resumeBlue text-white'
          : 'border-slate-200 bg-white text-slate-500 hover:border-resumeBlue hover:text-resumeBlue'
      }`}
    >
      {children}
    </button>
  );
}

export default function RichTextBlockEditor({
  label,
  helperText,
  value = '',
  inlineStyles = [],
  onChange,
  rows = 6,
  placeholder = '',
}) {
  const textareaRef = useRef(null);
  const selectionRef = useRef({ start: 0, end: 0 });
  const normalizedStyles = normalizeInlineStyles(inlineStyles, value);

  const recordSelection = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    selectionRef.current = {
      start: textarea.selectionStart ?? 0,
      end: textarea.selectionEnd ?? 0,
    };
  };

  const updateValue = (nextText, nextInlineStyles) => {
    onChange({
      text: nextText,
      inlineStyles: normalizeInlineStyles(nextInlineStyles, nextText),
    });
  };

  const applySelectionStyle = (styleKey) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const selectionStart = selectionRef.current?.start ?? textarea.selectionStart ?? 0;
    const selectionEnd = selectionRef.current?.end ?? textarea.selectionEnd ?? 0;
    if (selectionStart === selectionEnd) {
      window.alert('请先选中需要设置样式的文字');
      textarea.focus();
      return;
    }

    const nextBlock = applyInlineStyle(
      { text: value, inlineStyles: normalizedStyles },
      styleKey,
      selectionStart,
      selectionEnd,
    );
    updateValue(nextBlock.text, nextBlock.inlineStyles);

    window.setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(selectionStart, selectionEnd);
    }, 0);
  };

  const toggleCurrentLineBullet = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const nextBlock = toggleBulletForLine(
      value,
      selectionRef.current?.start ?? textarea.selectionStart ?? 0,
      selectionRef.current?.end ?? textarea.selectionEnd ?? 0,
      normalizedStyles,
    );

    updateValue(nextBlock.text, nextBlock.inlineStyles);
    selectionRef.current = {
      start: nextBlock.selectionStart,
      end: nextBlock.selectionEnd,
    };

    window.setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(nextBlock.selectionStart, nextBlock.selectionEnd);
    }, 0);
  };

  const handleKeyDown = (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'b') {
      event.preventDefault();
      recordSelection();
      applySelectionStyle('bold');
    }
  };

  return (
    <div className="space-y-2">
      {(label || helperText) && (
        <div className="flex items-center justify-between gap-3">
          {label && <span className="text-xs font-medium text-slate-600">{label}</span>}
          {helperText && <span className="text-xs text-slate-400">{helperText}</span>}
        </div>
      )}

      <div className="rounded-md border border-slate-200 bg-white p-2 transition hover:border-slate-300">
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          <FormatButton
            active={normalizedStyles.some((range) => range.bold)}
            title="加粗选中文字"
            onClick={() => applySelectionStyle('bold')}
          >
            <Bold size={13} />
          </FormatButton>
          <FormatButton
            active={normalizedStyles.some((range) => range.italic)}
            title="斜体选中文字"
            onClick={() => applySelectionStyle('italic')}
          >
            <Italic size={13} />
          </FormatButton>
          <FormatButton active={false} title="切换当前行黑点" onClick={toggleCurrentLineBullet}>
            <List size={13} />
          </FormatButton>
        </div>
        <textarea
          ref={textareaRef}
          value={value}
          rows={rows}
          placeholder={placeholder}
          onSelect={recordSelection}
          onKeyDown={handleKeyDown}
          onKeyUp={recordSelection}
          onMouseUp={recordSelection}
          onChange={(event) =>
            updateValue(
              event.target.value,
              reconcileInlineStylesForTextChange(value, event.target.value, normalizedStyles),
            )
          }
          className="w-full resize-y rounded-md border border-slate-200 bg-white px-3 py-2 text-sm leading-6 text-slate-800 outline-none transition hover:border-slate-300 focus:border-resumeBlue focus:ring-2 focus:ring-resumeBlue/15"
        />
      </div>
    </div>
  );
}
