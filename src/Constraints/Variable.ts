module Constraints {

  export class Variable {

    private relationships: Relationship[] = [];
    private assigned    = false;
    private flexibility = 0.001;

    constructor(
      private name: string,
      private value: number = null
    ) {}

    /**
     * Assigns a value to the variable.
     */
    assignValue(v: number): void {
      this.value = v;
      this.assigned = true;
    }

    /**
     * Attempts to set the value. This method will throw an Error
     * if attempting to set a different value than already set.
     */
    setValue(v: number): void {
      if (this.hasValue()) {
        if (this.closeEnough(this.value, v)) {
          return;
        }
        throw new Error(`Contradiction: ${this} is already set (attempting to set ${v})`);
      }
      this.value = v;
      this.assigned = false;
      this.notify();
    }

    /**
     * Get the variables value or null of not set.
     */
    getValue(): number {
      return this.value;
    }

    /**
     * Check if variable has value.
     */
    hasValue(): boolean {
      return this.value !== null;
    }

    /**
     * Clear the variables value
     *
     * @param force clear the value even if it's been assigned
     */
    clearValue(force: boolean = false): void {
      if (force || !this.isAssigned()) {
        this.value = null;
      }
    }

    /**
     * Add a relationship to be notified when the
     * variable's value changes.
     */
    attach(relationship: Relationship): void {
      this.relationships.push(relationship);
    }

    /**
     * Remove a relationship and stop getting notifications
     * when the value changes.
     */
    detach(relationship: Relationship): void {
      let index = this.relationships.indexOf(relationship);
      if (index !== -1) {
        this.relationships.splice(index, 1);
      }
    }

    /**
     * Get a list of all attached relationships.
     */
    getRelationships(): Relationship[] {
      return this.relationships;
    }

    /**
     * Check if the current value has been assigned.
     */
    isAssigned(): boolean {
      return this.assigned;
    }

    /**
     * Check if there are any relationships.
     */
    isOrphan(): boolean {
      return this.relationships.length === 0;
    }

    /**
     * Get the variable name.
     */
    getName(): string {
      return this.name;
    }

    /**
     * Get a string representation of the variable.
     */
    toString(): string {
      return `${this.name}(${this.getValue()})`;
    }

    private notify(): void {
      for (let relationship of this.relationships) {
        relationship.recompute();
      }
    }

    private closeEnough(a: number, b: number): boolean {
      return Math.abs(b - a) <= this.flexibility;
    }

  }

}
