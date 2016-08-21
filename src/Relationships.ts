module Robin {

  export abstract class Relationship {

    private variables: Variable[];

    /**
     * Try to solve the constraint.
     *
     * @param id the digest id
     */
    abstract solve(id: number): void;

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

    solve(id: number): void {
      switch (true) {
        case this.left.hasValue(id):
          this.right.setValue(this.left.getValue(), id);
          break;
        case this.right.hasValue(id):
          this.left.setValue(this.right.getValue(), id);
          break;
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

    solve(id: number): void {
      switch (true) {
        case this.addend1.hasValue(id) && this.addend2.hasValue(id):
          this.sum.setValue(
              this.addend1.getValue() + this.addend2.getValue(), id);
          break;
        case (this.addend1.hasValue(id) && this.sum.hasValue(id)):
          this.addend2.setValue(
              this.sum.getValue() - this.addend1.getValue(), id);
          break;
        case (this.addend2.hasValue(id) && this.sum.hasValue(id)):
          this.addend1.setValue(
              this.sum.getValue() - this.addend2.getValue(), id);
          break;
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

    solve(id: number) {
      switch (true) {
        case (this.mult1.hasValue(id) && this.mult2.hasValue(id)):
          this.product.setValue(
              this.mult1.getValue() * this.mult2.getValue(), id);
          break;
        case (this.product.hasValue(id) && this.mult1.hasValue(id)):
          this.mult2.setValue(
              this.product.getValue() / this.mult1.getValue(), id);
          break;
        case (this.product.hasValue(id) && this.mult2.hasValue(id)):
          this.mult1.setValue(
              this.product.getValue() / this.mult2.getValue(), id);
          break;
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

    solve(id: number) {
      switch (true) {
        case (this.minuend.hasValue(id) && this.subtrahend.hasValue(id)):
          this.difference.setValue(
              this.minuend.getValue() - this.subtrahend.getValue(), id);
          break;
        case (this.minuend.hasValue(id) && this.difference.hasValue(id)):
          this.subtrahend.setValue(
              this.minuend.getValue() - this.difference.getValue(), id);
          break;
        case (this.subtrahend.hasValue(id) && this.difference.hasValue(id)):
          this.minuend.setValue(
              this.subtrahend.getValue() + this.difference.getValue(), id);
          break;
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

    solve(id: number): void {
      switch (true) {
        case (this.dividend.hasValue(id) && this.divisor.hasValue(id)):
          this.quotient.setValue(
              this.dividend.getValue() / this.divisor.getValue(), id);
          break;
        case (this.dividend.hasValue(id) && this.quotient.hasValue(id)):
          this.divisor.setValue(
              this.dividend.getValue() / this.quotient.getValue(), id);
          break;
        case (this.divisor.hasValue(id) && this.quotient.hasValue(id)):
          this.dividend.setValue(
              this.divisor.getValue() * this.quotient.getValue(), id);
      }
    }

    toString(): string {
      return `${this.quotient} = ${this.dividend} / ${this.divisor}`;
    }

  }

  export type CustomFunc = Function;

  export class CustomRelationship extends Relationship {

    private solver: (id: number) => void;

    constructor(
      private name:  string,
      private func:  CustomFunc,

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

    solve(id: number): void {
      this.solver(id);
    }

    solveN(id: number): void {
      let params = [];
      for (let v of this.input) {
        if (!v.hasValue(id)) {
          return;
        }
        params.push(v.getValue());
      }
      let result = this.func(...params);
      this.output.setValue(result, id);
    }

    solve1(id: number): void {
      let v = this.input[0];
      if (!v.hasValue(id)) {
        return;
      }
      let result = this.func(v.getValue());
      this.output.setValue(result, id);
    }

    solve2(id: number): void {
      let [v1, v2] = this.input;
      if (!v1.hasValue(id) || !v2.hasValue(id)) {
        return;
      }
      let result = this.func(v1.getValue(), v2.getValue());
      this.output.setValue(result, id);
    }

    solve3(id: number): void {
      let [v1, v2, v3] = this.input;
      if (!v1.hasValue(id) || !v2.hasValue(id) || !v3.hasValue(id)) {
        return;
      }
      let result = this.func(v1.getValue(), v2.getValue(), v3.getValue());
      this.output.setValue(result, id);
    }

    toString(): string {
      let params = this.input.map(v => v.toString()).join(",");
      return `${this.output} = ${this.name}(${params})`;
    }

  }

}
