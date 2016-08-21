
declare module Robin {

  interface ParseOptions {
    startRule?: string;
  }

  export var Parser: {
    parse(input: string, options?: ParseOptions): any;
  };

  export type Expression = any;

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
