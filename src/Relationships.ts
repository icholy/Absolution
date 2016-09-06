module uzi {

  /**
   * The base class for all relationships between variables.
   */
  export abstract class Relationship {

    private variables: Variable[];
    private digestID: number;

    /**
     * Notify the relationship that one if its variables has changed
     */
    notify(id: number): void {
      if (id !== this.digestID && this.solve(id)) {
        this.digestID = id;
      }
    }

    /**
     * Try to solve the constraint. Returns a boolean value
     * indicating of it was solved or not.
     *
     * @param id the digest id
     * @return true if it was solved.
     */
    protected abstract solve(id: number): boolean;

    /**
     * Attach this relationship to the supplied variables
     */
    protected attachTo(...variables: Variable[]): void {
      this.variables = [];
      for (let v of variables) {
        v.attach(this);
        this.variables.push(v);
      }
    }

    /**
     * Get all the used variables.
     */
    getVariables(): Variable[] {
      return this.variables;
    }

  }

  export class Equality extends Relationship {

    constructor(
      private left:  Variable,
      private right: Variable
    ) {
      super();
      this.attachTo(left, right);
    }

    solve(id: number): boolean {
      switch (true) {
        case this.left.hasValue(id):
          this.right.setValue(this.left.getValue(), id);
          return true;
        case this.right.hasValue(id):
          this.left.setValue(this.right.getValue(), id);
          return true;
        default:
          return false;
      }
    }

    toString(): string {
      return `${this.left} = ${this.right}`;
    }

  }

  export class Addition extends Relationship {

    constructor(
      private addend1: Variable,
      private addend2: Variable,
      private sum:     Variable
    ) {
      super();
      this.attachTo(addend1, addend2, sum);
    }

    solve(id: number): boolean {
      switch (true) {
        case this.addend1.hasValue(id) && this.addend2.hasValue(id):
          this.sum.setValue(
              this.addend1.getValue() + this.addend2.getValue(), id);
          return true;
        case (this.addend1.hasValue(id) && this.sum.hasValue(id)):
          this.addend2.setValue(
              this.sum.getValue() - this.addend1.getValue(), id);
          return true;
        case (this.addend2.hasValue(id) && this.sum.hasValue(id)):
          this.addend1.setValue(
              this.sum.getValue() - this.addend2.getValue(), id);
          return true;
        default:
          return false;
      }
    }

    toString(): string {
      return `${this.sum} = ${this.addend1} + ${this.addend2}`;
    }

  }

  export class Multiplication extends Relationship {

    constructor(
      private mult1:   Variable,
      private mult2:   Variable,
      private product: Variable
    ) {
      super();
      this.attachTo(mult1, mult2, product);
    }

    solve(id: number): boolean {
      switch (true) {
        case (this.mult1.hasValue(id) && this.mult2.hasValue(id)):
          this.product.setValue(
              this.mult1.getValue() * this.mult2.getValue(), id);
          return true;
        case (this.product.hasValue(id) && this.mult1.hasValue(id)):
          this.mult2.setValue(
              this.product.getValue() / this.mult1.getValue(), id);
          return true;
        case (this.product.hasValue(id) && this.mult2.hasValue(id)):
          this.mult1.setValue(
              this.product.getValue() / this.mult2.getValue(), id);
          return true;
        default:
          return false;
      }
    }

    toString(): string {
      return `${this.product} = ${this.mult1} * ${this.mult2}`;
    }

  }

  export class Subtraction extends Relationship {

    constructor(
      private minuend:    Variable,
      private subtrahend: Variable,
      private difference: Variable
    ) {
      super();
      this.attachTo(minuend, subtrahend, difference);
    }

    solve(id: number): boolean {
      switch (true) {
        case (this.minuend.hasValue(id) && this.subtrahend.hasValue(id)):
          this.difference.setValue(
              this.minuend.getValue() - this.subtrahend.getValue(), id);
          return true;
        case (this.minuend.hasValue(id) && this.difference.hasValue(id)):
          this.subtrahend.setValue(
              this.minuend.getValue() - this.difference.getValue(), id);
          return true;
        case (this.subtrahend.hasValue(id) && this.difference.hasValue(id)):
          this.minuend.setValue(
              this.subtrahend.getValue() + this.difference.getValue(), id);
          return true;
        default:
          return false;
      }
    }

    toString(): string {
      return `${this.difference} = ${this.minuend} - ${this.subtrahend}`;
    }

  }

  export class Division extends Relationship {

    constructor(
      private dividend: Variable,
      private divisor:  Variable,
      private quotient: Variable
    ) {
      super();
      this.attachTo(dividend, divisor, quotient);
    }

    solve(id: number): boolean {
      switch (true) {
        case (this.dividend.hasValue(id) && this.divisor.hasValue(id)):
          this.quotient.setValue(
              this.dividend.getValue() / this.divisor.getValue(), id);
          return true;
        case (this.dividend.hasValue(id) && this.quotient.hasValue(id)):
          this.divisor.setValue(
              this.dividend.getValue() / this.quotient.getValue(), id);
          return true;
        case (this.divisor.hasValue(id) && this.quotient.hasValue(id)):
          this.dividend.setValue(
              this.divisor.getValue() * this.quotient.getValue(), id);
          return true;
        default:
          return false;
      }
    }

    toString(): string {
      return `${this.quotient} = ${this.dividend} / ${this.divisor}`;
    }

  }

  export class CustomRelationship extends Relationship {

    private solver: (id: number) => boolean;

    constructor(
      private name:  string,
      private func:  Function,

      private input:  Variable[],
      private output: Variable
    ) {
      super();

      switch (input.length) {
        case 1:
          this.solver = this.solve1.bind(this);
          break;
        case 2:
          this.solver = this.solve2.bind(this);
          break;
        case 3:
          this.solver = this.solve3.bind(this);
          break;
        default:
          this.solver = this.solveN.bind(this);
      }

      this.attachTo(...input);
    }

    solve(id: number): boolean {
      return this.solver(id);
    }

    solveN(id: number): boolean {
      let params = [];
      for (let v of this.input) {
        if (!v.hasValue(id)) {
          return false;
        }
        params.push(v.getValue());
      }
      let result = this.func(...params);
      this.output.setValue(result, id);
      return true;
    }

    solve1(id: number): boolean {
      let v = this.input[0];
      if (!v.hasValue(id)) {
        return false;
      }
      let result = this.func(v.getValue());
      this.output.setValue(result, id);
      return true;
    }

    solve2(id: number): boolean {
      let [v1, v2] = this.input;
      if (!v1.hasValue(id) || !v2.hasValue(id)) {
        return false;
      }
      let result = this.func(v1.getValue(), v2.getValue());
      this.output.setValue(result, id);
      return true;
    }

    solve3(id: number): boolean {
      let [v1, v2, v3] = this.input;
      if (!v1.hasValue(id) || !v2.hasValue(id) || !v3.hasValue(id)) {
        return false;
      }
      let result = this.func(v1.getValue(), v2.getValue(), v3.getValue());
      this.output.setValue(result, id);
      return true;
    }

    toString(): string {
      let params = this.input.map(v => v.toString()).join(",");
      return `${this.output} = ${this.name}(${params})`;
    }

  }

  export class RelationshipGroup {

    private relationships = [] as Relationship[];

    constructor(private system: System) {}

    /**
     * left = right
     */
    equals(left: Value, right: Value): void {
      this.relationships.push(
          this.system.equals(left, right))
    }

    /**
     * sum = addend1 + addend2
     */
    add(sum: Value, addend1: Value, addend2: Value): void {
      this.relationships.push(
          this.system.add(sum, addend1, addend2));
    }

    /**
     * difference = minuend - subtrahend
     */
    subtract(difference: Value, minuend: Value, subtrahend: Value): void {
      this.relationships.push(
          this.system.subtract(difference, minuend, subtrahend));
    }

    /**
     * product = mult1 * mult2
     */
    multiply(product: Value, mult1: Value, mult2: Value): void {
      this.relationships.push(
          this.system.multiply(product, mult1, mult2));
    }

    /**
     * quotient = dividend / divisor
     */
    divide(quotient: Value, dividend: Value, divisor: Value): void {
      this.relationships.push(
          this.system.divide(quotient, dividend, divisor));
    }

    /**
     * value = func(a, b)
     */
    call(funcName: string, out: Value, params: Value[], ctx?: Context): void {
      this.relationships.push(
          this.system.call(funcName, out, params, ctx));
    }


  }

}
