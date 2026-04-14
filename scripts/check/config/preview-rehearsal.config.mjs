import { observabilityCheckConfig } from './observability.config.mjs';

export const previewRehearsalConfig = {
  title: 'Preview / starter rehearsal',
  failurePrefix: 'Preview rehearsal failed',
  requiredEnvNames: [],
  observability: {
    ...observabilityCheckConfig,
    sectionLabel: 'check:observability',
  },
  routes: [
    {
      path: '/login',
      whenRendered: {
        bodyIncludes: ['Create a session for the next route.'],
      },
    },
    {
      path: '/events',
      whenRendered: {
        bodyIncludes: ['Event catalog'],
      },
    },
    {
      path: '/dashboard',
      whenRedirect: {
        locationIncludesAny: ['/login'],
      },
      whenRendered: {
        bodyIncludes: ['Attendee dashboard'],
        successLabel: 'rendered attendee dashboard',
      },
    },
  ],
};
