export class EventCapacity {
  readonly value: number;

  constructor(value: number) {
    if (!Number.isInteger(value) || value < 1 || value > 10000) {
      throw new Error('EventCapacity must be an integer between 1 and 10000.');
    }

    this.value = value;
  }
}
