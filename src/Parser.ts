
module Robin {

  interface ParseOptions {
    startRule?: string;
  }

  export declare var GeneratedParser: {
    parse(input: string, options?: ParseOptions): any;
  };

  export module Parser {

    export function expression(input: string): any {
      return GeneratedParser.parse(input, { startRule: "expression" });
    }

    export function rulesets(input: string): any {
      return GeneratedParser.parse(input, { startRule: "rulesets" });
    }

    export interface NumberNode {
      tag:   "number";
      value: number;
    }

    export function isNumber(node: any): node is NumberNode {
      return node.tag === "number";
    }

    export interface IdentNode {
      tag:   "ident";
      value: string;
    }

    export function isIdent(node: any): node is IdentNode {
      return node.tag === "ident";
    }

    export interface BinaryOpNode {
      tag:   "op";
      op:    string;
      left:  any;
      right: any;
    }

    export function isBinaryOp(node: any): node is BinaryOpNode {
      return node.tag === "op";
    }

    export interface RuleNode {
      tag:    "rule";
      target: string;
      expr:   any;
    }

    export function isRule(node: any): node is RuleNode {
      return node.tag === "rule";
    }

    export interface FuncCallNode {
      tag:    "func_call";
      name:   string;
      params: any[];
    }

    export function isFuncCall(node: any): node is FuncCallNode {
      return node.tag === "func_call";
    }

  }

}
