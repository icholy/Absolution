
declare module Robin {

  interface ParseOptions {
    startRule?: string;
  }

  export var GeneratedParser: {
    parse(input: string, options?: ParseOptions): any;
  };

}
