
stylesheet
  = _ items:(ruleset / variable)* {
      return {
        rulesets:  items.filter(function (item) { return item.tag === "ruleset"; }),
        variables: items.filter(function (item) { return item.tag === "variable"; })
      };
    }

ruleset
  = _ selector:selector _ "{" _ items:(rule_with_trailing_semi / macro)* _ "}" _ {
      return {
        tag:      "ruleset",
        selector: selector,
        rules:    items.filter(function (item) { return item.tag === "rule"; }),
        macros:   items.filter(function (item) { return item.tag === "macro"; })
      };
    }

selector
  = type:("#" / "." / "~") id:ident {
      return {
        type: type,
        name: id.value
      };
    }

inline_rules
  = _ first:rule _ rest:rule_with_leading_semi* _ ";"? _ {
      return [first].concat(rest);
    }

rule_with_leading_semi
  = _ ";" _ rule:rule _ {
      return rule;
    }

rule_with_trailing_semi
  = _ rule:rule _ ";"+ _ {
      return rule;
    }

rule
  = _ target:ident _ ":" _ expr:expression_with_text _ {
      return {
        tag:    "rule",
        target: target.value,
        expr:   expr,
        text:   expr.text
      };
    }

expression_with_text 
  = expr:expression {
      expr.text = text();
      return expr;
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
    / func_call
    / property
    / ident

func_call
  = name:ident "(" params:func_params ")" {
      return {
        tag:    "func_call",
        name:   name.value,
        params: params
      };
    }

func_params
  = first:expression? rest:func_params_rest* {
      var params = [];
      if (first) {
        params.push(first);
      }
      return params.concat(rest);
    }

func_params_rest
  = "," _ expr:expression {
      return expr;
    }

numeric
  = sign:("-" / "+")? value:[0-9]+ decimal:("." [0-9]*)? unit:("px" / "em")? {
      if (unit === "em") {
        throw new Error("'em' unit is not currently supported");
      }
      var str = "";
      if (sign) {
        str += "-";
      }
      str += value.join("");
      if (decimal) {
        str += "." + decimal[1].join("");
      }
      return {
        tag: "number",
        value: parseFloat(str, 10)
      };
    }

property
  = obj:ident "." key:ident {
    return {
      tag:    "property",
      object: obj.value,
      key:    key.value,
      value:  text()
    };
  }

variable
  = _ "$" name:ident _ ":" _ expr:expression_with_text _ ";" _ {
    return {
      tag:  "variable",
      name: name.value,
      expr: expr,
      text: expr.text
    }
  }

vfl_expression
  = _ "|" items:(vfl_rect / vfl_space)* "|" {
      return items;
    }

vfl_rect
  = "[" id:ident "]" {
      return {
        tag:  "rect",
        name: id.value
      };
    }

vfl_space
  = "-(" expr:expression ")-" {
      return {
        tag:  "space",
        expr: expr
      };
    }
  / "-" {
      return {
        tag: "space"
      };
    }


macro
  = "@" name:ident _ ":" _ content:[^;]* _ ";" {
      return {
        tag:  "macro",
        name: name.value,
        text: content.join("")
      }
    }

ident
  = [a-zA-Z$_-] [a-zA-Z0-9$_-]* {
      return {
        tag:   "ident",
        value: text()
      };
    }

_ "whitespace"
    = [ \t\n\r]*

