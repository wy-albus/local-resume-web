import { Plus } from 'lucide-react';
import React, { useState } from 'react';
import CreateResumeModal from '../components/CreateResumeModal.jsx';
import ResumeCard from '../components/ResumeCard.jsx';

export default function ResumeGallery({
  resumes,
  activeResume,
  onCreate,
  onEdit,
  onDuplicate,
  onRename,
  onDelete,
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const hasResumes = resumes.length > 0;

  return (
    <main className="gallery-page">
      <header className="gallery-header">
        <div>
          <p className="gallery-kicker">Resume Gallery</p>
          <h1>我的简历</h1>
          <p>为不同岗位创建不同版本的简历</p>
        </div>
        <button type="button" className="toolbar-button primary" onClick={() => setModalOpen(true)}>
          <Plus size={17} />
          新建简历
        </button>
      </header>

      {hasResumes ? (
        <section className="resume-card-grid" aria-label="简历列表">
          {resumes.map((resume) => (
            <ResumeCard
              key={resume.id}
              resume={resume}
              onEdit={() => onEdit(resume.id)}
              onDuplicate={() => onDuplicate(resume.id)}
              onRename={() => onRename(resume.id)}
              onDelete={() => onDelete(resume.id)}
            />
          ))}
        </section>
      ) : (
        <section className="empty-gallery">
          <h2>你还没有创建简历</h2>
          <p>创建第一份简历后，就可以在这里管理不同求职方向的版本。</p>
          <button type="button" className="toolbar-button primary" onClick={() => setModalOpen(true)}>
            <Plus size={17} />
            创建第一份简历
          </button>
        </section>
      )}

      <CreateResumeModal
        open={modalOpen}
        hasActiveResume={Boolean(activeResume)}
        onClose={() => setModalOpen(false)}
        onCreate={(payload) => {
          onCreate(payload);
          setModalOpen(false);
        }}
      />
    </main>
  );
}

