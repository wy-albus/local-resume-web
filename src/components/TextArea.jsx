import React from 'react';

export default function TextArea({ label, value, onChange, placeholder, rows = 4 }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-600">{label}</span>
      <textarea
        value={value || ''}
        rows={rows}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full resize-y rounded-md border border-slate-200 bg-white px-3 py-2 text-sm leading-6 text-slate-800 outline-none transition hover:border-slate-300 focus:border-resumeBlue focus:ring-2 focus:ring-resumeBlue/15"
      />
    </label>
  );
}
