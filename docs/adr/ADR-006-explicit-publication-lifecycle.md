# ADR-006 Explicit Publication Lifecycle

## Status

Accepted

## Context

ADR-005 separated admin planning from public publication at the persistence
level, but that alone was not enough. Without an explicit lifecycle, teams can
drift back into prototype behavior:

- creating an event plan and publishing it implicitly in the same path
- treating plan existence as enough for public registration
- withdrawing public visibility in ways that break attendee expectations

This starter needs a clear rule set that stays valid before PMF and still
scales when publication becomes a richer workflow later.

## Decision

We adopt the following publication rules:

1. Creating an `EventPlan` does not create an `EventPublication`.
2. Publishing and withdrawing must go through explicit admin use cases.
3. Public catalog pages and new registrations depend on live publication state.
4. Withdrawing a publication is rejected once registrations already exist.
5. Contract cards and glossary entries must describe publication lifecycle terms.
6. Market-facing copy is edited on `EventPublication`, not by mutating `EventPlan`.

## Consequences

- Admin planning remains replaceable without forcing public copy decisions too
  early.
- Public visibility has one clear transition point that can later grow into a
  richer approval workflow.
- Registration safety improves because a hidden or withdrawn plan no longer
  behaves like a live event.
- Editorial changes can evolve independently from operational plan changes.
- The starter carries one extra admin operation early, but it prevents implicit
  coupling from re-entering the codebase.
