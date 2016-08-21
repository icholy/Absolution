
declare module Robin {

  interface ParseOptions {
    startRule?: string;
  }

  export var Parser: {
    parse(input: string, options?: ParseOptions): any;
  };

  export type Expression = any;

  export interface Rule {
    tag:    "rule";
    target: string;
    expr:   Expression;
  }

  export interface RuleSet {
    tag:   "ruleset";
    id:    string;
    rules: Rule[];
  }

}
