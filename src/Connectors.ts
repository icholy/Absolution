
abstract class Connector {

  private listeners: Function[] = [];

  notify(): void {
    for (let listener of this.listeners) {
      listener();
    }
  }

  onChange(listener: Function): void {
    this.listeners.push(listener);
  }

  abstract setValue(v: number): void;
  abstract getValue(): number;
  abstract hasValue(): boolean;
  abstract clearValue(): void;
}

class Variable extends Connector {

  private name: string;
  private value: number;

  constructor(name: string) {
    super();
    this.name = name;
    this.value = null;
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

  toString(): string {
    return `${this.name}(${this.getValue()})`;
  }

}

class Constant extends Connector {

  constructor(private value: number) {
    super();
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

  toString(): string {
    return `Const(${this.value})`;
  }
  
}
