
declare module Absolution {

  interface ParseOptions {
    startRule?: string;
  }

  export var Parser: {
    parse<T>(input: string, options?: ParseOptions): T;
  };

  export type Expression = any;

  export interface OperationNode {
    tag:   "op";
    op:    string;
    left:  Expression;
    right: Expression;
  }

  export interface FuncCallNode {
    tag:    "func_call";
    name:   string;
    params: Expression[];
  }

  export interface SelectorNode {
    type: "selector";
    name: string;
  }

  export interface IdentNode {
    tag:     "ident"|"property";
    value:   string;
    object?: string;
    key?:    string;
  }

  export interface NumberIdent {
    tag:   "number";
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
