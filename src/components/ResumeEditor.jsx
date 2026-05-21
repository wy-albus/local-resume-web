import { ImagePlus, Plus, Trash2 } from 'lucide-react';
import React from 'react';
import EditorCard from './EditorCard.jsx';
import ExperienceEditor from './ExperienceEditor.jsx';
import ListEditor from './ListEditor.jsx';
import TextArea from './TextArea.jsx';
import TextInput from './TextInput.jsx';

const createBasicField = () => ({
  id: `basic-field-${Date.now()}`,
  label: '',
  value: '',
});

const createExperienceItem = (prefix) => ({
  id: `${prefix}-${Date.now()}`,
  period: '',
  name: '',
  role: '',
  descriptions: [{ text: '', style: { marker: 'dot', bold: false, italic: false } }],
});

const basicFields = [
  { key: 'name', label: '姓名' },
  { key: 'targetRole', label: '求职岗位' },
  { key: 'age', label: '年龄' },
  { key: 'gender', label: '性别' },
  { key: 'ethnicity', label: '民族' },
  { key: 'hometown', label: '籍贯' },
  { key: 'phone', label: '电话' },
  { key: 'email', label: '邮箱' },
];

const educationFields = [
  { key: 'period', label: '起止时间' },
  { key: 'school', label: '学校' },
  { key: 'major', label: '专业' },
  { key: 'degree', label: '学历' },
  { key: 'gpa', label: '专业成绩' },
];

const moduleConfigs = [
  { key: 'education', title: '教育背景' },
  { key: 'projects', title: '项目经验' },
  { key: 'internships', title: '实习经历' },
  { key: 'campus', title: '校园经历' },
  { key: 'skills', title: '技能特长' },
  { key: 'honors', title: '荣誉证书' },
  { key: 'summary', title: '自我评价' },
];

function DeleteSectionButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-400 transition hover:bg-red-50 hover:text-red-600"
      title="删除整个模块"
      aria-label="删除整个模块"
    >
      <Trash2 size={14} />
      删除
    </button>
  );
}

function RangeInput({ label, min, max, step = 1, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-500">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-resumeBlue"
      />
    </label>
  );
}

