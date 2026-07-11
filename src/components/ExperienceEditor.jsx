import { Bold, GripVertical, Italic, List, ListOrdered, Plus, Trash2 } from 'lucide-react';
import React, { useRef } from 'react';
import TextInput from './TextInput.jsx';
import { applyInlineStyle, normalizeInlineStyles } from '../utils/richText.js';

const createItem = (prefix) => ({
  id: `${prefix}-${Date.now()}`,
  period: '',
  name: '',
  role: '',
  descriptions: [{ text: '', style: { marker: 'dot', bold: false, italic: false } }],
});

const normalizeDescription = (description) => {
  if (typeof description === 'string') {
    return {
      text: description,
      style: { marker: 'dot', bold: false, italic: false },
      inlineStyles: [],
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
  };
};

const moveItem = (list, fromIndex, toIndex) => {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return list;
  const next = [...list];
  const [removed] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, removed);
  return next;
};

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

export default function ExperienceEditor({
  titlePrefix,
  items,
  onChange,
  nameLabel = '名称',
  roleLabel = '角色',
}) {
  const textareaRefs = useRef(new Map());
  const selectionRefs = useRef(new Map());

  const updateItem = (index, field, value) => {
    onChange(
      items.map((item, currentIndex) =>
        currentIndex === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  const descriptionsFor = (item) => (item.descriptions || ['']).map(normalizeDescription);

  const updateDescription = (itemIndex, descriptionIndex, patch) => {
    const descriptions = descriptionsFor(items[itemIndex]);
    descriptions[descriptionIndex] = {
      ...descriptions[descriptionIndex],
      ...patch,
      style: {
        ...descriptions[descriptionIndex].style,
        ...(patch.style || {}),
      },
    };
    updateItem(itemIndex, 'descriptions', descriptions);
  };

  const applySelectionStyle = (itemIndex, descriptionIndex, styleKey) => {
    const key = `${itemIndex}-${descriptionIndex}`;
    const textarea = textareaRefs.current.get(key);
    if (!textarea) return;

    const cachedSelection = selectionRefs.current.get(key);
    const selectionStart = cachedSelection?.start ?? textarea.selectionStart ?? 0;
    const selectionEnd = cachedSelection?.end ?? textarea.selectionEnd ?? 0;
    if (selectionStart === selectionEnd) {
      window.alert('请先选中需要加粗的文字');
      textarea.focus();
      return;
    }

    const descriptions = descriptionsFor(items[itemIndex]);
    descriptions[descriptionIndex] = applyInlineStyle(
      descriptions[descriptionIndex],
      styleKey,
      selectionStart,
      selectionEnd,
    );
    updateItem(itemIndex, 'descriptions', descriptions);

    window.setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(selectionStart, selectionEnd);
    }, 0);
  };

  const recordSelection = (itemIndex, descriptionIndex) => {
    const key = `${itemIndex}-${descriptionIndex}`;
    const textarea = textareaRefs.current.get(key);
    if (!textarea) return;

    selectionRefs.current.set(key, {
      start: textarea.selectionStart ?? 0,
      end: textarea.selectionEnd ?? 0,
    });
  };

  const handleDescriptionKeyDown = (event, itemIndex, descriptionIndex) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'b') {
      event.preventDefault();
      recordSelection(itemIndex, descriptionIndex);
      applySelectionStyle(itemIndex, descriptionIndex, 'bold');
    }
  };

  const addDescription = (itemIndex) => {
    updateItem(itemIndex, 'descriptions', [
      ...descriptionsFor(items[itemIndex]),
      { text: '', style: { marker: 'dot', bold: false, italic: false } },
    ]);
  };

  const removeDescription = (itemIndex, descriptionIndex) => {
    const descriptions = descriptionsFor(items[itemIndex]).filter(
      (_, currentIndex) => currentIndex !== descriptionIndex,
    );
    updateItem(
      itemIndex,
      'descriptions',
      descriptions.length
        ? descriptions
        : [{ text: '', style: { marker: 'dot', bold: false, italic: false } }],
    );
  };

  const reorderItems = (fromIndex, toIndex) => {
    onChange(moveItem(items, fromIndex, toIndex));
  };

  const reorderDescriptions = (itemIndex, fromIndex, toIndex) => {
    updateItem(itemIndex, 'descriptions', moveItem(descriptionsFor(items[itemIndex]), fromIndex, toIndex));
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

  const handleDescriptionDragStart = (event, itemIndex, descriptionIndex) => {
    event.stopPropagation();
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData(
      'application/x-resume-drag',
      JSON.stringify({ type: 'description', itemIndex, descriptionIndex }),
    );
  };

  const handleDescriptionDrop = (event, itemIndex, targetDescriptionIndex) => {
    event.preventDefault();
    event.stopPropagation();
    const payload = event.dataTransfer.getData('application/x-resume-drag');
    if (!payload) return;

    const parsed = JSON.parse(payload);
    if (parsed.type === 'description' && parsed.itemIndex === itemIndex) {
      reorderDescriptions(itemIndex, parsed.descriptionIndex, targetDescriptionIndex);
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
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">经历描述</span>
              <button
                type="button"
                onClick={() => addDescription(index)}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-resumeBlue transition hover:bg-resumeBlue/10"
              >
                <Plus size={13} />
                增加描述
              </button>
            </div>

            {descriptionsFor(item).map((description, descriptionIndex) => (
              <div
                key={`${item.id}-desc-${descriptionIndex}`}
                className="rounded-md border border-slate-200 bg-white p-2 transition hover:border-slate-300"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => handleDescriptionDrop(event, index, descriptionIndex)}
              >
                <div className="mb-2 flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    draggable
                    onDragStart={(event) => handleDescriptionDragStart(event, index, descriptionIndex)}
                    className="inline-flex h-7 w-7 cursor-grab items-center justify-center rounded text-slate-400 transition hover:bg-slate-100 hover:text-resumeBlue active:cursor-grabbing"
                    title="拖动调整描述顺序"
                    aria-label="拖动调整描述顺序"
                  >
                    <GripVertical size={14} />
                  </button>
                  <FormatButton
                    active={description.inlineStyles.some((range) => range.bold)}
                    title="加粗选中文字"
                    onClick={() => applySelectionStyle(index, descriptionIndex, 'bold')}
                  >
                    <Bold size={13} />
                  </FormatButton>
                  <FormatButton
                    active={description.style.italic}
                    title="斜体"
                    onClick={() =>
                      updateDescription(index, descriptionIndex, {
                        style: { italic: !description.style.italic },
                      })
                    }
                  >
                    <Italic size={13} />
                  </FormatButton>
                  <FormatButton
                    active={description.style.marker === 'dot'}
                    title="黑点"
                    onClick={() =>
                      updateDescription(index, descriptionIndex, {
                        style: { marker: description.style.marker === 'dot' ? 'none' : 'dot' },
                      })
                    }
                  >
                    <List size={13} />
                  </FormatButton>
                  <FormatButton
                    active={description.style.marker === 'number'}
                    title="序号"
                    onClick={() =>
                      updateDescription(index, descriptionIndex, {
                        style: { marker: description.style.marker === 'number' ? 'none' : 'number' },
                      })
                    }
                  >
                    <ListOrdered size={13} />
                  </FormatButton>
                  <button
                    type="button"
                    onClick={() => removeDescription(index, descriptionIndex)}
                    className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                    title="删除描述"
                    aria-label="删除描述"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <textarea
                  ref={(node) => {
                    const key = `${index}-${descriptionIndex}`;
                    if (node) {
                      textareaRefs.current.set(key, node);
                    } else {
                      textareaRefs.current.delete(key);
                      selectionRefs.current.delete(key);
                    }
                  }}
                  value={description.text}
                  rows={2}
                  onSelect={() => recordSelection(index, descriptionIndex)}
                  onKeyDown={(event) => handleDescriptionKeyDown(event, index, descriptionIndex)}
                  onKeyUp={() => recordSelection(index, descriptionIndex)}
                  onMouseUp={() => recordSelection(index, descriptionIndex)}
                  onChange={(event) =>
                    updateDescription(index, descriptionIndex, {
                      text: event.target.value,
                      inlineStyles: normalizeInlineStyles(description.inlineStyles, event.target.value),
                    })
                  }
                  className="w-full resize-y rounded-md border border-slate-200 bg-white px-3 py-2 text-sm leading-6 text-slate-800 outline-none transition hover:border-slate-300 focus:border-resumeBlue focus:ring-2 focus:ring-resumeBlue/15"
                />
              </div>
            ))}
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
