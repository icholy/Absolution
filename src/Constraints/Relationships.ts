module Constraints {

  export abstract class Relationship {

    private variables: Variable[];

    /**
     * Try to solve the constraint.
     */
    abstract solve(): void;

    /**
     * Attach this relationship to the supplied variables
     */
    protected attachTo(...variables: Variable[]): void {
      this.variables = [];
      for (let v of variables) {
        v.attach(this);
        this.variables.push(v);
      }
      this.solve();
    }

    /**
     * Get all the used variables.
     */
    getVariables(): Variable[] {
      return this.variables;
    }

    /**
     * Return true if all supplied variables have a value.
     */
    protected haveValues(...variables: Variable[]): boolean {
      return variables.every(v => v.hasValue());
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

    solve(): void {
      switch (true) {
        case this.left.hasValue():
          this.right.setValue(this.left.getValue());
          break;
        case this.right.hasValue():
          this.left.setValue(this.right.getValue());
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

    solve(): void {
      switch (true) {
        case this.haveValues(this.addend1, this.addend2):
          this.sum.setValue(
              this.addend1.getValue() + this.addend2.getValue());
          break;
        case this.haveValues(this.addend1, this.sum):
          this.addend2.setValue(
              this.sum.getValue() - this.addend1.getValue());
          break;
        case this.haveValues(this.addend2, this.sum):
          this.addend1.setValue(
              this.sum.getValue() - this.addend2.getValue());
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

    solve() {
      switch (true) {
        case this.haveValues(this.mult1, this.mult2):
          this.product.setValue(
              this.mult1.getValue() * this.mult2.getValue());
          break;
        case this.haveValues(this.product, this.mult1):
          this.mult2.setValue(
              this.product.getValue() / this.mult1.getValue());
          break;
        case this.haveValues(this.product, this.mult2):
          this.mult1.setValue(
              this.product.getValue() / this.mult2.getValue());
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

    solve() {
      switch (true) {
        case this.haveValues(this.minuend, this.subtrahend):
          this.difference.setValue(
              this.minuend.getValue() - this.subtrahend.getValue());
          break;
        case this.haveValues(this.minuend, this.difference):
          this.subtrahend.setValue(
              this.minuend.getValue() - this.difference.getValue());
          break;
        case this.haveValues(this.subtrahend, this.difference):
          this.minuend.setValue(
              this.subtrahend.getValue() + this.difference.getValue());
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

    solve(): void {
      switch (true) {
        case this.haveValues(this.dividend, this.divisor):
          this.quotient.setValue(
              this.dividend.getValue() / this.divisor.getValue());
          break;
        case this.haveValues(this.dividend, this.quotient):
          this.divisor.setValue(
              this.dividend.getValue() / this.quotient.getValue());
          break;
        case this.haveValues(this.divisor, this.quotient):
          this.dividend.setValue(
              this.divisor.getValue() * this.quotient.getValue());
      }
    }

    toString(): string {
      return `${this.quotient} = ${this.dividend} / ${this.divisor}`;
    }

  }

}
