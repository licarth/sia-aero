export class ValidationFailure {
  reason: string;

  constructor(reason: string) {
    this.reason = reason;
  }

  toError() {
    return new Error(this.reason);
  }

  static create(reason: string) {
    return new ValidationFailure(reason);
  }
}
