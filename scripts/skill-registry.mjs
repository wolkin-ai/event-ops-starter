export const coreSkills = [
  {
    name: 'safe-change-flow',
    description: '安全に変更を進めるための project-local guardrail skill。',
    aliases: ['ai-safe-implementation-flow'],
  },
  {
    name: 'define-domain-language',
    description: 'L1/L2 語彙の固定と glossary 更新を支援する skill。',
    aliases: [],
  },
  {
    name: 'story-ui-spec',
    description: 'Storybook 主導で slice を定義するための skill。',
    aliases: ['storybook'],
  },
  {
    name: 'design-public-ui',
    description: '公開向け UI の構図と visual direction を定める skill。',
    aliases: ['frontend-design'],
  },
  {
    name: 'design-admin-ui',
    description: '管理画面向けの dense UI を定める skill。',
    aliases: [],
  },
  {
    name: 'implement-domain-usecase',
    description: 'domain/application 実装を進めるための skill。',
    aliases: [],
  },
  {
    name: 'review-architecture',
    description: '構造と依存方向をレビューする skill。',
    aliases: ['codex-architect'],
  },
  {
    name: 'review-security',
    description: 'セキュリティ観点でレビューする skill。',
    aliases: ['codex-security'],
  },
  {
    name: 'review-performance',
    description: 'パフォーマンス観点でレビューする skill。',
    aliases: ['codex-performance'],
  },
  {
    name: 'investigate-issue',
    description: '不具合調査を構造化する skill。',
    aliases: ['codex-investigate'],
  },
];

export const requiredSections = [
  'Purpose',
  'Use When',
  'Inputs',
  'Workflow',
  'Output Contract',
  'Guardrails',
  'Related Skills',
];
