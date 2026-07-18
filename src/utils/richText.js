const supportedStyleKeys = new Set(['bold', 'italic']);
const bulletPrefix = '• ';

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

function normalizeDescription(description, index = 0) {
  if (typeof description === 'string') {
    return {
      text: description,
      style: { marker: 'dot', bold: false, italic: false },
      inlineStyles: [],
      index,
    };
  }

  return {
    text: description?.text || '',
    style: {
      marker: description?.style?.marker || 'dot',
      bold: Boolean(description?.style?.bold),
      italic: Boolean(description?.style?.italic),
    },
    inlineStyles: normalizeInlineStyles(description?.inlineStyles, description?.text || ''),
    index,
  };
}

export function descriptionsToTextBlock(descriptions = []) {
  const normalized = (descriptions || []).map(normalizeDescription).filter((item) => item.text);
  const lines = [];
  const inlineStyles = [];
  let offset = 0;

  normalized.forEach((description, index) => {
    const marker = description.style.marker;
    const prefix = marker === 'dot' ? bulletPrefix : marker === 'number' ? `${index + 1}. ` : '';
    const line = `${prefix}${description.text}`;

    if (description.style.bold || description.style.italic) {
      inlineStyles.push({
        start: offset + prefix.length,
        end: offset + prefix.length + description.text.length,
        bold: description.style.bold,
        italic: description.style.italic,
      });
    }

    description.inlineStyles.forEach((range) => {
      inlineStyles.push({
        ...range,
        start: offset + prefix.length + range.start,
        end: offset + prefix.length + range.end,
      });
    });

    lines.push(line);
    offset += line.length + 1;
  });

  return {
    text: lines.join('\n'),
    inlineStyles: normalizeInlineStyles(inlineStyles, lines.join('\n')),
  };
}

function shiftInlineStyles(inlineStyles, text, position, delta) {
  return normalizeInlineStyles(
    (inlineStyles || []).map((range) => ({
      ...range,
      start: range.start >= position ? range.start + delta : range.start,
      end: range.end >= position ? range.end + delta : range.end,
    })),
    text,
  );
}

export function toggleBulletForLine(text = '', selectionStart = 0, selectionEnd = selectionStart, inlineStyles = []) {
  const safeStart = Math.max(0, Math.min(text.length, selectionStart));
  const safeEnd = Math.max(0, Math.min(text.length, selectionEnd));
  const lineStart = text.lastIndexOf('\n', safeStart - 1) + 1;
  const hasBullet = text.slice(lineStart, lineStart + bulletPrefix.length) === bulletPrefix;

  if (hasBullet) {
    const nextText = `${text.slice(0, lineStart)}${text.slice(lineStart + bulletPrefix.length)}`;
    return {
      text: nextText,
      selectionStart: Math.max(lineStart, safeStart - bulletPrefix.length),
      selectionEnd: Math.max(lineStart, safeEnd - bulletPrefix.length),
      inlineStyles: shiftInlineStyles(inlineStyles, nextText, lineStart + bulletPrefix.length, -bulletPrefix.length),
    };
  }

  const nextText = `${text.slice(0, lineStart)}${bulletPrefix}${text.slice(lineStart)}`;
  return {
    text: nextText,
    selectionStart: safeStart + bulletPrefix.length,
    selectionEnd: safeEnd + bulletPrefix.length,
    inlineStyles: shiftInlineStyles(inlineStyles, nextText, lineStart, bulletPrefix.length),
  };
}

export function splitTextBlockLines(text = '', inlineStyles = []) {
  const normalizedStyles = normalizeInlineStyles(inlineStyles, text);
  let offset = 0;

  return text
    .split('\n')
    .map((line) => {
      const hasBullet = line.startsWith(bulletPrefix);
      const visibleText = hasBullet ? line.slice(bulletPrefix.length) : line;
      const visibleStart = offset + (hasBullet ? bulletPrefix.length : 0);
      const visibleEnd = offset + line.length;
      const lineStyles = normalizedStyles
        .filter((range) => range.start < visibleEnd && range.end > visibleStart)
        .map((range) => ({
          ...range,
          start: Math.max(range.start, visibleStart) - visibleStart,
          end: Math.min(range.end, visibleEnd) - visibleStart,
        }));

      offset += line.length + 1;

      return {
        marker: hasBullet ? 'dot' : 'none',
        text: visibleText,
        inlineStyles: normalizeInlineStyles(lineStyles, visibleText),
      };
    })
    .filter((line) => line.text.trim());
}
