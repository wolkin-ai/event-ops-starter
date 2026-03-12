import type { AdminEvent } from '@/features/admin-events/domain/entities/admin-event';
import type { AdminEventPublication } from '@/features/admin-events/domain/entities/admin-event-publication';
import {
  buildEventPlanRecordFromAdminEvent,
  buildEventPublicationRecordFromPlan,
  toAdminEvent,
  toAdminEventPublication,
} from '@/lib/event-records';

export function buildAdminEventPlanRecord(event: AdminEvent) {
  return buildEventPlanRecordFromAdminEvent(event);
}

export function buildAdminEventPublicationRecord(
  ...args: Parameters<typeof buildEventPublicationRecordFromPlan>
) {
  return buildEventPublicationRecordFromPlan(...args);
}

export function parseAdminEvent(value: Parameters<typeof toAdminEvent>[0]) {
  return toAdminEvent(value);
}

export function parseAdminEventPublication(
  value: Parameters<typeof toAdminEventPublication>[0],
): AdminEventPublication {
  return toAdminEventPublication(value);
}
