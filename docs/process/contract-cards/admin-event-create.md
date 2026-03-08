# Contract Card: Admin Event List -> Event Create

- Story ID: `admin-event-create`
- Goal: let an operator add one new event from the admin shell
- L1 terms: `EventId`, `Track`, `EventCapacity`, `PublicationStatus`
- UI states: default, validation error, created draft
- Given/When/Then:
  - Given the create form, when valid data is submitted, then a draft plan is added to the list view without creating a public publication
  - Given invalid capacity, when submit is attempted, then the form shows a validation error
