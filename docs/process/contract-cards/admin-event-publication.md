# Contract Card: Admin Event List -> Publish / Withdraw Publication

- Story ID: `admin-event-publication`
- Goal: let an operator explicitly publish or withdraw one event publication
- L1 terms: `EventId`, `EventPublication`, `PublicationStatus`, `EventCapacity`
- UI states: unpublished, published, publish error, withdraw blocked
- Given/When/Then:
  - Given a draft or unpublished admin plan, when the operator publishes it, then a live public publication is created from the plan
  - Given a published event with no registrations, when the operator withdraws it, then the public publication becomes unavailable for new registrations
  - Given a published event with existing registrations, when the operator tries to withdraw it, then the system rejects the action
