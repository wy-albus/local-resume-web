import React, { useEffect, useMemo, useState } from 'react';
import LandingPage from './pages/LandingPage.jsx';
import ResumeBuilder from './pages/ResumeBuilder.jsx';
import ResumeGallery from './pages/ResumeGallery.jsx';
import {
  addResume,
  createInitialResumeAppData,
  createResumeByRole,
  createResumeFromData,
  duplicateResume,
  getActiveResume,
  removeResume,
  renameResume,
  saveResumeAppData,
  updateResumeData,
} from './utils/resumeStorage.js';

export default function App() {
  const [page, setPage] = useState('landing');
  const [appData, setAppData] = useState(() => createInitialResumeAppData());
  const [saveStatus, setSaveStatus] = useState('已自动保存');

  const activeResume = useMemo(() => getActiveResume(appData), [appData]);

  useEffect(() => {
    setSaveStatus('保存中...');
    const timer = window.setTimeout(() => {
      const saved = saveResumeAppData(appData);
      setSaveStatus(saved ? '已自动保存' : '本地保存失败');
    }, 250);

    return () => window.clearTimeout(timer);
  }, [appData]);

  const switchToBuilder = (resumeId) => {
    setAppData((current) => ({ ...current, activeResumeId: resumeId }));
    setPage('builder');
  };

  const handleCreateResume = ({ role, name, targetRole, mode }) => {
    setAppData((current) => {
      const currentResume = getActiveResume(current);
      const nextResume =
        mode === 'copy-current' && currentResume
          ? createResumeFromData(currentResume.data, { name, targetRole })
          : createResumeByRole(role, { name, targetRole });

      return addResume(current, nextResume);
    });
    setPage('builder');
  };

  const handleDuplicateResume = (resumeId) => {
    setAppData((current) => {
      const source = current.resumes.find((resume) => resume.id === resumeId);
      if (!source) return current;
      return addResume(current, duplicateResume(source));
    });
    setPage('gallery');
  };

  const handleRenameResume = (resumeId) => {
    const currentResume = appData.resumes.find((resume) => resume.id === resumeId);
    if (!currentResume) return;

    const nextName = window.prompt('请输入新的简历名称', currentResume.name);
    if (!nextName) return;

    setAppData((current) => renameResume(current, resumeId, nextName));
  };

  const handleDeleteResume = (resumeId) => {
    const confirmed = window.confirm('确定要删除这份简历吗？此操作不可恢复。');
    if (!confirmed) return;

    setAppData((current) => removeResume(current, resumeId));
    setPage('gallery');
  };

  const handleResumeChange = (nextResumeOrUpdater) => {
    setAppData((current) => {
      const currentResume = getActiveResume(current);
      if (!currentResume) return current;

      const nextResumeData =
        typeof nextResumeOrUpdater === 'function'
          ? nextResumeOrUpdater(currentResume.data)
          : nextResumeOrUpdater;

      return updateResumeData(current, currentResume.id, nextResumeData);
    });
  };

  const handleManualSave = () => {
    const saved = saveResumeAppData(appData);
    setSaveStatus(saved ? '已保存到本地' : '本地保存失败');
  };

  if (page === 'landing') {
    return <LandingPage onEnter={() => setPage('gallery')} />;
  }

  if (page === 'builder' && activeResume) {
    return (
      <ResumeBuilder
        resumeRecord={activeResume}
        saveStatus={saveStatus}
        onBack={() => setPage('gallery')}
        onResumeChange={handleResumeChange}
        onManualSave={handleManualSave}
      />
    );
  }

  return (
    <ResumeGallery
      resumes={appData.resumes}
      activeResume={activeResume}
      onCreate={handleCreateResume}
      onEdit={switchToBuilder}
      onDuplicate={handleDuplicateResume}
      onRename={handleRenameResume}
      onDelete={handleDeleteResume}
    />
  );
}
