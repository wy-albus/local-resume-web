const STORAGE_KEY = 'chinese-resume-builder-data';

export function loadResumeData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.warn('读取本地简历数据失败：', error);
    return null;
  }
}

export function saveResumeData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.warn('保存本地简历数据失败：', error);
    return false;
  }
}

export function clearResumeData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('清除本地简历数据失败：', error);
  }
}
