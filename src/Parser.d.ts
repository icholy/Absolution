
declare module Absolution {

  interface ParseOptions {
    startRule?: string;
  }

  export interface SyntaxError {
    location: {
      start: {
        line:   number;
        column: number;
        offset: number;
      };
      end: {
        line:   number;
        column: number;
        offset: number;
      };
    },
    message: string;
    stack:   any;
  }

  export var Parser: {
    SyntaxError: any;
    parse<T>(input: string, options?: ParseOptions): T;
  };

  export type Expression = any;

  export interface StyleSheet {
    rulesets:  RuleSet[],
    variables: VariableNode[];
  }

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

  export interface VariableNode {
    tag:  "variable",
    name: string;
    expr: Expression;
    text: string;
  }

  export interface IdentNode {
    tag:     "ident"|"property";
    value:   string;
    object?: string;
    key?:    string;
  }

  export interface NumberNode {
    tag:   "number";
    value: number;
  }

  export interface Macro {
    tag:  "macro";
    name: string;
    text: string;
  }

  export interface Rule {
    tag?:   "rule";
    target: string;
    expr:   Expression;
    text:   string;
  }

  export interface RuleSet {
    selector: SelectorNode;
    rules:    Rule[];
    macros:   Macro[];
  }

}
