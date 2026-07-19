import assert from 'node:assert/strict';
import {
  applyInlineStyle,
  descriptionsToTextBlock,
  normalizeInlineStyles,
  reconcileInlineStylesForTextChange,
  splitTextByInlineStyles,
  splitTextBlockLines,
  toggleBulletForLine,
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
  const description = {
    text: '项目背景从高中模拟考试',
    inlineStyles: [{ start: 0, end: 5, bold: true }],
  };

  const next = applyInlineStyle(description, 'bold', 0, 4);

  assert.deepEqual(next.inlineStyles, [{ start: 0, end: 4, bold: true, italic: false }]);
  assert.deepEqual(splitTextByInlineStyles(next.text, next.inlineStyles), [
    { text: '项目背景', bold: true, italic: false },
    { text: '从高中模拟考试', bold: false, italic: false },
  ]);
}

{
  const oldText = '项目背景从高中模拟考试';
  const newText = '这段项目背景从高中模拟考试';
  const inlineStyles = reconcileInlineStylesForTextChange(oldText, newText, [
    { start: 0, end: 4, bold: true },
  ]);

  assert.deepEqual(inlineStyles, [{ start: 2, end: 6, bold: true, italic: false }]);
  assert.equal(newText.slice(inlineStyles[0].start, inlineStyles[0].end), '项目背景');
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

{
  const block = descriptionsToTextBlock([
    {
      text: '项目背景：校园餐饮选择成本高',
      style: { marker: 'none', bold: false, italic: false },
    },
    {
      text: '需求拆解与产品规划：完成 MVP 规划',
      style: { marker: 'dot', bold: false, italic: false },
      inlineStyles: [{ start: 0, end: '需求拆解与产品规划'.length, bold: true }],
    },
    {
      text: '项目产出：推荐接受率提升',
      style: { marker: 'number', bold: false, italic: false },
    },
  ]);

  assert.equal(
    block.text,
    '项目背景：校园餐饮选择成本高\n• 需求拆解与产品规划：完成 MVP 规划\n3. 项目产出：推荐接受率提升',
  );
  assert.equal(block.text.slice(block.inlineStyles[0].start, block.inlineStyles[0].end), '需求拆解与产品规划');
  assert.deepEqual(block.inlineStyles[0], {
    start: block.text.indexOf('需求拆解与产品规划'),
    end: block.text.indexOf('需求拆解与产品规划') + '需求拆解与产品规划'.length,
    bold: true,
    italic: false,
  });
}

{
  const result = toggleBulletForLine('项目背景：测试\n需求拆解：测试', 3, 3, []);

  assert.equal(result.text, '• 项目背景：测试\n需求拆解：测试');
  assert.equal(result.selectionStart, 5);
  assert.equal(result.selectionEnd, 5);
}

{
  const result = toggleBulletForLine('项目背景：测试\n• 需求拆解：测试', 10, 10, [
    { start: 10, end: 12, bold: true },
  ]);

  assert.equal(result.text, '项目背景：测试\n需求拆解：测试');
  assert.deepEqual(result.inlineStyles, [{ start: 8, end: 10, bold: true, italic: false }]);
}

{
  const lines = splitTextBlockLines('项目背景：测试\n• 需求拆解：测试', [
    { start: 10, end: 12, bold: true },
  ]);

  assert.equal(lines[0].marker, 'none');
  assert.equal(lines[0].text, '项目背景：测试');
  assert.equal(lines[1].marker, 'dot');
  assert.equal(lines[1].text, '需求拆解：测试');
  assert.deepEqual(lines[1].inlineStyles, [{ start: 0, end: 2, bold: true, italic: false }]);
}

console.log('rich text tests passed');
