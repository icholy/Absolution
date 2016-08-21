
module Constraints {

  export class Notifier {

    private listeners: Function[] = [];

    notify(): void {
      for (let listener of this.listeners) {
        listener();
      }
    }

    onNotify(listener: Function): void {
      this.listeners.push(listener);
    }
  }

  export abstract class Connector extends Notifier {
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
          throw new Error(`Contradiction: ${this.toString()} is already set`);
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
          `Contradiction: attempting to set ${this.toString()} to ${v}`);
      }
    }

    clearValue(): void {
      // do nothing
    }

    toString(): string {
      return `Const(${this.value})`;
    }
    
  }

  export abstract class Operation {

    abstract connectorValueChanged(): void;

    protected listenTo(...connectors: Connector[]): void {
      for (let c of connectors) {
        c.onNotify(() => this.connectorValueChanged());
      }
      this.connectorValueChanged();
    }

    protected haveValues(...connectors: Connector[]): boolean {
      return connectors.every(c => c.hasValue());
    }

  }

  export class Equaler extends Operation {

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

  export class Adder extends Operation {

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

  export class Multiplier extends Operation {

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

  export class Subtractor extends Operation {

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

  export class Divider extends Operation {

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

  type Value = string | number;

  export class System {

    private operations: Operation[] = [];
    private variables:  { [name: string]: Variable; } = {};

    private getVariable(name: string): Variable {
      let variable = this.variables[name];
      if (!variable) {
        variable = new Variable(name);
        this.variables[name] = variable;
      }
      return variable;
    }

    private connectorFor(v: Value): Connector {
      if (typeof v === "string") {
        return this.getVariable(v);
      } else {
        return new Constant(v);
      }
    }

    /**
     * Get a variable's value
     */
    get(name: string): number {
      return this.getVariable(name).getValue();
    }

    /**
     * Set a variable's value
     */
    set(name: string, v: number): void {
      this.clear(name);
      this.getVariable(name).setValue(v);
    }

    /**
     * Clear a variable's value
     */
    clear(name: string): void {
      this.getVariable(name).clearValue();
    }

    /**
     * Clear all variables
     */
    reset(): void {
      Object.keys(this.variables).forEach(name => this.clear(name))
    }

    /**
     * left = right
     */
    equals(left: Value, right: Value): void {
      this.operations.push(new Equaler(
        this.connectorFor(left),
        this.connectorFor(right)
      ));
    }

    /**
     * sum = addend1 + addend2
     */
    add(sum: Value, addend1: Value, addend2: Value): void {
      this.operations.push(new Adder(
        this.connectorFor(addend1),
        this.connectorFor(addend2),
        this.connectorFor(sum)
      ));
    }

    /**
     * difference = minuend - subtrahend
     */
    subtract(difference: Value, minuend: Value, subtrahend: Value): void {
      this.operations.push(new Subtractor(
        this.connectorFor(minuend),
        this.connectorFor(subtrahend),
        this.connectorFor(difference)
      ));
    }

    /**
     * product = mult1 * mult2
     */
    multiply(product: Value, mult1: Value, mult2: Value): void {
      this.operations.push(new Multiplier(
        this.connectorFor(mult1),
        this.connectorFor(mult2),
        this.connectorFor(product)
      ));
    }

    /**
     * quotient = dividend / divisor
     */
    divide(quotient: Value, dividend: Value, divisor: Value): void {
      this.operations.push(new Divider(
        this.connectorFor(dividend),
        this.connectorFor(divisor),
        this.connectorFor(quotient)
      ));
    }

    toString(): string {
      return this.operations.map(op => op.toString()).join("\n");
    }

  }
}
