const supportedStyleKeys = new Set(['bold', 'italic']);

export function normalizeInlineStyles(inlineStyles = [], text = '') {
  const length = text.length;

  return (inlineStyles || [])
    .map((range) => ({
      start: Math.max(0, Math.min(length, Number(range.start) || 0)),
      end: Math.max(0, Math.min(length, Number(range.end) || 0)),
      bold: Boolean(range.bold),
      italic: Boolean(range.italic),
    }))
    .filter((range) => range.end > range.start && (range.bold || range.italic))
    .sort((left, right) => left.start - right.start || left.end - right.end);
}

export function applyInlineStyle(description, styleKey, selectionStart, selectionEnd) {
  if (!supportedStyleKeys.has(styleKey)) return description;

  const text = description?.text || '';
  const start = Math.max(0, Math.min(text.length, Math.min(selectionStart, selectionEnd)));
  const end = Math.max(0, Math.min(text.length, Math.max(selectionStart, selectionEnd)));
  if (start === end) return description;

  const ranges = normalizeInlineStyles(description.inlineStyles, text);
  const sameRangeIndex = ranges.findIndex(
    (range) => range.start === start && range.end === end && Boolean(range[styleKey]),
  );

  const nextRanges =
    sameRangeIndex >= 0
      ? ranges.filter((_, index) => index !== sameRangeIndex)
      : [...ranges, { start, end, [styleKey]: true }];

  return {
    ...description,
    style: {
      marker: description?.style?.marker || 'dot',
      bold: Boolean(description?.style?.bold),
      italic: Boolean(description?.style?.italic),
    },
    inlineStyles: normalizeInlineStyles(nextRanges, text),
  };
}

export function splitTextByInlineStyles(text = '', inlineStyles = []) {
  const ranges = normalizeInlineStyles(inlineStyles, text);
  if (!ranges.length) {
    return text ? [{ text, bold: false, italic: false }] : [];
  }

  const boundaries = new Set([0, text.length]);
  ranges.forEach((range) => {
    boundaries.add(range.start);
    boundaries.add(range.end);
  });

  const sortedBoundaries = [...boundaries].sort((left, right) => left - right);

  return sortedBoundaries
    .slice(0, -1)
    .map((start, index) => {
      const end = sortedBoundaries[index + 1];
      const activeRanges = ranges.filter((range) => range.start < end && range.end > start);

      return {
        text: text.slice(start, end),
        bold: activeRanges.some((range) => range.bold),
        italic: activeRanges.some((range) => range.italic),
      };
    })
    .filter((part) => part.text);
}
