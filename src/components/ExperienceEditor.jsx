import { GripVertical, Plus, Trash2 } from 'lucide-react';
import React from 'react';
import RichTextBlockEditor from './RichTextBlockEditor.jsx';
import TextInput from './TextInput.jsx';
import {
  descriptionsToTextBlock,
  normalizeInlineStyles,
} from '../utils/richText.js';

const createItem = (prefix) => ({
  id: `${prefix}-${Date.now()}`,
  period: '',
  name: '',
  role: '',
  descriptionText: '',
  descriptionInlineStyles: [],
  descriptions: [{ text: '', style: { marker: 'dot', bold: false, italic: false } }],
});

const moveItem = (list, fromIndex, toIndex) => {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return list;
  const next = [...list];
  const [removed] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, removed);
  return next;
};

export default function ExperienceEditor({
  titlePrefix,
  items,
  onChange,
  nameLabel = '名称',
  roleLabel = '角色',
}) {
  const updateItem = (index, field, value) => {
    onChange(
      items.map((item, currentIndex) =>
        currentIndex === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  const textBlockFor = (item) => {
    if (typeof item.descriptionText === 'string') {
      return {
        text: item.descriptionText,
        inlineStyles: normalizeInlineStyles(item.descriptionInlineStyles, item.descriptionText),
      };
    }

    return descriptionsToTextBlock(item.descriptions || []);
  };

  const updateTextBlock = (itemIndex, text, inlineStyles) => {
    onChange(
      items.map((item, currentIndex) =>
        currentIndex === itemIndex
          ? {
              ...item,
              descriptionText: text,
              descriptionInlineStyles: normalizeInlineStyles(inlineStyles, text),
            }
          : item,
      ),
    );
  };

  const reorderItems = (fromIndex, toIndex) => {
    onChange(moveItem(items, fromIndex, toIndex));
  };

  const addItem = () => onChange([...items, createItem(titlePrefix)]);
  const removeItem = (index) => onChange(items.filter((_, currentIndex) => currentIndex !== index));

  const handleItemDragStart = (event, index) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('application/x-resume-drag', JSON.stringify({ type: 'item', index }));
  };

  const handleItemDrop = (event, targetIndex) => {
    event.preventDefault();
    const payload = event.dataTransfer.getData('application/x-resume-drag');
    if (!payload) return;

    const parsed = JSON.parse(payload);
    if (parsed.type === 'item') {
      reorderItems(parsed.index, targetIndex);
    }
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div
          key={item.id}
          className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 transition hover:border-slate-300"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => handleItemDrop(event, index)}
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                draggable
                onDragStart={(event) => handleItemDragStart(event, index)}
                className="inline-flex h-8 w-8 cursor-grab items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-resumeBlue active:cursor-grabbing"
                title={`拖动调整${titlePrefix}顺序`}
                aria-label={`拖动调整${titlePrefix}顺序`}
              >
                <GripVertical size={16} />
              </button>
              <span className="text-sm font-semibold text-slate-700">
                {titlePrefix} {index + 1}
              </span>
            </div>
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-600"
              title={`删除${titlePrefix}`}
              aria-label={`删除${titlePrefix}`}
            >
              <Trash2 size={16} />
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <TextInput label="起止时间" value={item.period} onChange={(value) => updateItem(index, 'period', value)} />
            <TextInput label={roleLabel} value={item.role} onChange={(value) => updateItem(index, 'role', value)} />
            <div className="sm:col-span-2">
              <TextInput label={nameLabel} value={item.name} onChange={(value) => updateItem(index, 'name', value)} />
            </div>
          </div>

          <div className="mt-3 space-y-2">
            <RichTextBlockEditor
              label="经历描述"
              helperText="可自由输入项目背景、项目产出或黑点描述"
              value={textBlockFor(item).text}
              inlineStyles={textBlockFor(item).inlineStyles}
              rows={6}
              placeholder="项目背景：...\n• 需求拆解与产品规划：...\n项目产出：..."
              onChange={(block) => updateTextBlock(index, block.text, block.inlineStyles)}
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addItem}
        className="inline-flex items-center gap-2 rounded-md border border-dashed border-resumeBlue/40 px-3 py-2 text-sm font-medium text-resumeBlue transition hover:border-resumeBlue hover:bg-resumeBlue/5"
      >
        <Plus size={16} />
        新增一条
      </button>
    </div>
  );
}
