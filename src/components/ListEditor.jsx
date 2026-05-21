import { Plus, Trash2 } from 'lucide-react';
import React from 'react';

export default function ListEditor({ items = [], onChange, addLabel = '增加一条', placeholder = '' }) {
  const safeItems = items.length ? items : [''];

  const updateItem = (index, value) => {
    onChange(safeItems.map((item, currentIndex) => (currentIndex === index ? value : item)));
  };

  const addItem = () => onChange([...safeItems, '']);
  const removeItem = (index) => {
    const next = safeItems.filter((_, currentIndex) => currentIndex !== index);
    onChange(next.length ? next : ['']);
  };

  return (
    <div className="space-y-3">
      {safeItems.map((item, index) => (
        <div key={`list-item-${index}`} className="grid grid-cols-[1fr_34px] gap-2">
          <textarea
            value={item}
            rows={2}
            placeholder={placeholder}
            onChange={(event) => updateItem(index, event.target.value)}
            className="w-full resize-y rounded-md border border-slate-200 bg-white px-3 py-2 text-sm leading-6 text-slate-800 outline-none transition hover:border-slate-300 focus:border-resumeBlue focus:ring-2 focus:ring-resumeBlue/15"
          />
          <button
            type="button"
            onClick={() => removeItem(index)}
            className="inline-flex h-9 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-600"
            title="删除"
            aria-label="删除"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addItem}
        className="inline-flex items-center gap-2 rounded-md border border-dashed border-resumeBlue/40 px-3 py-2 text-sm font-medium text-resumeBlue transition hover:border-resumeBlue hover:bg-resumeBlue/5"
      >
        <Plus size={16} />
        {addLabel}
      </button>
    </div>
  );
}
