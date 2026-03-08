# Contract Card: Admin Publication Editor -> Save Public Copy

- Story ID: `admin-event-publication-edit`
- Goal: let an operator edit the public-facing copy without mutating the EventPlan
- L1 terms: `EventId`, `EventPublication`, `PublicationStatus`, `PublicationCopy`
- UI states: load existing copy, save success, validation error, missing publication
- Given/When/Then:
  - Given an existing publication, when the operator updates the public title and hero copy, then the public event page reflects the edited text
  - Given a plan with no publication yet, when the operator opens the editor, then the system explains that publish must happen first
  - Given empty highlights, when save is attempted, then the system rejects the update
