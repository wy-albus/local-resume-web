import { ChevronDown, ChevronRight } from 'lucide-react';
import React from 'react';

export default function EditorCard({ title, children, open, onToggle, action }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <button
          type="button"
          onClick={onToggle}
          className="flex items-center gap-2 text-left text-sm font-semibold text-slate-800 transition hover:text-resumeBlue"
        >
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          {title}
        </button>
        {action}
      </div>
      {open && <div className="space-y-4 p-4">{children}</div>}
    </section>
  );
}
