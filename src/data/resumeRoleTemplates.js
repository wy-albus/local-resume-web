import { defaultResumeData } from './defaultResumeData.js';

const clone = (value) => JSON.parse(JSON.stringify(value));

const roleTemplateMap = {
  'product-manager': {
    label: '产品经理实习生',
    name: '吴咏-产品经理实习生',
    apply(data) {
      data.basic.targetRole = '产品经理实习生';
      data.meta.resumeName = '吴咏-产品经理实习生';
      data.projects = clone(defaultResumeData.projects);
      data.skills = [
        '产品能力：具备基础需求分析、功能规划、用户场景拆解和原型思维。',
        '用户洞察：能够结合校园服务、新媒体内容和真实使用场景梳理需求优先级。',
      ];
      return data;
    },
  },
  'data-analyst': {
    label: '数据分析师实习生',
    name: '吴咏-数据分析师实习生',
    apply(data) {
      data.basic.targetRole = '数据分析师实习生';
      data.meta.resumeName = '吴咏-数据分析师实习生';
      data.projects = [clone(defaultResumeData.projects[1]), clone(defaultResumeData.projects[0])];
      data.skills = [
        '数据能力：掌握基础 Python 数据采集、数据清洗、文本分析和分类归纳方法。',
        '工具能力：熟悉 Excel 基础分析、数据整理和可视化表达，能够从评论数据中提炼用户情绪与问题。',
      ];
      data.summary =
        '本人具备数据分析意识和主动学习能力，能够使用 Python、Excel 等工具围绕真实业务问题完成数据采集、清洗、归纳和可视化表达。';
      return data;
    },
  },
  'ai-product': {
    label: 'AI 产品实习生',
    name: '吴咏-AI产品实习生',
    apply(data) {
      data.basic.targetRole = 'AI 产品实习生';
      data.meta.resumeName = '吴咏-AI产品实习生';
      data.projects = clone(defaultResumeData.projects).map((project) =>
        project.id === 'project-1'
          ? {
              ...project,
              descriptions: [
                '围绕校园学习与生活服务场景，规划轻量校园服务网站及 Agent / 智能导航助手能力，拆解用户问题、功能入口和交互流程。',
                '使用 AI 编程工具辅助完成前端开发与页面迭代，并结合提示词调试、产品评测方法持续优化体验。',
              ],
            }
          : project,
      );
      data.skills = [
        'AI 产品能力：熟悉 AI 工具使用、Agent 场景拆解、提示词调试和产品评测基础方法。',
        '产品能力：具备需求分析、功能规划、用户场景拆解和原型思维，能够把技术能力转化为可用功能。',
      ];
      data.summary =
        '本人关注 AI 工具与产品体验结合，具备需求分析、提示词调试、Agent 场景规划和快速原型实践能力，能够从用户问题出发设计可落地的 AI 产品功能。';
      return data;
    },
  },
};

export const resumeRoleOptions = [
  { value: 'product-manager', label: '产品经理实习生' },
  { value: 'data-analyst', label: '数据分析师' },
  { value: 'ai-product', label: 'AI 产品实习生' },
  { value: 'custom', label: '自定义' },
];

export function buildResumeDataForRole(role = 'product-manager', overrides = {}) {
  const data = clone(defaultResumeData);
  const template = roleTemplateMap[role] || roleTemplateMap['product-manager'];
  const nextData = template.apply(data);
  const targetRole = overrides.targetRole?.trim() || template.label;
  const name = overrides.name?.trim() || template.name;

  nextData.basic.targetRole = targetRole;
  nextData.meta.resumeName = name;

  return {
    name,
    targetRole,
    data: nextData,
  };
}

