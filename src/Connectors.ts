
abstract class Connector {

  private listeners: Function[] = [];

  constructor(
    protected name: string,
    protected value: number
  ) {}

  notify(): void {
    for (let listener of this.listeners) {
      listener();
    }
  }

  onChange(listener: Function): void {
    this.listeners.push(listener);
  }

  toString(): string {
    return `${this.name}(${this.getValue()})`;
  }

  abstract setValue(v: number): void;
  abstract getValue(): number;
  abstract hasValue(): boolean;
  abstract clearValue(): void;
}

class Variable extends Connector {

  private isVolatile: boolean = true;
  private flexibility = 0.1;

  constructor(name: string, value: number = null) {
    super(name, value);
  }

  changeValue(v: number, isVolatile: boolean = true): void {
    this.value = v;
    this.isVolatile = isVolatile;
  }

  setValue(v: number, isVolatile: boolean = true): void {
    if (this.hasValue()) {
      if (this.closeEnough(this.value, v)) {
        return;
      }
      throw new Error(`Contradiction: ${this} is already set (attempting to set ${v})`);
    }
    this.value = v;
    this.isVolatile = isVolatile;
    this.notify();
  }

  getValue(): number {
    return this.value;
  }

  hasValue(): boolean {
    return this.value !== null;
  }

  clearValue(force: boolean = false): void {
    if (force || this.isVolatile) {
      this.value = null;
    }
  }

  private closeEnough(a: number, b: number): boolean {
    return Math.abs(b - a) <= this.flexibility;
  }

}
