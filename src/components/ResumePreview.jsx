import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import ResumeSectionTitle from './ResumeSectionTitle.jsx';

const PAGE_CONTENT_HEIGHT = 1123 - 30 * 2;

const basicFieldConfig = [
  ['age', '年龄'],
  ['gender', '性别'],
  ['ethnicity', '民族'],
  ['hometown', '籍贯'],
  ['phone', '电话'],
  ['email', '邮箱'],
];

const normalizeDescription = (description) => {
  if (typeof description === 'string') {
    return {
      text: description,
      style: { marker: 'dot', bold: false, italic: false },
    };
  }

  return {
    text: description?.text || '',
    style: {
      marker: description?.style?.marker || 'dot',
      bold: Boolean(description?.style?.bold),
      italic: Boolean(description?.style?.italic),
    },
  };
};

const hasListContent = (items) => (items || []).some(Boolean);

function BulletList({ items }) {
  const visibleItems = (items || []).filter(Boolean);
  if (!visibleItems.length) return null;

  return (
    <div className="resume-description-list">
      {visibleItems.map((item, index) => (
        <div key={`${item}-${index}`} className="resume-description-row">
          <span className="resume-description-marker">•</span>
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}

function DescriptionList({ items }) {
  const descriptions = (items || []).map(normalizeDescription).filter((item) => item.text);
  if (!descriptions.length) return null;

  return (
    <div className="resume-description-list">
      {descriptions.map((description, index) => {
        const marker = description.style.marker;

        return (
          <div
            key={`${description.text}-${index}`}
            className={[
              'resume-description-row',
              description.style.bold ? 'is-bold' : '',
              description.style.italic ? 'is-italic' : '',
            ].join(' ')}
          >
            <span className="resume-description-marker">
              {marker === 'number' ? `${index + 1}.` : marker === 'dot' ? '•' : ''}
            </span>
            <span>{description.text}</span>
          </div>
        );
      })}
    </div>
  );
}

function ExperienceBlock({ item }) {
  return (
    <div className="resume-experience">
      <div className="resume-experience-head">
        <div>{item.period}</div>
        <div>{item.name}</div>
        <div>{item.role}</div>
      </div>
      <DescriptionList items={item.descriptions} />
    </div>
  );
}

function Page({ children }) {
  return (
    <article className="resume-page bg-white text-ink shadow-resume">
      <div className="resume-page-content">{children}</div>
    </article>
  );
}

function BasicInfoGrid({ basic }) {
  const hiddenFields = basic.hiddenFields || [];
  const fields = [
    ...basicFieldConfig
      .filter(([key]) => !hiddenFields.includes(key))
      .map(([key, label]) => [label, basic[key]]),
    ...(basic.extraFields || [])
      .filter((field) => field.label || field.value)
      .map((field) => [field.label || '自定义', field.value]),
  ].filter(([, value]) => value);

  const gridClass = fields.length <= 4 ? 'resume-basic-grid is-two-column' : 'resume-basic-grid';

  return (
    <div className={gridClass}>
      {fields.map(([label, value], index) => (
        <p key={`${label}-${index}`}>
          <span>{label}</span>
          <strong>：</strong>
          {value}
        </p>
      ))}
    </div>
  );
}

function ResumeHeader({ basic }) {
  const hiddenBasicFields = basic.hiddenFields || [];
  const avatarFit = basic.avatarFit || { x: 50, y: 50, scale: 1 };

  return (
    <header className="resume-header">
      <div>
        {!hiddenBasicFields.includes('name') && <h1>{basic.name}</h1>}
        {!hiddenBasicFields.includes('targetRole') && (
          <p className="resume-role">求职岗位：{basic.targetRole}</p>
        )}
        <BasicInfoGrid basic={basic} />
      </div>
      <div className="resume-avatar-wrap">
        {basic.avatar ? (
          <div className="resume-avatar-frame">
            <div
              className="resume-avatar-bg"
              role="img"
              aria-label="头像"
              style={{
                backgroundImage: `url("${basic.avatar}")`,
                backgroundPosition: `${avatarFit.x}% ${avatarFit.y}%`,
                transform: `scale(${avatarFit.scale})`,
              }}
            />
          </div>
        ) : (
          <div className="resume-avatar-placeholder">证件照</div>
        )}
      </div>
    </header>
  );
}

function EducationBlock({ education }) {
  const hiddenEducationFields = education.hiddenFields || [];
  const showEducation = (field) => !hiddenEducationFields.includes(field);
  const majorDegree = [
    showEducation('major') ? education.major : '',
    showEducation('degree') ? `（${education.degree}）` : '',
  ].join('');

  return (
    <>
      <ResumeSectionTitle>教育背景</ResumeSectionTitle>
      <div className="resume-education">
        <div className="resume-three-col">
          <div>{showEducation('period') ? education.period : ''}</div>
          <div>{showEducation('school') ? education.school : ''}</div>
          <div>{majorDegree}</div>
        </div>
        {showEducation('gpa') && (
          <p>
            <strong>专业成绩：</strong>
            {education.gpa}
          </p>
        )}
        {showEducation('courses') && (
          <p>
            <strong>主修课程：</strong>
            {education.courses}
          </p>
        )}
      </div>
    </>
  );
}

function SectionListBlock({ title, items }) {
  return (
    <>
      <ResumeSectionTitle>{title}</ResumeSectionTitle>
      <BulletList items={items} />
    </>
  );
}

function SummaryBlock({ summary }) {
  return (
    <>
      <ResumeSectionTitle>自我评价</ResumeSectionTitle>
      <p className="resume-summary">{summary}</p>
    </>
  );
}

function SectionTitleBlock({ title }) {
  return <ResumeSectionTitle>{title}</ResumeSectionTitle>;
}

function createResumeBlocks(resume) {
  const hiddenSections = resume.meta?.hiddenSections || [];
  const isVisible = (section) => !hiddenSections.includes(section);
  const blocks = [{ id: 'header', type: 'header', render: () => <ResumeHeader basic={resume.basic} /> }];

  if (isVisible('education')) {
    blocks.push({
      id: 'education',
      type: 'single',
      render: () => <EducationBlock education={resume.education} />,
    });
  }

  const addExperienceSection = (section, title, items) => {
    if (!isVisible(section) || !(items || []).length) return;

    blocks.push({
      id: `${section}-title`,
      type: 'section-title',
      section,
      render: () => <SectionTitleBlock title={title} />,
    });

    items.forEach((item) => {
      blocks.push({
        id: `${section}-${item.id}`,
        type: 'experience',
        section,
        render: () => <ExperienceBlock item={item} />,
      });
    });
  };

  addExperienceSection('projects', '项目经验', resume.projects);
  addExperienceSection('internships', '实习经历', resume.internships);
  addExperienceSection('campus', '校园经历', resume.campus);

  if (isVisible('skills') && hasListContent(resume.skills)) {
    blocks.push({
      id: 'skills',
      type: 'single',
      render: () => <SectionListBlock title="技能特长" items={resume.skills} />,
    });
  }

  if (isVisible('honors') && hasListContent(resume.honors)) {
    blocks.push({
      id: 'honors',
      type: 'single',
      render: () => <SectionListBlock title="荣誉证书" items={resume.honors} />,
    });
  }

  if (isVisible('summary') && resume.summary?.trim()) {
    blocks.push({
      id: 'summary',
      type: 'single',
      render: () => <SummaryBlock summary={resume.summary} />,
    });
  }

  return blocks;
}

function paginateBlocks(blocks, heights) {
  const pages = [[]];
  let currentHeight = 0;

  const nextPage = () => {
    if (pages[pages.length - 1].length > 0) {
      pages.push([]);
      currentHeight = 0;
    }
  };

  blocks.forEach((block, index) => {
    const blockHeight = heights[block.id] || 0;
    const nextBlock = blocks[index + 1];

    if (block.type === 'section-title' && nextBlock?.section === block.section) {
      const firstItemHeight = heights[nextBlock.id] || 0;
      if (currentHeight > 0 && currentHeight + blockHeight + firstItemHeight > PAGE_CONTENT_HEIGHT) {
        nextPage();
      }
    } else if (currentHeight > 0 && currentHeight + blockHeight > PAGE_CONTENT_HEIGHT) {
      nextPage();
    }

    pages[pages.length - 1].push(block.id);
    currentHeight += blockHeight;
  });

  return pages.filter((page) => page.length > 0);
}

function MeasurementLayer({ blocks, measureRef }) {
  return (
    <div className="resume-measurement" aria-hidden="true">
      <article className="resume-measure-page bg-white text-ink">
        <div ref={measureRef} className="resume-page-content">
          {blocks.map((block) => (
            <div key={block.id} className="resume-measure-block" data-block-id={block.id}>
              {block.render()}
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}

export default function ResumePreview({ resume, previewRef }) {
  const blocks = useMemo(() => createResumeBlocks(resume), [resume]);
  const blockMap = useMemo(() => new Map(blocks.map((block) => [block.id, block])), [blocks]);
  const measureRef = useRef(null);
  const [pageBlockIds, setPageBlockIds] = useState([blocks.map((block) => block.id)]);

  useLayoutEffect(() => {
    const measure = () => {
      const nodes = Array.from(measureRef.current?.querySelectorAll('[data-block-id]') || []);
      if (!nodes.length) return;

      const heights = nodes.reduce((result, node) => {
        result[node.dataset.blockId] = node.getBoundingClientRect().height;
        return result;
      }, {});

      setPageBlockIds(paginateBlocks(blocks, heights));
    };

    measure();

    if (!window.ResizeObserver || !measureRef.current) return undefined;

    const observer = new ResizeObserver(measure);
    observer.observe(measureRef.current);

    return () => observer.disconnect();
  }, [blocks]);

  return (
    <div ref={previewRef} className="resume-document">
      <MeasurementLayer blocks={blocks} measureRef={measureRef} />

      {pageBlockIds.map((page, pageIndex) => (
        <Page key={`page-${pageIndex}`}>
          {page.map((blockId) => {
            const block = blockMap.get(blockId);
            return block ? (
              <div key={block.id} className="resume-page-block">
                {block.render()}
              </div>
            ) : null;
          })}
        </Page>
      ))}
    </div>
  );
}
