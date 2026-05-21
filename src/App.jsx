import { Download, FileText, Printer, RotateCcw, Save } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import ResumeEditor from './components/ResumeEditor.jsx';
import ResumePreview from './components/ResumePreview.jsx';
import { defaultResumeData } from './data/defaultResumeData.js';
import { exportResumePdf } from './utils/exportPdf.js';
import { loadResumeData, saveResumeData } from './utils/storage.js';

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

export default function App() {
  const [resume, setResume] = useState(() => loadResumeData() || cloneDefaultData());
  const [openSections, setOpenSections] = useState(initialOpenSections);
  const [saveStatus, setSaveStatus] = useState('已自动保存');
  const [isExporting, setIsExporting] = useState(false);
  const previewRef = useRef(null);

  useEffect(() => {
    setSaveStatus('正在保存...');
    const timer = window.setTimeout(() => {
      const saved = saveResumeData(resume);
      setSaveStatus(saved ? '已自动保存' : '本地保存失败');
    }, 250);

    return () => window.clearTimeout(timer);
  }, [resume]);

  const handleManualSave = () => {
    const saved = saveResumeData(resume);
    setSaveStatus(saved ? '已保存到本地' : '本地保存失败');
  };

  const handleReset = () => {
    setResume(cloneDefaultData());
    setOpenSections(initialOpenSections);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      const fileName = `${resume.basic?.name || '中文'}-${resume.basic?.targetRole || '简历'}-简历.pdf`;
      await exportResumePdf(previewRef.current, fileName);
    } catch (error) {
      window.alert(`PDF 导出失败：${error.message || '请稍后重试'}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <main className="grid min-h-screen grid-cols-1 lg:grid-cols-[38%_62%]">
        <ResumeEditor
          resume={resume}
          setResume={setResume}
          openSections={openSections}
          setOpenSections={setOpenSections}
          saveStatus={saveStatus}
        />

        <section className="preview-panel">
          <div className="preview-toolbar">
            <button className="toolbar-button primary" onClick={handleExportPdf} disabled={isExporting}>
              <Download size={17} />
              {isExporting ? '正在生成 PDF...' : '下载 PDF'}
            </button>
            <button className="toolbar-button" onClick={handleManualSave}>
              <Save size={17} />
              保存到本地
            </button>
            <button className="toolbar-button" onClick={handleReset}>
              <RotateCcw size={17} />
              恢复默认内容
            </button>
            <button className="toolbar-button" onClick={handlePrint}>
              <Printer size={17} />
              打印预览
            </button>
          </div>

          <div className="flex justify-center px-4 pb-10">
            <ResumePreview resume={resume} previewRef={previewRef} />
          </div>

          <div className="sr-only">
            <FileText />
          </div>
        </section>
      </main>
    </div>
  );
}
