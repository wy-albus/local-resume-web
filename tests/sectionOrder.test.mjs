import assert from 'node:assert/strict';
import {
  DEFAULT_SECTION_ORDER,
  moveSectionInOrder,
  moveVisibleSectionInOrder,
  normalizeSectionOrder,
} from '../src/utils/sectionOrder.js';

{
  assert.deepEqual(normalizeSectionOrder(['campus', 'projects']), [
    'campus',
    'projects',
    'education',
    'internships',
    'skills',
    'honors',
    'summary',
  ]);
}

{
  assert.deepEqual(moveSectionInOrder(DEFAULT_SECTION_ORDER, 'internships', 'up'), [
    'education',
    'internships',
    'projects',
    'campus',
    'skills',
    'honors',
    'summary',
  ]);
}

{
  assert.deepEqual(moveSectionInOrder(DEFAULT_SECTION_ORDER, 'education', 'up'), DEFAULT_SECTION_ORDER);
}

{
  assert.deepEqual(
    moveVisibleSectionInOrder(DEFAULT_SECTION_ORDER, 'projects', 'down', ['internships']),
    ['education', 'campus', 'internships', 'projects', 'skills', 'honors', 'summary'],
  );
}

console.log('section order tests passed');
