export const severityRank = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
  info: 0,
};

export const reviewPolicies = [
  {
    type: 'architecture',
    blockingAt: 'high',
    defaultTargets: ['src', 'docs/adr', 'prisma', 'dependency-cruiser.cjs'],
    triggers: [
      /^src\/features\//,
      /^src\/composition\//,
      /^docs\/adr\//,
      /^prisma\//,
      /^dependency-cruiser\.cjs$/,
      /^package(-lock)?\.json$/,
    ],
  },
  {
    type: 'security',
    blockingAt: 'high',
    defaultTargets: [
      'src/app/api',
      'src/features/session',
      'src/features/registration',
    ],
    triggers: [
      /^src\/app\/api\//,
      /^src\/features\/session\//,
      /^src\/features\/registration\//,
      /^src\/components\/.*(form|login)/,
      /^package(-lock)?\.json$/,
    ],
  },
  {
    type: 'performance',
    blockingAt: 'high',
    defaultTargets: ['src/app', 'src/components', 'next.config.ts'],
    triggers: [
      /^src\/app\//,
      /^src\/components\//,
      /^next\.config\.ts$/,
      /^package(-lock)?\.json$/,
    ],
  },
];
