import assert from 'node:assert/strict';
import {
  createInitialResumeAppData,
  createResumeByRole,
  duplicateResume,
  renameResume,
  removeResume,
  updateResumeData,
} from '../src/utils/resumeStorage.js';

const memoryStorage = (initial = {}) => {
  const store = new Map(Object.entries(initial));
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
  };
};

const assertIsoDate = (value) => {
  assert.match(value, /^\d{4}-\d{2}-\d{2}T/);
};

{
  const appData = createInitialResumeAppData({ storage: memoryStorage(), now: () => '2026-07-10T00:00:00.000Z' });

  assert.equal(appData.resumes.length, 1);
  assert.equal(appData.activeResumeId, appData.resumes[0].id);
  assert.equal(appData.resumes[0].name, '吴咏-产品经理实习生');
  assert.equal(appData.resumes[0].targetRole, '产品经理实习生');
  assert.ok(!appData.resumes[0].data.basic.hiddenFields.includes('targetRole'));
}

{
  const resume = createResumeByRole('data-analyst', { now: () => '2026-07-10T00:00:00.000Z' });

  assert.equal(resume.name, '吴咏-数据分析师实习生');
  assert.equal(resume.targetRole, '数据分析师实习生');
  assert.equal(resume.data.basic.targetRole, '数据分析师实习生');
  assert.ok(!resume.data.basic.hiddenFields.includes('targetRole'));
  assert.ok(resume.data.skills.some((item) => item.includes('Python')));
  assert.ok(resume.data.projects[0].name.includes('微博 315'));
}

{
  const original = createResumeByRole('ai-product', { now: () => '2026-07-10T00:00:00.000Z' });
  const copy = duplicateResume(original, { now: () => '2026-07-11T00:00:00.000Z' });

  assert.notEqual(copy.id, original.id);
  assert.equal(copy.name, `${original.name} - 副本`);
  assert.equal(copy.data.meta.resumeName, `${original.name} - 副本`);
  assert.equal(copy.data.projects[0].name, original.data.projects[0].name);
  copy.data.basic.name = '测试';
  assert.notEqual(original.data.basic.name, copy.data.basic.name);
}

{
  const first = createResumeByRole('product-manager', { now: () => '2026-07-10T00:00:00.000Z' });
  const second = createResumeByRole('data-analyst', { now: () => '2026-07-11T00:00:00.000Z' });
  const appData = { resumes: [first, second], activeResumeId: first.id };

  const renamed = renameResume(appData, first.id, '新版产品简历', { now: () => '2026-07-12T00:00:00.000Z' });
  assert.equal(renamed.resumes[0].name, '新版产品简历');
  assert.equal(renamed.resumes[0].updatedAt, '2026-07-12T00:00:00.000Z');

  const updated = updateResumeData(renamed, first.id, { ...first.data, summary: '更新后的自我评价' }, { now: () => '2026-07-13T00:00:00.000Z' });
  assert.equal(updated.resumes[0].data.summary, '更新后的自我评价');
  assert.equal(updated.resumes[0].targetRole, first.data.basic.targetRole);

  const removed = removeResume(updated, first.id);
  assert.equal(removed.resumes.length, 1);
  assert.equal(removed.activeResumeId, second.id);
}

{
  const malformedStorage = memoryStorage({ resume_app_data_v2: '{bad json' });
  const originalWarn = console.warn;
  console.warn = () => {};
  const appData = createInitialResumeAppData({ storage: malformedStorage, now: () => '2026-07-10T00:00:00.000Z' });
  console.warn = originalWarn;

  assert.equal(appData.resumes.length, 1);
  assertIsoDate(appData.resumes[0].createdAt);
}

console.log('resume storage tests passed');
