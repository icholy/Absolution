module Robin {

  export abstract class Relationship {

    private variables: Variable[];

    /**
     * Try to solve the constraint.
     */
    abstract solve(digestID: number): void;

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

    solve(digestID: number): void {
      switch (true) {
        case this.left.hasValue(digestID):
          this.right.setValue(this.left.getValue(), digestID);
          break;
        case this.right.hasValue(digestID):
          this.left.setValue(this.right.getValue(), digestID);
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

    solve(digestID: number): void {
      switch (true) {
        case this.addend1.hasValue(digestID) && this.addend2.hasValue(digestID):
          this.sum.setValue(
              this.addend1.getValue() + this.addend2.getValue(), digestID);
          break;
        case (this.addend1.hasValue(digestID) && this.sum.hasValue(digestID)):
          this.addend2.setValue(
              this.sum.getValue() - this.addend1.getValue(), digestID);
          break;
        case (this.addend2.hasValue(digestID) && this.sum.hasValue(digestID)):
          this.addend1.setValue(
              this.sum.getValue() - this.addend2.getValue(), digestID);
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

    solve(digestID: number) {
      switch (true) {
        case (this.mult1.hasValue(digestID) && this.mult2.hasValue(digestID)):
          this.product.setValue(
              this.mult1.getValue() * this.mult2.getValue(), digestID);
          break;
        case (this.product.hasValue(digestID) && this.mult1.hasValue(digestID)):
          this.mult2.setValue(
              this.product.getValue() / this.mult1.getValue(), digestID);
          break;
        case (this.product.hasValue(digestID) && this.mult2.hasValue(digestID)):
          this.mult1.setValue(
              this.product.getValue() / this.mult2.getValue(), digestID);
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

    solve(digestID: number) {
      switch (true) {
        case (this.minuend.hasValue(digestID) && this.subtrahend.hasValue(digestID)):
          this.difference.setValue(
              this.minuend.getValue() - this.subtrahend.getValue(), digestID);
          break;
        case (this.minuend.hasValue(digestID) && this.difference.hasValue(digestID)):
          this.subtrahend.setValue(
              this.minuend.getValue() - this.difference.getValue(), digestID);
          break;
        case (this.subtrahend.hasValue(digestID) && this.difference.hasValue(digestID)):
          this.minuend.setValue(
              this.subtrahend.getValue() + this.difference.getValue(), digestID);
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

    solve(digestID: number): void {
      switch (true) {
        case (this.dividend.hasValue(digestID) && this.divisor.hasValue(digestID)):
          this.quotient.setValue(
              this.dividend.getValue() / this.divisor.getValue(), digestID);
          break;
        case (this.dividend.hasValue(digestID) && this.quotient.hasValue(digestID)):
          this.divisor.setValue(
              this.dividend.getValue() / this.quotient.getValue(), digestID);
          break;
        case (this.divisor.hasValue(digestID) && this.quotient.hasValue(digestID)):
          this.dividend.setValue(
              this.divisor.getValue() * this.quotient.getValue(), digestID);
      }
    }

    toString(): string {
      return `${this.quotient} = ${this.dividend} / ${this.divisor}`;
    }

  }

}
