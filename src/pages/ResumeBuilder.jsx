import { ArrowLeft, Download, Printer, RotateCcw, Save } from 'lucide-react';
import React, { useRef, useState } from 'react';
import ResumeEditor from '../components/ResumeEditor.jsx';
import ResumePreview from '../components/ResumePreview.jsx';
import { defaultResumeData } from '../data/defaultResumeData.js';
import { exportResumePdf } from '../utils/exportPdf.js';

const initialOpenSections = {
  basic: true,
  education: true,
  projects: true,
  internships: false,
  campus: false,
  skills: false,
  honors: false,
  summary: false,
};

const cloneDefaultData = () => JSON.parse(JSON.stringify(defaultResumeData));

function safeFileName(value) {
  return (value || '中文简历').replace(/[\\/:*?"<>|]/g, '-');
}

export default function ResumeBuilder({
  resumeRecord,
  saveStatus,
  onBack,
  onResumeChange,
  onManualSave,
}) {
  const [openSections, setOpenSections] = useState(initialOpenSections);
  const [isExporting, setIsExporting] = useState(false);
  const previewRef = useRef(null);
  const resume = resumeRecord?.data || cloneDefaultData();

  const handleReset = () => {
    onResumeChange(cloneDefaultData());
    setOpenSections(initialOpenSections);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      await exportResumePdf(previewRef.current, `${safeFileName(resumeRecord?.name)}-简历.pdf`);
    } catch (error) {
      window.alert(`PDF 导出失败：${error.message || '请稍后重试'}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="builder-shell">
      <header className="builder-nav">
        <button type="button" className="nav-back-button" onClick={onBack}>
          <ArrowLeft size={18} />
          返回我的简历
        </button>
        <div className="builder-title">
          <span>当前简历</span>
          <strong>{resumeRecord?.name || '未命名简历'}</strong>
        </div>
        <span className="save-pill">{saveStatus}</span>
        <div className="builder-actions">
          <button type="button" className="toolbar-button primary" onClick={handleExportPdf} disabled={isExporting}>
            <Download size={17} />
            {isExporting ? '正在生成 PDF...' : '下载 PDF'}
          </button>
          <button type="button" className="toolbar-button" onClick={onManualSave}>
            <Save size={17} />
            保存到本地
          </button>
          <button type="button" className="toolbar-button" onClick={handleReset}>
            <RotateCcw size={17} />
            恢复默认内容
          </button>
          <button type="button" className="toolbar-button" onClick={handlePrint}>
            <Printer size={17} />
            打印预览
          </button>
        </div>
      </header>

      <main className="grid min-h-[calc(100vh-76px)] grid-cols-1 lg:grid-cols-[38%_62%]">
        <ResumeEditor
          resume={resume}
          setResume={onResumeChange}
          openSections={openSections}
          setOpenSections={setOpenSections}
          saveStatus={saveStatus}
        />

        <section className="preview-panel">
          <div className="flex justify-center px-4 pb-10">
            <ResumePreview resume={resume} previewRef={previewRef} />
          </div>
        </section>
      </main>
    </div>
  );
}

