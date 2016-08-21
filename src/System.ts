module Robin {

  declare var Proxy;
  type Proxy = any;

  type Value = string | number | Variable;

  interface FuncEntry {
    name:  string;
    func:  Function;
    arity: number;
  }

  export class System {

    // A debugging tool for interrogating the system.
    public $: Proxy;

    private relationships: Relationship[];
    private variables:     { [name: string]: Variable; };
    private funcs:         { [name: string]: FuncEntry; };
    private idsequence:    number;

    constructor() {
      this.reset();
      this.$ = this.proxy();
    }

    /**
     * Check if a function has been registered
     */
    hasFunc(name: string): boolean {
      return name in this.funcs;
    }

    /**
     * Register a function
     */
    func(name: string, func: CustomFunc, arity: number = func.length): void {
      if (this.hasFunc(name)) {
        throw new Error(`${name} function already registered`);
      }
      this.funcs[name] = { name, func, arity };
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
     * Assign a variable's value
     */
    assign(name: string, v: number): void {
      this.getVariable(name).assignValue(v);
    }

    /**
     * Set a variable's value
     */
    set(name: string, v: number|string): void {
      if (v === "") {
        throw new Error(`it's not a value value ${v}`);
      }
      this.clear(name);
      if (typeof v === "number") {
        this.getVariable(name).setValue(v, 0);
        return;
      }
      if (typeof v === "string") {
        this.equals(name, this.parse(v));
        return;
      }
      throw new Error(`it's not a value value ${v}`);
    }

    /**
     * Set a variables value to the evaluated node
     */
    setNode(name: string, node: any): void {
      this.equals(name, this.evaluate(node));
    }

    /**
     * Destroy a variable
     */
    destroy(name: string): void {
      if (this.has(name)) {
        this.destroyVariable(this.variables[name]);
      }
    }

    /**
     * Reset all intermediate variables
     */
    solve(digestID: number): void {
      for (let relationship of this.relationships) {
        relationship.solve(digestID);
      }
    }

    /**
     * Clear a variable's value. If a variable name is not passed, all are cleared.
     */
    clear(name?: string): void {
      if (name) {
        this.getVariable(name).clearValue();
      } else {
        Object.keys(this.variables).forEach(name => this.clear(name));
      }
    }

    /**
     * Reset the system
     */
    reset(): void {
      this.idsequence = 0;
      this.variables = Object.create(null);
      this.funcs = Object.create(null);
      this.relationships = [];
    }

    /**
     * left = right
     */
    equals(left: Value, right: Value): void {
      this.relationships.push(new Equality(
        this.variableFor(left),
        this.variableFor(right)
      ));
    }

    /**
     * sum = addend1 + addend2
     */
    add(sum: Value, addend1: Value, addend2: Value): void {
      this.relationships.push(new Addition(
        this.variableFor(addend1),
        this.variableFor(addend2),
        this.variableFor(sum)
      ));
    }

    /**
     * difference = minuend - subtrahend
     */
    subtract(difference: Value, minuend: Value, subtrahend: Value): void {
      this.relationships.push(new Subtraction(
        this.variableFor(minuend),
        this.variableFor(subtrahend),
        this.variableFor(difference)
      ));
    }

    /**
     * product = mult1 * mult2
     */
    multiply(product: Value, mult1: Value, mult2: Value): void {
      this.relationships.push(new Multiplication(
        this.variableFor(mult1),
        this.variableFor(mult2),
        this.variableFor(product)
      ));
    }

    /**
     * quotient = dividend / divisor
     */
    divide(quotient: Value, dividend: Value, divisor: Value): void {
      this.relationships.push(new Division(
        this.variableFor(dividend),
        this.variableFor(divisor),
        this.variableFor(quotient)
      ));
    }

    /**
     * max = max(a, b)
     */
    call(funcName: string, out: Value, params: Value[]): void {
      if (!this.hasFunc(funcName)) {
        throw new Error(`${funcName} is not a function`);
      }
      let entry = this.funcs[funcName];
      this.relationships.push(new CustomRelationship(
        entry.name,
        entry.func,
        entry.arity,
        params.map(p => this.variableFor(p)),
        this.variableFor(out)
      ));
    }

    /**
     * Dump all the relationships as strings
     */
    toString(filter: string = null): string {
      let expressions = this.relationships.map(r => r.toString());
      if (filter) {
        expressions = expressions.filter(expr => expr.indexOf(filter) !== -1);
      }
      return expressions.join("\n");
    }

    private destroyRelationship(r: Relationship): void {
      let index = this.relationships.indexOf(r);
      if (index === -1) {
        return;
      }
      this.relationships.splice(index, 1);
      for (let v of r.getVariables()) {
        v.detach(r);
        if (v.isOrphan() && !v.isAssigned()) {
          this.destroyVariable(v);
        }
      }
    }

    private parse(expr: string): Variable {
      let root = Parser.parse(expr, { startRule: "expression" });
      return this.evaluate(root);
    }

    private evaluate(node: Expression): Variable {
      switch (node.tag) {
        case "ident":
          return this.getVariable(node.value);
        case "number":
          return new Constant(node.value);
        case "op":
          return this.handleOperation(node);
        case "func_call":
          return this.handleFuncCall(node);
        default:
          throw new Error("invalid expression");
      }
    }

    private handleFuncCall(node: FuncCallNode): Variable {
      let result = this.createIntermediate();
      let params = node.params.map(p => this.evaluate(p));
      this.call(node.name, result, params);
      return result;
    }

    private handleOperation(node: OperationNode): Variable {
      let left = this.evaluate(node.left);
      let right = this.evaluate(node.right);
      let result = this.createIntermediate();
      switch (node.op) {
        case "+":
          this.add(result, left, right);
          break;
        case "-":
          this.subtract(result, left, right);
          break;
        case "*":
          this.multiply(result, left, right);
          break;
        case "/":
          this.divide(result, left, right);
          break;
        default:
          throw new Error(`Syntax Error: invalid operator ${node.op}`);
      }
      return result;
    }

    /**
     * Get or create a variable.
     */
    getVariable(name: string): Variable {
      if (!this.has(name)) {
        this.variables[name] = new Variable(name);
      }
      return this.variables[name];
    }

    /**
     * Destroy a variable and any relationships that depend on it.
     */
    destroyVariable(v: Variable): void {
      let name = v.getName();
      if (!this.has(name)) {
        return;
      }
      delete this.variables[name];
      for (let r of v.getRelationships()) {
        this.destroyRelationship(r);
      }
    }

    private createIntermediate(): Variable {
      let id = this.idsequence++;
      return this.getVariable(`$${id}`);
    }

    private variableFor(v: Value): Variable {
      if (typeof v === "string") {
        return this.getVariable(v);
      }
      else if (typeof v === "number") {
        return new Variable("Const", v);
      }
      else {
        return v;
      }
    }

    private proxy(): Proxy {

      if (!Proxy) {
        return null;
      }

      return new Proxy(this, {
        get(target: System, property: string, receiver: Proxy): number {
          if (target.has(property)) {
            return target.get(property);
          }
          return undefined;
        },
        set(target: System, property: string, value: any, receiver: Proxy): boolean {
          target.set(property, value);
          return true;
        },
        has(target: System, property: string): boolean {
          return target.has(property);
        },
        deleteProperty(target: System, property: string): boolean {
          target.destroy(property);
          return true;
        },
        ownKeys(target: System): string[] {
          return Object.keys(target.variables);
        }
      });
    }

  }

}
