
export abstract class Connector {

  private listeners: Function[] = [];

  notify(): void {
    for (let listener of this.listeners) {
      listener();
    }
  }

  onNotify(listener: Function): void {
    this.listeners.push(listener);
  }

  abstract setValue(v: number, id?: number): void;
  abstract getValue(): number;
  abstract hasValue(): boolean;
  abstract clearValue(): void;
}

export class Variable extends Connector {

  private name: string;
  private value: number;
  private isSet: boolean;

  constructor(name: string) {
    super();
    this.name = name;
    this.isSet = false;
  }

  setValue(v: number): void {
    if (this.isSet) {
      if (v !== this.value) {
        throw new Error(`Contradiction: ${this} is already set`);
      } else {
        return;
      }
    }
    this.isSet = true;
    this.value = v;
    this.notify();
  }

  getValue(): number {
    return this.isSet ? this.value : null;
  }

  hasValue(): boolean {
    return this.isSet;
  }

  clearValue(): void {
    this.isSet = false;
  }

  toString(): string {
    return `${this.name}(${this.getValue()})`;
  }

}

export class Constant extends Connector {

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
