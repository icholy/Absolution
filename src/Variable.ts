module uzi {

  /**
   * Each variable has a VState which describes where
   * its value originated
   */
  export const enum VState {
    NONE,
    EXPLICIT,
    DIGEST,
    ENVIRONMENT
  }

  /**
   * If the difference between two values is less than this
   * then they're considered equal.
   */
  const VARIABLE_FLEXIBILITY = 0.001;

  /**
   * A variable holds a value and notifies listeners when that value changes.
   */
  export class Variable {

    private value: number;

    private callbacks     = [] as Function[];
    private relationships = [] as Relationship[];
    private digestID      = -1;
    private state         = VState.NONE;

    constructor(private name: string) {}

    /**
     * Assigns a value to the variable.
     */
    assignValue(v: number, state = VState.EXPLICIT): void {
      this.value = v;
      this.digestID = -1;
      this.state = state;
    }

    /**
     * Attempts to set the value. This method will throw an Error
     * if attempting to set a different value than already set.
     */
    setValue(v: number, digestID: number): void {
      if (this.hasValue(digestID)) {
        if (this.isCloseEnough(v)) {
          return;
        }
        throw new Error(`Contradiction: ${this} is already set (attempting to set ${v})`);
      }
      this.digestID = digestID;
      this.value = v;
      this.state = VState.DIGEST;
      this.notify(digestID);
    }

    /**
     * Get the variables value or null of not set.
     */
    getValue(): number {
      return this.value;
    }

    /**
     * Get the variables state.
     */
    getState(): VState {
      return this.state;
    }

    /**
     * Check if variable has value.
     */
    hasValue(digestID: number): boolean {
      switch (this.state) {
        case VState.NONE:
          return false;
        case VState.EXPLICIT:
          return true;
        case VState.ENVIRONMENT:
          return true;
        case VState.DIGEST:
          return this.digestID === digestID;
      }
    }

    /**
     * Clear the variables value
     *
     * @param force clear the value even if it's been assigned
     */
    clearValue(): void {
      this.value = null;
      this.state = VState.NONE;
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
     * Check if the variable is needed anymore.
     */
    canDestroy(): boolean {
      return this.relationships.length === 0 
          && this.state !== VState.EXPLICIT;
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

    /**
     * Add a listener to invoke when the variable changes value.
     */
    onChange(callback: Function): void {
      this.callbacks.push(callback);
    }

    private notify(digestID: number): void {
      for (let relationship of this.relationships) {
        relationship.notify(digestID);
      }
      for (let callback of this.callbacks) {
        callback();
      }
    }

    /**
     * Check if the value is close enough to the current
     * value to be considered equal
     */
    private isCloseEnough(v: number): boolean {
      return Math.abs(v - this.value) <= VARIABLE_FLEXIBILITY;
    }

  }

  export class Constant extends Variable {

    constructor(v: number) {
      super("Const");
      this.assignValue(v);
    }

  }

  export class Transient extends Variable {

    canDestroy(): boolean {
      return true;
    }
  }

}
