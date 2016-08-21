
module Constraints {

  export enum Type {
    LEFT_PAREN,
    RIGHT_PAREN,
    NUMBER,
    OPERATOR,
    VARIABLE
  }

  export interface Lexeme {
    value: any;
    type:  Type;
  }

  export class Parser {

    precedence = {
      "+": 1,
      "-": 1,
      "*": 2,
      "/": 2
    };

    tokenize(input: string): Lexeme[] {

      let lexems = [];
      let token = "";
      let leadingSlash = false;

      function isWhiteSpace(c: string): boolean {
        return " \t\n\r\v".indexOf(c) !== -1;
      }

      function isNumeric(c: string): boolean {
        return !isNaN(parseFloat(c)) && isFinite(c as any);
      }

      function isOperator(c: string): boolean {
        // allow dashes in names
        if (token.length > 0 && c === "-") {
          return false;
        }
        return "+-/*".indexOf(c) !== -1;
      }

      function maybeAddToken(): void {
        if (token === "") {
          leadingSlash = false;
          return;
        }
        if (isNumeric(token)) {
          let sign = 1;
          if (leadingSlash) {
            lexems.pop();
            sign = -1;
          }
          lexems.push({
            type:  Type.NUMBER,
            value: sign * parseFloat(token)
          });
        } else {
          lexems.push({
            type:  Type.VARIABLE,
            value: token
          });
        }
        token = "";
        leadingSlash = false;
      }

      for (let c of input) {
        switch (true) {
          case isWhiteSpace(c):
            maybeAddToken();
            break;
          case (c === "("):
            maybeAddToken();
            lexems.push({
              type:  Type.LEFT_PAREN,
              value: c
            });
            break;
          case (c === ")"):
            maybeAddToken();
            lexems.push({
              type:  Type.RIGHT_PAREN,
              value: c
            });
            break;
          case isOperator(c):
            maybeAddToken();
            lexems.push({
              type:  Type.OPERATOR,
              value: c
            });
            leadingSlash = c === "-"
            break;
          default:
            token += c;
        }
      }

      maybeAddToken();

      return lexems;
    }

    infixToRPN(tokens: Lexeme[]): Lexeme[] {

      let operators = [] as Lexeme[];
      let output    = [] as Lexeme[];

      function peek(): Lexeme {
        return operators[operators.length - 1];
      }

      let precedence = (token: Lexeme) => {
        return this.precedence[token.value];
      };

      for (let token of tokens) {

        switch (token.type) {
          case Type.NUMBER:
            output.push(token);
            break;
          case Type.VARIABLE:
            output.push(token);
            break;
          case Type.OPERATOR:
            while (operators.length > 0 && precedence(peek()) >= precedence(token)) {
              output.push(operators.pop());
            }
            operators.push(token);
            break;
          case Type.LEFT_PAREN:
            operators.push(token);
            break;
          case Type.RIGHT_PAREN:
            let op = operators.pop();
            while (op.type !== Type.LEFT_PAREN) {
              output.push(op);
              op = operators.pop();
            }
            break;
        }
      }

      while (operators.length > 0) {
        output.push(operators.pop());
      }

      return output;
    }

  }

}
