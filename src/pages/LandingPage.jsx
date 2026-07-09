import { ArrowRight } from 'lucide-react';
import React from 'react';
import ResumePreview from '../components/ResumePreview.jsx';
import { defaultResumeData } from '../data/defaultResumeData.js';

export default function LandingPage({ onEnter }) {
  return (
    <main className="landing-page">
      <div className="landing-resume-bg" aria-hidden="true">
        <ResumePreview resume={defaultResumeData} />
      </div>
      <div className="landing-overlay" />

      <section className="landing-content">
        <p className="landing-kicker">中文简历生成器</p>
        <h1>免费中文简历制作器</h1>
        <p>支持多份简历管理，实时预览，一键导出 PDF</p>
        <button type="button" className="landing-button" onClick={onEnter}>
          进入简历制作
          <ArrowRight size={19} />
        </button>
      </section>
    </main>
  );
}

