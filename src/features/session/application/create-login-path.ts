import type { SessionRole } from '@/features/session/domain/entities/session';

export function createLoginPath(nextPath: string, role?: SessionRole) {
  const params = new URLSearchParams();
  params.set('next', nextPath);

  if (role) {
    params.set('role', role);
  }

  return `/login?${params.toString()}`;
}
