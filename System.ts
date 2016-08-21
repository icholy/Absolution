
import { Relationship, Equality, Addition, Subtraction, Multiplication, Division } from "Relationships";
import { Connector, Variable, Constant } from "Connectors";

declare var Proxy;
type Proxy = any;

type Value = string | number | Connector;

export default class System {

  public $: Proxy;

  private relationships: Relationship[];
  private variables:     { [name: string]: Variable; };
  private idsequence:    number;

  constructor() {
    this.reset();
    this.$ = this.proxy();
  }

  /**
   * Checks if a variable exists
   */
  has(name: string): boolean {
    return name in this.variables;
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
  set(name: string, v: number|string|any[]): void {
    this.clear(name);
    if (typeof v === "number") {
      this.getVariable(name).setValue(v);
      return;
    }
    if (typeof v === "string") {
      this.equals(name, v);
      return
    }
    if (Array.isArray(v)) {
      this.equals(name, this.evalute(v));
      return;
    }
  }

  /**
   * Clear a variable's value. If a variable name is not passed, all are cleared.
   */
  clear(name?: string): void {
    if (name) {
      this.getVariable(name).clearValue();
    } else {
      Object.keys(this.variables).forEach(name => this.clear(name))
    }
  }

  /**
   * Reset the whole system
   */
  reset(): void {
    this.idsequence = 0;
    this.variables = Object.create(null);
    this.relationships = [];
  }

  /**
   * left = right
   */
  equals(left: Value, right: Value): void {
    this.relationships.push(new Equality(
      this.connectorFor(left),
      this.connectorFor(right)
    ));
  }

  /**
   * sum = addend1 + addend2
   */
  add(sum: Value, addend1: Value, addend2: Value): void {
    this.relationships.push(new Addition(
      this.connectorFor(addend1),
      this.connectorFor(addend2),
      this.connectorFor(sum)
    ));
  }

  /**
   * difference = minuend - subtrahend
   */
  subtract(difference: Value, minuend: Value, subtrahend: Value): void {
    this.relationships.push(new Subtraction(
      this.connectorFor(minuend),
      this.connectorFor(subtrahend),
      this.connectorFor(difference)
    ));
  }

  /**
   * product = mult1 * mult2
   */
  multiply(product: Value, mult1: Value, mult2: Value): void {
    this.relationships.push(new Multiplication(
      this.connectorFor(mult1),
      this.connectorFor(mult2),
      this.connectorFor(product)
    ));
  }

  /**
   * quotient = dividend / divisor
   */
  divide(quotient: Value, dividend: Value, divisor: Value): void {
    this.relationships.push(new Division(
      this.connectorFor(dividend),
      this.connectorFor(divisor),
      this.connectorFor(quotient)
    ));
  }

  private evalute(ast: any): Connector {
    if (Array.isArray(ast)) {
      if (ast.length !== 3) {
        throw new Error(`Syntax Error: ${ast}`);
      }
      let operator = ast[0];
      let param1 = this.evalute(ast[1]);
      let param2 = this.evalute(ast[2]);
      let result = this.createIntermediate();
      switch (operator) {
        case "+":
          this.add(result, param1, param2);
          break;
        case "-":
          this.subtract(result, param1, param2);
          break;
        case "*":
          this.multiply(result, param1, param2);
          break;
        case "/":
          this.divide(result, param1, param2);
          break;
        default:
          throw new Error(`Syntax Error: invalid operator ${operator}`);
      }
      return result;
    } else {
      return this.connectorFor(ast);
    }
  }

  /**
   * Dump all the relationships as strings
   */
  toString(): string {
    return this.relationships.map(rel => rel.toString()).join("\n");
  }

  private getVariable(name: string): Variable {
    if (!this.has(name)) {
      this.variables[name] = new Variable(name);
    }
    return this.variables[name];
  }

  private createIntermediate(): Variable {
    let id = this.idsequence++;
    return this.getVariable(`$${id}`);
  }

  private connectorFor(v: Value): Connector {
    if (typeof v === "string") {
      return this.getVariable(v);
    } 
    else if (typeof v === "number") {
      return new Constant(v);
    }
    else {
      return v;
    }
  }

  private proxy(): Proxy {
    return new Proxy(this, {
      get(target: System, property: string, receiver: Proxy): number {
        if (target.has(property)) {
          return target.get(property);
        }
        return target[property];
      },
      set(target: System, property: string, value: any, receiver: Proxy): void {
        target.set(property, value);
      },
      ownKeys(target: System): string[] {
        return Object.keys(target.variables);
      }
    });
  }

}
