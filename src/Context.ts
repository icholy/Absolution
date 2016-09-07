
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


}
