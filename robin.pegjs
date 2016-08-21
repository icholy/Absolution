
start
  = ruleset*

ruleset
  = _ selector:selector _ "{" _ rules:rule* _ "}" _ {
      return {
        tag:   "ruleset",
        rules: rules
      };
    }

selector
  = ("#" / ".") ident

rule
  = _ target:ident _ ":" _ expr:expression _ ";" _ {
      return {
        tag:    "rule",
        target: target,
        expr:   expr
      };
    }

expression
  = _ expr:add_or_subtract _ {
      return expr;
    }

add_or_subtract 
  = left:multiply_or_divide _ op:("+" / "-") _ right:add_or_subtract {
    return {
      tag:   "op",
      op:    op,
      left:  left,
      right: right
    };
  }
  / multiply_or_divide

multiply_or_divide
  = left:primary _ op:("*" / "/") _ right:multiply_or_divide {
      return {
        tag:   "op",
        op:    op,
        left:  left,
        right: right
      };
    }
  / primary

primary
  = numeric
    / "(" expr:expression ")" {
        return expr;
      }
    / name:ident "(" params:expression* ")" {
      return {
        tag:    "func_call",
        name:   name.value,
        params: params
      };
    }
    / ident

numeric
  = sign:("-" / "+")? value:[0-9]+ decimal:("." [0-9]*)? unit:("px" / "em")? {
      if (unit === "em") {
        throw new Error("'em' unit is not currently supported");
      }
      var str = "";
      if (sign) {
        str += "-";
      }
      str += value;
      if (decimal) {
        str += "." + decimal[1].join("");
      }
      return {
        tag: "number",
        value: parseFloat(str, 10)
      };
    }

ident
  = [a-zA-Z$_-] [a-zA-Z0-9.$_-]* {
      return {
        tag:   "ident",
        value: text()
      };
    }

_ "whitespace"
    = [ \t\n\r]*

