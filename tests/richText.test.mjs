import assert from 'node:assert/strict';
import {
  applyInlineStyle,
  normalizeInlineStyles,
  splitTextByInlineStyles,
} from '../src/utils/richText.js';

{
  const description = {
    text: '负责需求分析和产品设计',
    style: { marker: 'dot', bold: false, italic: false },
  };

  const next = applyInlineStyle(description, 'bold', 2, 6);

  assert.deepEqual(next.inlineStyles, [{ start: 2, end: 6, bold: true, italic: false }]);
  assert.equal(next.style.bold, false);
}

{
  const description = {
    text: '负责需求分析和产品设计',
    inlineStyles: [{ start: 2, end: 6, bold: true }],
  };

  const next = applyInlineStyle(description, 'bold', 2, 6);

  assert.deepEqual(next.inlineStyles, []);
}

{
  const ranges = normalizeInlineStyles(
    [
      { start: 7, end: 200, bold: true },
      { start: 0, end: 0, bold: true },
      { start: 3, end: 1, bold: true },
    ],
    'abcdefghi',
  );

  assert.deepEqual(ranges, [{ start: 7, end: 9, bold: true, italic: false }]);
}

{
  const parts = splitTextByInlineStyles('负责需求分析', [{ start: 2, end: 6, bold: true }]);

  assert.deepEqual(parts, [
    { text: '负责', bold: false, italic: false },
    { text: '需求分析', bold: true, italic: false },
  ]);
}

console.log('rich text tests passed');
