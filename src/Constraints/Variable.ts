module Constraints {

  export class Variable {

    private listeners: Relationship[] = [];
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

    attach(relationship: Relationship): void {
      this.listeners.push(relationship);
    }

    detach(relationship: Relationship): void {
      let index = this.listeners.indexOf(relationship);
      if (index !== -1) {
        this.listeners.splice(index, 1);
      }
    }

    toString(): string {
      return `${this.name}(${this.getValue()})`;
    }

    private notify(): void {
      for (let relationship of this.listeners) {
        relationship.variableValueChanged();
      }
    }

    private closeEnough(a: number, b: number): boolean {
      return Math.abs(b - a) <= this.flexibility;
    }

  }

}
