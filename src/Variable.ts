
class Variable {

  private listeners: Function[] = [];
  private shouldPreserve: boolean = true;
  private flexibility = 0.001;

  constructor(
    private name: string,
    private value: number = null
  ) {}

  assignValue(v: number): void {
    this.value = v;
    this.shouldPreserve = true;
  }

  setValue(v: number): void {
    if (this.hasValue()) {
      if (this.closeEnough(this.value, v)) {
        return;
      }
      throw new Error(`Contradiction: ${this} is already set (attempting to set ${v})`);
    }
    this.value = v;
    this.shouldPreserve = false;
    this.notify();
  }

  getValue(): number {
    return this.value;
  }

  hasValue(): boolean {
    return this.value !== null;
  }

  clearValue(force: boolean = false): void {
    if (force || !this.shouldPreserve) {
      this.value = null;
    }
  }

  onChange(listener: Function): void {
    this.listeners.push(listener);
  }

  toString(): string {
    return `${this.name}(${this.getValue()})`;
  }

  private notify(): void {
    for (let listener of this.listeners) {
      listener();
    }
  }

  private closeEnough(a: number, b: number): boolean {
    return Math.abs(b - a) <= this.flexibility;
  }

}
