import { defaultResumeData } from '../data/defaultResumeData.js';
import { buildResumeDataForRole } from '../data/resumeRoleTemplates.js';

export const APP_STORAGE_KEY = 'resume_app_data_v2';
export const LEGACY_STORAGE_KEY = 'chinese-resume-builder-data';

const clone = (value) => JSON.parse(JSON.stringify(value));
const defaultNow = () => new Date().toISOString();
const defaultId = () => `resume_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

function safeParse(value) {
  try {
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.warn('读取本地简历数据失败：', error);
    return null;
  }
}

function getStorage(storage) {
  if (storage) return storage;
  if (typeof localStorage !== 'undefined') return localStorage;
  return null;
}

function normalizeResumeRecord(record, options = {}) {
  const now = options.now?.() || defaultNow();
  const data = clone(record?.data || record || defaultResumeData);
  const targetRole = record?.targetRole || data.basic?.targetRole || '产品经理实习生';
  const name = record?.name || data.meta?.resumeName || `${data.basic?.name || '吴咏'}-${targetRole}`;
  const targetRoleVisibilityConfigured = Boolean(data.meta?.targetRoleVisibilityConfigured);
  const hiddenFields = new Set(data.basic?.hiddenFields || []);

  if (!targetRoleVisibilityConfigured) {
    hiddenFields.add('targetRole');
  }

  data.basic = {
    ...(defaultResumeData.basic || {}),
    ...(data.basic || {}),
    targetRole,
    hiddenFields: [...hiddenFields],
  };
  data.meta = {
    ...(defaultResumeData.meta || {}),
    ...(data.meta || {}),
    resumeName: name,
    targetRoleVisibilityConfigured: true,
  };

  return {
    id: record?.id || options.id?.() || defaultId(),
    name,
    targetRole,
    createdAt: record?.createdAt || now,
    updatedAt: record?.updatedAt || now,
    data,
  };
}

function normalizeAppData(value, options = {}) {
  if (!value || !Array.isArray(value.resumes)) return null;
  const resumes = value.resumes.map((item) => normalizeResumeRecord(item, options));
  const activeResumeId =
    resumes.find((item) => item.id === value.activeResumeId)?.id || resumes[0]?.id || null;

  return { resumes, activeResumeId };
}

export function createResumeByRole(role = 'product-manager', options = {}) {
  const now = options.now?.() || defaultNow();
  const built = buildResumeDataForRole(role, options);

  return normalizeResumeRecord(
    {
      id: options.id?.() || defaultId(),
      name: built.name,
      targetRole: built.targetRole,
      createdAt: now,
      updatedAt: now,
      data: built.data,
    },
    options,
  );
}

export function createResumeFromData(data, options = {}) {
  const now = options.now?.() || defaultNow();
  const targetRole = options.targetRole?.trim() || data.basic?.targetRole || '产品经理实习生';
  const name = options.name?.trim() || data.meta?.resumeName || `${data.basic?.name || '吴咏'}-${targetRole}`;
  const nextData = clone(data);

  nextData.basic = {
    ...(nextData.basic || {}),
    targetRole,
  };
  nextData.meta = {
    ...(nextData.meta || {}),
    resumeName: name,
  };

  return normalizeResumeRecord(
    {
      id: options.id?.() || defaultId(),
      name,
      targetRole,
      createdAt: now,
      updatedAt: now,
      data: nextData,
    },
    options,
  );
}

export function createInitialResumeAppData(options = {}) {
  const storage = getStorage(options.storage);
  const now = options.now || defaultNow;
  const id = options.id || defaultId;

  if (storage) {
    const savedV2 = normalizeAppData(safeParse(storage.getItem(APP_STORAGE_KEY)), { now, id });
    if (savedV2) return savedV2;

    const legacyData = safeParse(storage.getItem(LEGACY_STORAGE_KEY));
    if (legacyData) {
      const migrated = {
        resumes: [
          normalizeResumeRecord(
            {
              data: legacyData,
              name: legacyData.meta?.resumeName,
              targetRole: legacyData.basic?.targetRole,
            },
            { now, id },
          ),
        ],
        activeResumeId: null,
      };
      migrated.activeResumeId = migrated.resumes[0].id;
      saveResumeAppData(migrated, { storage });
      return migrated;
    }
  }

  const firstResume = createResumeByRole('product-manager', { now, id });
  return {
    resumes: [firstResume],
    activeResumeId: firstResume.id,
  };
}

export function saveResumeAppData(appData, options = {}) {
  const storage = getStorage(options.storage);
  if (!storage) return false;

  try {
    storage.setItem(APP_STORAGE_KEY, JSON.stringify(appData));
    return true;
  } catch (error) {
    console.warn('保存本地简历数据失败：', error);
    return false;
  }
}

export function getActiveResume(appData) {
  return appData?.resumes?.find((resume) => resume.id === appData.activeResumeId) || null;
}

export function addResume(appData, resume) {
  return {
    resumes: [...(appData.resumes || []), resume],
    activeResumeId: resume.id,
  };
}

export function duplicateResume(resume, options = {}) {
  const now = options.now?.() || defaultNow();
  return normalizeResumeRecord(
    {
      id: options.id?.() || defaultId(),
      name: `${resume.name} - 副本`,
      targetRole: resume.targetRole,
      createdAt: now,
      updatedAt: now,
      data: clone(resume.data),
    },
    options,
  );
}

export function renameResume(appData, resumeId, name, options = {}) {
  const now = options.now?.() || defaultNow();
  const trimmedName = name.trim();
  if (!trimmedName) return appData;

  return {
    ...appData,
    resumes: appData.resumes.map((resume) =>
      resume.id === resumeId
        ? {
            ...resume,
            name: trimmedName,
            data: {
              ...resume.data,
              meta: {
                ...(resume.data.meta || {}),
                resumeName: trimmedName,
              },
            },
            updatedAt: now,
          }
        : resume,
    ),
  };
}

export function removeResume(appData, resumeId) {
  const resumes = (appData.resumes || []).filter((resume) => resume.id !== resumeId);
  const activeResumeId =
    appData.activeResumeId === resumeId ? resumes[0]?.id || null : appData.activeResumeId;

  return { resumes, activeResumeId };
}

export function updateResumeData(appData, resumeId, data, options = {}) {
  const now = options.now?.() || defaultNow();

  return {
    ...appData,
    resumes: appData.resumes.map((resume) => {
      if (resume.id !== resumeId) return resume;

      const targetRole = data.basic?.targetRole || resume.targetRole;
      const name = resume.name || data.meta?.resumeName || `${data.basic?.name || '吴咏'}-${targetRole}`;

      return {
        ...resume,
        name,
        targetRole,
        updatedAt: now,
        data: {
          ...data,
          meta: {
            ...(data.meta || {}),
            resumeName: name,
          },
        },
      };
    }),
  };
}
