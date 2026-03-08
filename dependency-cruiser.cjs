/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'domain-no-outer-layers',
      severity: 'error',
      from: { path: '^src/features/[^/]+/domain' },
      to: {
        path: '^src/(app|components|composition)|^src/features/[^/]+/(application|infrastructure)',
      },
    },
    {
      name: 'application-no-infrastructure-or-ui',
      severity: 'error',
      from: { path: '^src/features/[^/]+/application' },
      to: {
        path: '^src/(app|components)|^src/features/[^/]+/infrastructure',
      },
    },
    {
      name: 'infrastructure-no-ui',
      severity: 'error',
      from: { path: '^src/features/[^/]+/infrastructure' },
      to: { path: '^src/(app|components)' },
    },
    {
      name: 'ui-no-infrastructure',
      severity: 'error',
      from: { path: '^src/(app|components)' },
      to: { path: '^src/features/[^/]+/infrastructure' },
    },
  ],
  options: {
    tsConfig: {
      fileName: 'tsconfig.json',
    },
    doNotFollow: {
      path: 'node_modules',
    },
    exclude: {
      path: 'node_modules|\\.next|coverage|storybook-static',
    },
  },
};
