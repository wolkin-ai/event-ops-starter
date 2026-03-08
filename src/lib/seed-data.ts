export const publicEventSeeds = [
  {
    id: 'evt_signal_summit_tokyo',
    slug: 'signal-summit-tokyo',
    title: 'Signal Summit Tokyo',
    summary:
      'A flagship operations event for product, growth, and community teams who need a shared playbook for live experiences.',
    city: 'Tokyo',
    venue: 'Harbor Stage, Takeshiba',
    heroEyebrow: 'Flagship / 1-day summit',
    heroBlurb:
      'Build a high-touch program, rehearse incidents before the doors open, and align the room around one operating narrative.',
    audience: 'Operators, producers, field marketers',
    trackLabel: 'Summit',
    seatsTotal: 240,
    seatsRemaining: 31,
    status: 'scheduled',
    schedule: {
      startsAt: '2026-05-12T09:30:00+09:00',
      endsAt: '2026-05-12T19:00:00+09:00',
      timezone: 'Asia/Tokyo',
    },
    highlights: [
      'Campaign room design workshop',
      'Sponsor activation teardown',
      'Live operations tabletop exercise',
    ],
    operatorNotes: [
      'The public narrative and the admin checklist share one naming system.',
      'All attendee-facing promises map to a concrete owner in ops.',
    ],
  },
  {
    id: 'evt_ops_camp_osaka',
    slug: 'ops-camp-osaka',
    title: 'Ops Camp Osaka',
    summary:
      'A practical field lab for smaller teams that need repeatable production systems without enterprise overhead.',
    city: 'Osaka',
    venue: 'North Pier Studio',
    heroEyebrow: 'Field lab / 40 seats',
    heroBlurb:
      'Learn how to run event logistics, check-in, and post-event follow-up with a small but high-signal toolkit.',
    audience: 'Startup operations, regional communities',
    trackLabel: 'Workshop',
    seatsTotal: 40,
    seatsRemaining: 8,
    status: 'scheduled',
    schedule: {
      startsAt: '2026-06-07T13:00:00+09:00',
      endsAt: '2026-06-07T18:30:00+09:00',
      timezone: 'Asia/Tokyo',
    },
    highlights: [
      'Check-in station design',
      'Volunteer runbook clinic',
      'Post-event signal review',
    ],
    operatorNotes: [
      'The admin UI must surface which tasks are still brittle.',
      'Default status language stays consistent between stories and domain types.',
    ],
  },
  {
    id: 'evt_field_lab_fukuoka',
    slug: 'field-lab-fukuoka',
    title: 'Field Lab Fukuoka',
    summary:
      'A compact rehearsal for distributed teams validating session timing, hospitality, and attendee handoff quality.',
    city: 'Fukuoka',
    venue: 'Canal Works',
    heroEyebrow: 'Pilot / invite-friendly',
    heroBlurb:
      'Use a tightly scoped format to stress-test registration copy, operator dashboards, and day-of execution.',
    audience: 'Community builders, startup programs',
    trackLabel: 'Pilot',
    seatsTotal: 60,
    seatsRemaining: 22,
    status: 'scheduled',
    schedule: {
      startsAt: '2026-07-18T14:00:00+09:00',
      endsAt: '2026-07-18T20:00:00+09:00',
      timezone: 'Asia/Tokyo',
    },
    highlights: [
      'Host script review',
      'Incident response cards',
      'Participant journey mapping',
    ],
    operatorNotes: [
      'Pilot slices should be small enough to test end-to-end in Storybook and Playwright.',
      'No admin naming should leak into public marketing copy.',
    ],
  },
] as const;

export const adminEventSeeds = [
  {
    id: 'adm_q2_signal',
    title: 'Q2 Signal Summit Tokyo',
    slug: 'q2-signal-summit-tokyo',
    city: 'Tokyo',
    venue: 'Harbor Stage, Takeshiba',
    startsAt: '2026-05-12T09:30:00+09:00',
    capacity: 240,
    track: 'Summit',
    summary:
      'Mainline flagship event with sponsor, content, and hospitality squads.',
    status: 'scheduled',
    publicationStatus: 'published',
    createdAt: '2026-02-10T10:00:00+09:00',
  },
  {
    id: 'adm_q2_ops_camp',
    title: 'Ops Camp Osaka',
    slug: 'ops-camp-osaka',
    city: 'Osaka',
    venue: 'North Pier Studio',
    startsAt: '2026-06-07T13:00:00+09:00',
    capacity: 40,
    track: 'Workshop',
    summary: 'Regional workshop focused on lean event systems for small teams.',
    status: 'scheduled',
    publicationStatus: 'published',
    createdAt: '2026-02-24T15:00:00+09:00',
  },
] as const;

export function findSeedEventById(eventId: string) {
  return publicEventSeeds.find((event) => event.id === eventId) ?? null;
}

export function findSeedEventBySlug(slug: string) {
  return publicEventSeeds.find((event) => event.slug === slug) ?? null;
}
