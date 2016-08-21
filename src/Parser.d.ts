
declare module Robin {

  interface ParseOptions {
    startRule?: string;
  }

  export var Parser: {
    parse(input: string, options?: ParseOptions): any;
  };

  export type Expression = any;

  export interface OperationNode {
    tag:   string;
    op:    string;
    left:  Expression;
    right: Expression;
  }

  export interface FuncCallNode {
    tag:    string;
    name:   string;
    params: Expression[];
  }

  export interface IdentNode {
    tag:   string;
    value: string;
  }

  export interface NumberIdent {
    tag:   string;
    value: number;
  }

  export interface Rule {
    target: string;
    expr:   Expression;
    text:   string;
  }

  export interface RuleSet {
    id:    string;
    rules: Rule[];
  }

}
