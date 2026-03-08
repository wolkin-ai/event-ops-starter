# Contract Card: Event Detail -> Registration

- Story ID: `public-registration`
- Goal: let a visitor review one event and reserve seats
- L1 terms: `EventId`, `EventPublication`, `PublicationStatus`, `RegistrationId`, `RegistrationStatus`, `EventCapacity`
- UI states: default, validation error, success
- Given/When/Then:
  - Given a published event detail page, when the visitor submits valid data, then a confirmed registration is stored
  - Given an unpublished plan, when a visitor tries to register, then registration is rejected because no live publication exists
  - Given invalid email or seat count, when submit is attempted, then the form shows an error and stores nothing
