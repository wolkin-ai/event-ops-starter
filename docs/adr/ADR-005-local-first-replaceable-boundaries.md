# ADR-005 Local-first Replaceable Boundaries

## Status

Accepted

## Context

This starter must stay usable before PMF and before managed infrastructure exists.
At the same time, it must not trap the team in a prototype-only design.

The main risks were:

- runtime seed logic hidden inside repository adapters
- public catalog and admin planning coupled to one persistence model
- session handling implemented as page and route helper code instead of a replaceable boundary

## Decision

We adopt the following rules:

1. Local development must run with SQLite and demo session cookies only.
2. Seed data is explicit and runs through `db:seed` / `db:prepare`, not through adapters.
3. Admin planning and public publication use separate persistence models.
4. Session handling goes through the `session` feature and its gateway.
5. Composition roots must allow dependency overrides so local, test, and future production adapters can be swapped.

## Consequences

- Local setup remains simple and does not require an external server.
- Replacing auth or publication flow later becomes an infrastructure task, not a domain rewrite.
- The codebase carries a little more structure early, but the boundary drift risk is lower.
