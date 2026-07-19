export const DEFAULT_SECTION_ORDER = [
  'education',
  'projects',
  'internships',
  'campus',
  'skills',
  'honors',
  'summary',
];

export function normalizeSectionOrder(sectionOrder = []) {
  const allowedSections = new Set(DEFAULT_SECTION_ORDER);
  const ordered = (sectionOrder || []).filter((section) => allowedSections.has(section));
  const uniqueOrdered = [...new Set(ordered)];
  const missingSections = DEFAULT_SECTION_ORDER.filter((section) => !uniqueOrdered.includes(section));

  return [...uniqueOrdered, ...missingSections];
}

export function moveSectionInOrder(sectionOrder = [], section, direction) {
  const order = normalizeSectionOrder(sectionOrder);
  const currentIndex = order.indexOf(section);
  if (currentIndex < 0) return order;

  const nextIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
  if (nextIndex < 0 || nextIndex >= order.length) return order;

  const nextOrder = [...order];
  const [removed] = nextOrder.splice(currentIndex, 1);
  nextOrder.splice(nextIndex, 0, removed);
  return nextOrder;
}

export function moveVisibleSectionInOrder(sectionOrder = [], section, direction, hiddenSections = []) {
  const order = normalizeSectionOrder(sectionOrder);
  const hiddenSet = new Set(hiddenSections || []);
  const visibleOrder = order.filter((item) => !hiddenSet.has(item));
  const currentVisibleIndex = visibleOrder.indexOf(section);
  if (currentVisibleIndex < 0) return order;

  const nextVisibleIndex = direction === 'up' ? currentVisibleIndex - 1 : currentVisibleIndex + 1;
  if (nextVisibleIndex < 0 || nextVisibleIndex >= visibleOrder.length) return order;

  const targetSection = visibleOrder[nextVisibleIndex];
  const currentIndex = order.indexOf(section);
  const targetIndex = order.indexOf(targetSection);
  const nextOrder = [...order];
  [nextOrder[currentIndex], nextOrder[targetIndex]] = [nextOrder[targetIndex], nextOrder[currentIndex]];
  return nextOrder;
}
