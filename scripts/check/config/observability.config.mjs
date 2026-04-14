function isValidHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

export const observabilityCheckConfig = {
  title: 'Observability readiness',
  checks: [
    {
      id: 'sentry-client',
      env: 'NEXT_PUBLIC_SENTRY_DSN',
      validate: ({ values }) => isValidHttpUrl(values.NEXT_PUBLIC_SENTRY_DSN),
      readyDetail: 'NEXT_PUBLIC_SENTRY_DSN is set.',
      pendingDetail: 'NEXT_PUBLIC_SENTRY_DSN is missing.',
      invalidDetail:
        'NEXT_PUBLIC_SENTRY_DSN is set, but it does not look like a valid URL.',
    },
    {
      id: 'sentry-release-upload',
      allOf: ['SENTRY_AUTH_TOKEN', 'SENTRY_ORG', 'SENTRY_PROJECT'],
      readyDetail:
        'SENTRY_AUTH_TOKEN / SENTRY_ORG / SENTRY_PROJECT are all set.',
      pendingDetail:
        'One or more of SENTRY_AUTH_TOKEN / SENTRY_ORG / SENTRY_PROJECT are missing.',
    },
  ],
};
