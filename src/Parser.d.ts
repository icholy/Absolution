
declare module Robin {

  interface ParseOptions {
    startRule?: string;
  }

  export var Parser: {
    parse<T>(input: string, options?: ParseOptions): T;
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

  export interface SelectorNode {
    type: string;
    name: string;
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
    selector: SelectorNode;
    rules:    Rule[];
  }

}
