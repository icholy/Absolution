import { Connector } from "Connectors";

export abstract class Relationship {

  abstract connectorValueChanged(): void;

  protected listenTo(...connectors: Connector[]): void {
    for (let c of connectors) {
      c.onChange(() => this.connectorValueChanged());
    }
    this.connectorValueChanged();
  }

  protected haveValues(...connectors: Connector[]): boolean {
    return connectors.every(c => c.hasValue());
  }

}

export class Equality extends Relationship {

  constructor(
    private left: Connector,
    private right: Connector
  ) {
    super();
    this.listenTo(left, right);
  }

  connectorValueChanged(): void {
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
    private addend1: Connector,
    private addend2: Connector,
    private sum:     Connector
  ) {
    super();
    this.listenTo(addend1, addend2, sum);
  }

  connectorValueChanged(): void {
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
    private mult1:   Connector,
    private mult2:   Connector,
    private product: Connector
  ) {
    super();
    this.listenTo(mult1, mult2, product);
  }

  connectorValueChanged() {
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
    private minuend:    Connector,
    private subtrahend: Connector,
    private difference: Connector
  ) {
    super();
    this.listenTo(minuend, subtrahend, difference);
  }

  connectorValueChanged() {
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
    private dividend: Connector,
    private divisor:  Connector,
    private quotient: Connector
  ) {
    super();
    this.listenTo(dividend, divisor, quotient);
  }

  connectorValueChanged(): void {
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
