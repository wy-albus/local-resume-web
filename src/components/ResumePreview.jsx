import React from 'react';
import ResumeSectionTitle from './ResumeSectionTitle.jsx';

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

function Section({ hiddenSections, name, title, children }) {
  if ((hiddenSections || []).includes(name)) return null;

  return (
    <>
      <ResumeSectionTitle>{title}</ResumeSectionTitle>
      {children}
    </>
  );
}

const hasListContent = (items) => (items || []).some(Boolean);

export default function ResumePreview({ resume, previewRef }) {
  const { basic, education } = resume;
  const hiddenBasicFields = basic.hiddenFields || [];
  const hiddenEducationFields = education.hiddenFields || [];
  const hiddenSections = resume.meta.hiddenSections || [];
  const avatarFit = basic.avatarFit || { x: 50, y: 50, scale: 1 };

  const showEducation = (field) => !hiddenEducationFields.includes(field);
  const majorDegree = [
    showEducation('major') ? education.major : '',
    showEducation('degree') ? `（${education.degree}）` : '',
  ].join('');

  const showSecondPage =
    (!hiddenSections.includes('honors') && hasListContent(resume.honors)) ||
    (!hiddenSections.includes('summary') && Boolean(resume.summary?.trim()));

  return (
    <div ref={previewRef} className="resume-document">
      <Page>
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

        <Section hiddenSections={hiddenSections} name="education" title="教育背景">
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
        </Section>

        <Section hiddenSections={hiddenSections} name="projects" title="项目经验">
          {(resume.projects || []).map((project) => (
            <ExperienceBlock key={project.id} item={project} />
          ))}
        </Section>

        {!hiddenSections.includes('internships') && (resume.internships || []).length > 0 && (
          <Section hiddenSections={hiddenSections} name="internships" title="实习经历">
            {(resume.internships || []).map((internship) => (
              <ExperienceBlock key={internship.id} item={internship} />
            ))}
          </Section>
        )}

        <Section hiddenSections={hiddenSections} name="campus" title="校园经历">
          {(resume.campus || []).map((campus) => (
            <ExperienceBlock key={campus.id} item={campus} />
          ))}
        </Section>

        <Section hiddenSections={hiddenSections} name="skills" title="技能特长">
          <BulletList items={resume.skills} />
        </Section>
      </Page>

      {showSecondPage && (
        <Page>
          <Section hiddenSections={hiddenSections} name="honors" title="荣誉证书">
            <BulletList items={resume.honors} />
          </Section>

          <Section hiddenSections={hiddenSections} name="summary" title="自我评价">
            <p className="resume-summary">{resume.summary}</p>
          </Section>
        </Page>
      )}
    </div>
  );
}
