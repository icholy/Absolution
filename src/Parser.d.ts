
declare module Robin {

  interface ParseOptions {
    startRule?: string;
  }

  export var Parser: {
    parse(input: string, options?: ParseOptions): any;
  };

}