export default function ResumeEditor({ resume, setResume, openSections, setOpenSections, saveStatus }) {
  const toggleSection = (key) => {
    setOpenSections((current) => ({ ...current, [key]: !current[key] }));
  };

  const updateGroup = (group, field, value) => {
    setResume((current) => ({
      ...current,
      [group]: {
        ...(current[group] || {}),
        [field]: value,
      },
    }));
  };

  const updateRoot = (field, value) => {
    setResume((current) => ({ ...current, [field]: value }));
  };

  const hideSection = (section) => {
    setResume((current) => ({
      ...current,
      meta: {
        ...current.meta,
        hiddenSections: [...new Set([...(current.meta?.hiddenSections || []), section])],
      },
    }));
  };

  const showSection = (section) => {
    setResume((current) => {
      const next = {
        ...current,
        meta: {
          ...current.meta,
          hiddenSections: (current.meta?.hiddenSections || []).filter((item) => item !== section),
        },
      };

      if (section === 'internships' && !(next.internships || []).length) {
        next.internships = [createExperienceItem('internship')];
      }

      return next;
    });
    setOpenSections((current) => ({ ...current, [section]: true }));
  };

  const handleAvatarUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setResume((current) => ({
        ...current,
        basic: {
          ...current.basic,
          avatar: reader.result,
          avatarFit: current.basic?.avatarFit || { x: 50, y: 50, scale: 1 },
        },
      }));
    };
    reader.readAsDataURL(file);
  };

  const updateAvatarFit = (field, value) => {
    updateGroup('basic', 'avatarFit', {
      ...(resume.basic?.avatarFit || { x: 50, y: 50, scale: 1 }),
      [field]: value,
    });
  };

  const hiddenFields = resume.basic?.hiddenFields || [];
  const hiddenEducationFields = resume.education?.hiddenFields || [];
  const hiddenSections = resume.meta?.hiddenSections || [];
  const extraFields = resume.basic?.extraFields || [];
  const avatarFit = resume.basic?.avatarFit || { x: 50, y: 50, scale: 1 };
  const hiddenModuleConfigs = moduleConfigs.filter((module) => hiddenSections.includes(module.key));

  const hideBasicField = (key) => {
    updateGroup('basic', 'hiddenFields', [...new Set([...hiddenFields, key])]);
  };

  const hideEducationField = (key) => {
    updateGroup('education', 'hiddenFields', [...new Set([...hiddenEducationFields, key])]);
  };

  const updateExtraField = (index, field, value) => {
    const next = extraFields.map((item, currentIndex) =>
      currentIndex === index ? { ...item, [field]: value } : item,
    );
    updateGroup('basic', 'extraFields', next);
  };

  const addExtraField = () => {
    updateGroup('basic', 'extraFields', [...extraFields, createBasicField()]);
  };

  const removeExtraField = (index) => {
    updateGroup(
      'basic',
      'extraFields',
      extraFields.filter((_, currentIndex) => currentIndex !== index),
    );
  };

  return (
    <aside className="editor-panel">
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50/95 px-5 py-4 backdrop-blur">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">当前模板</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{resume.meta?.templateName}</p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs text-slate-500">简历名称</p>
              <p className="mt-1 text-sm font-semibold text-resumeBlue">{resume.meta?.resumeName}</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              {saveStatus}
            </span>
          </div>
          <div className="mt-4">
            <TextInput
              label="求职岗位（显示在简历顶部）"
              value={resume.basic?.targetRole}
              onChange={(value) => updateGroup('basic', 'targetRole', value)}
              placeholder="例如：产品经理实习生"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 p-5">
        {hiddenModuleConfigs.length > 0 && (
          <section className="rounded-lg border border-dashed border-resumeBlue/30 bg-white p-4 shadow-sm">
            <div className="mb-3 text-sm font-semibold text-slate-800">添加模块</div>
            <div className="flex flex-wrap gap-2">
              {hiddenModuleConfigs.map((module) => (
                <button
                  key={module.key}
                  type="button"
                  onClick={() => showSection(module.key)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-resumeBlue/30 px-3 py-2 text-sm font-medium text-resumeBlue transition hover:bg-resumeBlue/5"
                >
                  <Plus size={15} />
                  {module.title}
                </button>
              ))}
            </div>
          </section>
        )}

        <EditorCard title="基本信息" open={openSections.basic} onToggle={() => toggleSection('basic')}>
          <div className="grid gap-3 sm:grid-cols-2">
            {basicFields
              .filter((field) => !hiddenFields.includes(field.key))
              .map((field) => (
                <div key={field.key} className="grid grid-cols-[1fr_34px] gap-2">
                  <TextInput
                    label={field.label}
                    value={resume.basic?.[field.key]}
                    onChange={(value) => updateGroup('basic', field.key, value)}
                  />
                  <button
                    type="button"
                    onClick={() => hideBasicField(field.key)}
                    className="mt-6 inline-flex h-9 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                    title={`删除${field.label}`}
                    aria-label={`删除${field.label}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
          </div>

          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-600 transition hover:border-resumeBlue hover:bg-resumeBlue/5 hover:text-resumeBlue">
            <ImagePlus size={17} />
            上传头像
            <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
          </label>

          {resume.basic?.avatar && (
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">头像裁剪</span>
                <button
                  type="button"
                  onClick={() => updateGroup('basic', 'avatarFit', { x: 50, y: 50, scale: 1 })}
                  className="rounded-md px-2 py-1 text-xs font-medium text-resumeBlue transition hover:bg-resumeBlue/10"
                >
                  居中
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <RangeInput label="横向位置" min={0} max={100} value={avatarFit.x} onChange={(value) => updateAvatarFit('x', value)} />
                <RangeInput label="纵向位置" min={0} max={100} value={avatarFit.y} onChange={(value) => updateAvatarFit('y', value)} />
                <RangeInput label="缩放" min={1} max={2.2} step={0.05} value={avatarFit.scale} onChange={(value) => updateAvatarFit('scale', value)} />
              </div>
            </div>
          )}

          <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/70 p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">自定义信息</span>
              <button
                type="button"
                onClick={addExtraField}
                className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-resumeBlue transition hover:bg-resumeBlue/10"
              >
                <Plus size={14} />
                增加一条
              </button>
            </div>

            {extraFields.length === 0 && (
              <p className="text-xs text-slate-400">可添加如“意向城市：成都”等信息。</p>
            )}

            {extraFields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-[1fr_1.4fr_34px] gap-2">
                <TextInput label="栏目" value={field.label} placeholder="意向城市" onChange={(value) => updateExtraField(index, 'label', value)} />
                <TextInput label="内容" value={field.value} placeholder="成都" onChange={(value) => updateExtraField(index, 'value', value)} />
                <button
                  type="button"
                  onClick={() => removeExtraField(index)}
                  className="mt-6 inline-flex h-9 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                  title="删除"
                  aria-label="删除"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </EditorCard>

        {!hiddenSections.includes('education') && (
          <EditorCard title="教育背景" open={openSections.education} onToggle={() => toggleSection('education')} action={<DeleteSectionButton onClick={() => hideSection('education')} />}>
            <div className="grid gap-3 sm:grid-cols-2">
              {educationFields
                .filter((field) => !hiddenEducationFields.includes(field.key))
                .map((field) => (
                  <div key={field.key} className="grid grid-cols-[1fr_34px] gap-2">
                    <TextInput label={field.label} value={resume.education?.[field.key]} onChange={(value) => updateGroup('education', field.key, value)} />
                    <button type="button" onClick={() => hideEducationField(field.key)} className="mt-6 inline-flex h-9 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-600" title={`删除${field.label}`} aria-label={`删除${field.label}`}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              {!hiddenEducationFields.includes('courses') && (
                <div className="grid gap-2 sm:col-span-2 sm:grid-cols-[1fr_34px]">
                  <TextArea label="主修课程" value={resume.education?.courses} onChange={(value) => updateGroup('education', 'courses', value)} rows={3} />
                  <button type="button" onClick={() => hideEducationField('courses')} className="mt-6 inline-flex h-9 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-600" title="删除主修课程" aria-label="删除主修课程">
                    <Trash2 size={15} />
                  </button>
                </div>
              )}
            </div>
          </EditorCard>
        )}

        {!hiddenSections.includes('projects') && (
          <EditorCard title="项目经验" open={openSections.projects} onToggle={() => toggleSection('projects')} action={<DeleteSectionButton onClick={() => hideSection('projects')} />}>
            <ExperienceEditor titlePrefix="项目" nameLabel="项目名称" roleLabel="角色" items={resume.projects || []} onChange={(value) => updateRoot('projects', value)} />
          </EditorCard>
        )}

        {!hiddenSections.includes('internships') && (
          <EditorCard title="实习经历" open={openSections.internships} onToggle={() => toggleSection('internships')} action={<DeleteSectionButton onClick={() => hideSection('internships')} />}>
            <ExperienceEditor titlePrefix="实习" nameLabel="公司/组织名称" roleLabel="岗位" items={resume.internships || []} onChange={(value) => updateRoot('internships', value)} />
          </EditorCard>
        )}

        {!hiddenSections.includes('campus') && (
          <EditorCard title="校园经历" open={openSections.campus} onToggle={() => toggleSection('campus')} action={<DeleteSectionButton onClick={() => hideSection('campus')} />}>
            <ExperienceEditor titlePrefix="经历" nameLabel="组织名称" roleLabel="角色" items={resume.campus || []} onChange={(value) => updateRoot('campus', value)} />
          </EditorCard>
        )}

        {!hiddenSections.includes('skills') && (
          <EditorCard title="技能特长" open={openSections.skills} onToggle={() => toggleSection('skills')} action={<DeleteSectionButton onClick={() => hideSection('skills')} />}>
            <ListEditor items={resume.skills || []} onChange={(value) => updateRoot('skills', value)} addLabel="增加技能" />
          </EditorCard>
        )}

        {!hiddenSections.includes('honors') && (
          <EditorCard title="荣誉证书" open={openSections.honors} onToggle={() => toggleSection('honors')} action={<DeleteSectionButton onClick={() => hideSection('honors')} />}>
            <ListEditor items={resume.honors || []} onChange={(value) => updateRoot('honors', value)} addLabel="增加证书" />
          </EditorCard>
        )}

        {!hiddenSections.includes('summary') && (
          <EditorCard title="自我评价" open={openSections.summary} onToggle={() => toggleSection('summary')} action={<DeleteSectionButton onClick={() => hideSection('summary')} />}>
            <TextArea label="自我评价" rows={6} value={resume.summary} onChange={(value) => updateRoot('summary', value)} />
          </EditorCard>
        )}
      </div>
    </aside>
  );
}
