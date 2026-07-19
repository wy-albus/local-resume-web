import React from 'react';
import RichTextBlockEditor from './RichTextBlockEditor.jsx';
import {
  listItemsToTextBlock,
  normalizeInlineStyles,
  textBlockToListItems,
} from '../utils/richText.js';

export default function SkillsEditor({ resume, onChange }) {
  const block =
    typeof resume.skillsText === 'string'
      ? {
          text: resume.skillsText,
          inlineStyles: normalizeInlineStyles(resume.skillsInlineStyles, resume.skillsText),
        }
      : listItemsToTextBlock(resume.skills || []);

  return (
    <RichTextBlockEditor
      label="技能特长"
      helperText="可选中文字加粗，也可切换当前行黑点"
      value={block.text}
      inlineStyles={block.inlineStyles}
      rows={7}
      placeholder="• 技能特长：熟悉需求分析、PRD 撰写、原型设计\n• 工具能力：熟悉 Excel、Python、SQL"
      onChange={(nextBlock) =>
        onChange({
          skillsText: nextBlock.text,
          skillsInlineStyles: nextBlock.inlineStyles,
          skills: textBlockToListItems(nextBlock.text),
        })
      }
    />
  );
}
