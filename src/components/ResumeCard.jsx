import { Copy, Edit3, Pencil, Trash2 } from 'lucide-react';
import React from 'react';

function formatDate(value) {
  if (!value) return '刚刚更新';
  try {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  } catch {
    return '刚刚更新';
  }
}

export default function ResumeCard({ resume, onEdit, onDuplicate, onRename, onDelete }) {
  const basic = resume.data?.basic || {};
  const skills = resume.data?.skills || [];

  return (
    <article className="resume-card">
      <div className="resume-card-preview" aria-hidden="true">
        <div className="resume-card-paper">
          <div className="thumb-header">
            <div>
              <div className="thumb-name">{basic.name || '吴咏'}</div>
              <div className="thumb-role">{resume.targetRole || basic.targetRole}</div>
            </div>
            <div className="thumb-avatar" />
          </div>
          <div className="thumb-section" />
          <div className="thumb-lines">
            <span />
            <span />
            <span className="short" />
          </div>
          <div className="thumb-section" />
          <div className="thumb-lines">
            <span />
            <span className="medium" />
            <span />
          </div>
        </div>
      </div>

      <div className="resume-card-body">
        <div>
          <h2>{resume.name}</h2>
          <p>{resume.targetRole || basic.targetRole || '求职岗位未设置'}</p>
        </div>
        <div className="resume-card-meta">
          <span>更新时间</span>
          <strong>{formatDate(resume.updatedAt)}</strong>
        </div>
        {skills[0] && <p className="resume-card-skill">{skills[0]}</p>}
      </div>

      <div className="resume-card-actions">
        <button type="button" className="toolbar-button primary" onClick={onEdit}>
          <Edit3 size={16} />
          编辑
        </button>
        <button type="button" className="icon-text-button" onClick={onDuplicate}>
          <Copy size={15} />
          复制
        </button>
        <button type="button" className="icon-text-button" onClick={onRename}>
          <Pencil size={15} />
          重命名
        </button>
        <button type="button" className="icon-text-button danger" onClick={onDelete}>
          <Trash2 size={15} />
          删除
        </button>
      </div>
    </article>
  );
}

