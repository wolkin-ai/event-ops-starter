const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class RegistrationEmail {
  readonly value: string;

  constructor(value: string) {
    const normalized = value.trim().toLowerCase();

    if (!EMAIL_PATTERN.test(normalized)) {
      throw new Error('RegistrationEmail must be a valid email address.');
    }

    this.value = normalized;
  }
}
