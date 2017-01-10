
module uzi {

  /**
   * A context implementation can intercept and rewrite
   * variable and function access.
   */
  export class Context {

    hasVariable(name: string): boolean {
      return false;
    }

    getVariable(name: string): Variable {
      throw new Error(`context does not have ${name} variable`);
    }

    hasFunction(name: string): boolean {
      return false;
    }

    getFunction(name: string): FuncEntry {
      throw new Error(`context does not have ${name} function`);
    }

    identToName(node: IdentNode): string {
      return node.value;
    }
  }

  export class RectContext extends Context {

    private id:        string;
    private container: string;

    constructor(options: RectOptions) {
      super();
      this.id        = options.id;
      this.container = options.container;
    }

    private lookupIdent(node: IdentNode): string {
      if (node.value === "parent" && this.container) {
        return this.container;
      }
      if (node.value === "this") {
        return this.id;
      }
      return node.value;
    }

    private lookupProperty(node: IdentNode): string {
      if (node.object === "parent" && this.container) {
        return `${this.container}.${node.key}`;
      }
      if (node.object === "this") {
        return `${this.id}.${node.key}`;
      }
      return node.value;
    }

    identToName(node: IdentNode): string {
      if (node.tag === "ident") {
        return this.lookupIdent(node);
      } else {
        return this.lookupProperty(node);
      }
    }

  }
}
