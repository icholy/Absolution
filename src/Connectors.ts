
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

  constructor(name: string) {
    super(name, null);
  }

  setValue(v: number): void {
    if (v === this.value) {
      return;
    }
    if (this.hasValue()) {
      throw new Error(`Contradiction: ${this} is already set`);
    }
    this.value = v;
    this.notify();
  }

  getValue(): number {
    return this.value;
  }

  hasValue(): boolean {
    return this.value !== null;
  }

  clearValue(): void {
    this.value = null;
  }

}

class Constant extends Connector {

  constructor(value: number) {
    super("Const", value);
  }

  getValue(): number {
    return this.value;
  }

  hasValue(): boolean {
    return true;
  }

  setValue(v: number): void {
    if (v !== this.value) {
      throw new Error(
        `Contradiction: attempting to set ${this} to ${v}`);
    }
  }

  clearValue(): void {
    // do nothing
  }
  
}
