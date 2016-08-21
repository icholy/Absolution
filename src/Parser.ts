
module Robin {

  interface ParseOptions {
    startRule?: string;
  }

  export declare var GeneratedParser: {
    parse(input: string, options?: ParseOptions): any;
  };

}
