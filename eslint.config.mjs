import storybook from 'eslint-plugin-storybook';

import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'coverage/**',
    'storybook-static/**',
    'next-env.d.ts',
  ]),
  {
    files: ['src/app/**/*.{ts,tsx}', 'src/components/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/*/infrastructure/*'],
              message:
                'UI and composition roots must not import infrastructure directly.',
            },
            {
              group: ['@/lib/prisma', '@/generated/prisma/*'],
              message:
                'UI routes and components must stay behind composition roots instead of using Prisma directly.',
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      'src/features/**/domain/**/*.{ts,tsx}',
      'src/features/**/application/**/*.{ts,tsx}',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/lib/prisma', '@/generated/prisma/*'],
              message:
                'Domain and application layers must not depend on Prisma details.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/features/**/infrastructure/adapters/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/lib/seed-data', '@/lib/seed-database'],
              message:
                'Adapters must not bootstrap or seed runtime data. Seed through db:seed only.',
            },
          ],
        },
      ],
    },
  },
  ...storybook.configs['flat/recommended'],
]);

export default eslintConfig;
