enum Type {
  LEFT_PAREN,
  RIGHT_PAREN,
  NUMBER,
  OPERATOR,
  VARIABLE
}

interface Lexeme {
  value: any;
  type:  Type;
}

class Parser {

  precedence = {
    "+": 1,
    "-": 1,
    "*": 2,
    "/": 2
  }

  tokenize(input: string): Lexeme[] {

    let lexems = [];
    var token = "";

    function isWhiteSpace(c: string): boolean {
      return " \t\n\r\v".indexOf(c) !== -1;
    }

    function isNumeric(c: string): boolean {
      return !isNaN(parseFloat(c)) && isFinite(c as any);
    }

    function isOperator(c: string): boolean {
      return "+-/*".indexOf(c) !== -1;
    }

    function maybeAddToken(): void {
      if (token === "") {
        return;
      }
      if (isNumeric(token)) {
        lexems.push({
          type:  Type.NUMBER,
          value: parseFloat(token)
        });
      } else {
        lexems.push({
          type:  Type.VARIABLE,
          value: token
        });
      }
      token = "";
    }

    for (let c of input) {
      if (isWhiteSpace(c)) {
        maybeAddToken();
      } else if (c === "(") {
        lexems.push({
          type:  Type.LEFT_PAREN,
          value: c
        });
      else if (c === ")") {
        lexems.push({
          type:  Type.RIGHT_PAREN,
          value: c
        });
      else if (isOperator(c)) {
        lexems.push({
          type:  Type.OPERATOR,
          value: c
        });
      } else {
        token += c;
      }
    }

    maybeAddToken();

    return lexems;
  }

  private parse(tokens: Lexeme[]): Lexeme[] {

    let operators = [] as Lexeme[];
    let output    = [] as Lexeme[];

    function peek(): Lexeme {
      return operators[operators.length - 1];
    }

    let precedence(token: Lexeme): number {
      return this.precedence[token.value];
    };

    for (let token of tokens) {
      switch (token.type) {
        case Type.NUMBER:
          output.push(token);
          break;
        case Type.OPERATOR:
          while (operators.length > 0 && precedence(peek()) >= precedence(token)) {
            output.push(operators.pop());
          }
          operators.push(token);
        case Type.LEFT_PAREN:
          operators.push(token);
          break;
        case Type.RIGHT_PAREN:
          var op = operators.pop();
          while (op.type !== Type.LEFT_PAREN) {
            output.push(op);
            op = operators.pop();
          }
      }
    }

    while (operator.length > 0) {
      output.push(operators.pop());
    }

    return output;
  }

  private evalute(ast: any): Connector {
    if (Array.isArray(ast)) {
      if (ast.length !== 3) {
        throw new Error(`Syntax Error: ${ast}`);
      }
      let operator = ast[1];
      let left = this.evalute(ast[0]);
      let right = this.evalute(ast[2]);
      let result = this.createIntermediate();
      switch (operator) {
        case "+":
          this.add(result, left, right);
          break;
        case "-":
          this.subtract(result, left, right);
          break;
        case "*":
          this.multiply(result, left, right);
          break;
        case "/":
          this.divide(result, left, right);
          break;
        default:
          throw new Error(`Syntax Error: invalid operator ${operator}`);
      }
      return result;
    } else {
      return this.connectorFor(ast);
    }
  }
}
