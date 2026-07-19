export const defaultResumeData = {
  meta: {
    templateName: '经典中文简历',
    resumeName: '吴咏-产品经理实习生',
    hiddenSections: ['internships'],
    sectionOrder: ['education', 'projects', 'internships', 'campus', 'skills', 'honors', 'summary'],
  },
  basic: {
    name: '吴咏',
    targetRole: '产品经理实习生',
    age: '19岁',
    gender: '男',
    ethnicity: '汉',
    hometown: '四川',
    phone: '18297836204',
    email: '3103166830@qq.com',
    avatar: '',
    avatarFit: {
      x: 50,
      y: 50,
      scale: 1,
    },
    hiddenFields: [],
    extraFields: [],
  },
  education: {
    period: '2024-09 ~ 至今',
    school: '电子科技大学',
    major: '金融学 计算机科学与技术',
    degree: '本科',
    gpa: 'GPA 3.55/4',
    courses: '西方经济学、金融学基础、会计学与财务分析、程序设计基础、软件设计基础等。',
    hiddenFields: [],
  },
  projects: [
    {
      id: 'project-1',
      period: '2026-05 ~ 至今',
      name: '轻量校园服务网站开发',
      role: '独立开发者',
      descriptions: [
        '围绕高中学生学习与校园生活场景，独立完成校园服务网站 MVP 的需求分析、功能规划、页面设计与上线部署。',
        '使用 AI 编程工具辅助完成前端开发与页面迭代，项目已部署至 Netlify，可通过公开链接访问。',
      ],
    },
    {
      id: 'project-2',
      period: '2025-03 ~ 2025-10',
      name: '微博 315 晚会用户评论爬虫分析',
      role: '核心研究成员',
      descriptions: [
        '自学 Python 爬虫，围绕微博 315 晚会相关评论进行数据采集、整理与分析。',
        '对用户评论内容进行分类归纳，识别用户关注的核心问题与情绪倾向，为理解用户舆情和公共议题传播提供支持。',
      ],
    },
  ],
  internships: [],
  campus: [
    {
      id: 'campus-1',
      period: '2025-09 ~ 至今',
      name: '电子科技大学经济与管理学院“经彩视界”新媒体工作室',
      role: '负责人',
      descriptions: [
        '统筹学院新媒体内容生产工作，负责选题策划、推文审核、视频剪辑安排、任务分配与进度跟进。',
        '组织成员培训，规范推文排版、视频剪辑和内容审核流程，提高团队内容产出质量。',
      ],
    },
  ],
  skills: [
    '产品能力：具备基础需求分析、功能规划、用户场景拆解和原型思维。',
    '数据能力：掌握基础 Python 数据处理和文本分析方法，具备一定数据整理与可视化能力。',
  ],
  honors: [
    '大学英语四级。',
    '校级/院级活动参与及学生工作经历。',
  ],
  summary:
    '本人学习能力较强，能够围绕真实问题主动学习并完成项目实践。具备产品思维、数据分析意识和内容运营经验，能够从用户需求、业务场景和技术实现三个角度思考问题。',
};
