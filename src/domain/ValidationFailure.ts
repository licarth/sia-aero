export class ValidationFailure {
  reason: string;
  value: any;

  constructor(value: any, reason: string) {
    this.value = value;
    this.reason = reason;
  }

  toError() {
    return new Error(`Value should be ${this.reason} : ${this.value}`);
  }

  static create(value: any, reason: string) {
    return new ValidationFailure(value, reason);
  }
}
