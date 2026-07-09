import { X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { resumeRoleOptions } from '../data/resumeRoleTemplates.js';

const defaultNameMap = {
  'product-manager': '吴咏-产品经理实习生',
  'data-analyst': '吴咏-数据分析师实习生',
  'ai-product': '吴咏-AI产品实习生',
  custom: '吴咏-自定义简历',
};

const defaultRoleMap = {
  'product-manager': '产品经理实习生',
  'data-analyst': '数据分析师实习生',
  'ai-product': 'AI 产品实习生',
  custom: '自定义岗位',
};

export default function CreateResumeModal({ open, hasActiveResume, onClose, onCreate }) {
  const [role, setRole] = useState('product-manager');
  const [name, setName] = useState(defaultNameMap['product-manager']);
  const [targetRole, setTargetRole] = useState(defaultRoleMap['product-manager']);
  const [mode, setMode] = useState('default');

  useEffect(() => {
    if (!open) return;
    setRole('product-manager');
    setName(defaultNameMap['product-manager']);
    setTargetRole(defaultRoleMap['product-manager']);
    setMode('default');
  }, [open]);

  if (!open) return null;

  const handleRoleChange = (value) => {
    setRole(value);
    setName(defaultNameMap[value] || defaultNameMap.custom);
    setTargetRole(defaultRoleMap[value] || defaultRoleMap.custom);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onCreate({
      role,
      name,
      targetRole,
      mode,
    });
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="新建简历">
      <form className="create-modal" onSubmit={handleSubmit}>
        <div className="modal-header">
          <div>
            <h2>新建简历</h2>
            <p>为新的求职方向创建一个独立版本</p>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="关闭">
            <X size={19} />
          </button>
        </div>

        <label className="modal-field">
          <span>求职方向</span>
          <select value={role} onChange={(event) => handleRoleChange(event.target.value)}>
            {resumeRoleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="modal-field">
          <span>简历名称</span>
          <input value={name} onChange={(event) => setName(event.target.value)} />
        </label>

        <label className="modal-field">
          <span>求职岗位</span>
          <input value={targetRole} onChange={(event) => setTargetRole(event.target.value)} />
        </label>

        <fieldset className="modal-radio-group">
          <legend>创建方式</legend>
          <label>
            <input
              type="radio"
              name="createMode"
              value="default"
              checked={mode === 'default'}
              onChange={() => setMode('default')}
            />
            使用默认内容创建
          </label>
          <label className={!hasActiveResume ? 'is-disabled' : ''}>
            <input
              type="radio"
              name="createMode"
              value="copy-current"
              checked={mode === 'copy-current'}
              disabled={!hasActiveResume}
              onChange={() => setMode('copy-current')}
            />
            复制当前简历内容创建
          </label>
        </fieldset>

        <div className="modal-actions">
          <button type="button" className="toolbar-button" onClick={onClose}>
            取消
          </button>
          <button type="submit" className="toolbar-button primary">
            创建简历
          </button>
        </div>
      </form>
    </div>
  );
}

