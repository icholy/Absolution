module Absolution {

  const attributeMap = {
    "a-id":          "id",
    "a-left":        "left",
    "a-right":       "right",
    "a-top":         "top",
    "a-bottom":      "bottom",
    "a-width":       "width",
    "a-height":      "height",
    "a-center-x":    "center-x",
    "a-center-y":    "center-y",
    "a-rect":        "rect",
    "a-relative-to": "relative-to",
    "a-center-in":   "center-in",
    "a-align-x":     "align-x",
    "a-align-y":     "align-y",
    "a-size":        "size",
    "a-fill":        "fill",
    "a-watch":       "watch",
    "a-style":       "style",
    "a-class":       "class"
  };

  export class Environment {

    private rulesById      = {} as { [id: string]: Rule[]; };
    private rulesByClass   = {} as { [className: string]: Rule[]; };
    private rulesByVirtual = {} as { [id: string]: Rule[]; };
    private userVariables  = [] as VariableNode[];

    constructor(stylesheet?: StyleSheet) {
      if (stylesheet) {
        this.parseRulesets(stylesheet.rulesets);
        this.userVariables.push(...stylesheet.variables);
      }
    }

    findStyleSheets(): void {
      let scriptTags = document.getElementsByTagName("script");
      for (let i = 0; i < scriptTags.length; i++) {
        let scriptTag = scriptTags.item(i);
        if (scriptTag.getAttribute("type") === "text/absolution") {
          this.parseStyleSheet(scriptTag.textContent);
        }
      }
    }

    findRectElements(root: HTMLElement, callback: (el: HTMLElement, options: RectOptions) => void): void {
      let iterator = document.createNodeIterator(root, NodeFilter.SHOW_ELEMENT);
      let el: HTMLElement;
      while (el = iterator.nextNode() as any) {
        let options = this.getRectOptions(el);
        if (options) {
          callback(el, options);
        }
      }
    }

    private parseRulesets(rulesets: RuleSet[]): void {
      for (let { selector, rules } of rulesets) {
        switch (selector.type) {
          case ".":
            if (this.hasRulesForClass(selector.name)) {
              this.rulesByClass[selector.name].push(...rules);
            } else {
              this.rulesByClass[selector.name] = rules;
            }
            break;
          case "#":
            if (this.hasRulesForId(selector.name)) {
              this.rulesById[selector.name].push(...rules);
            } else {
              this.rulesById[selector.name] = rules;
            }
            break;
          case "~":
            if (this.hasRulesForVirtual(selector.name)) {
              this.rulesByVirtual[selector.name].push(...rules);
            } else {
              this.rulesByVirtual[selector.name] = rules;
            }
            break;
          default:
            throw new Error(`${selector.type} is not a valid selector type`);
        }
      }
    }

    parseStyleSheet(input: string): void {
      let stylesheet = Parser.parse<StyleSheet>(input, { startRule: "stylesheet" });
      this.parseRulesets(stylesheet.rulesets);
      this.userVariables.push(...stylesheet.variables);
    }

    private getClassNames(el: HTMLElement): string[] {
      let classNames = el.className.split(" ");
      let classAttr = el.getAttribute("a-class");
      if (classAttr) {
        classNames.push(...classAttr.split(" "));
      }
      return classNames.map(name => name.trim());
    }

    /**
     * Get the rect options for an element, or null if it's not valid.
     * You can pass a second parameter which forces it.
     */
    getRectOptions(el: HTMLElement, isRect: boolean = false): RectOptions {

      let options: RectOptions = {
        id:        el.id ? el.id : el.getAttribute("a-id"),
        container: null,
        watcher:   null,
        rules:     []
      };

      if (options.id && this.hasRulesForId(options.id)) {
        for (let rule of this.rulesById[options.id]) {
          this.handleRule(options, rule);
        }
      }

      for (let name of this.getClassNames(el)) {
        if (this.hasRulesForClass(name)) {
          for (let rule of this.rulesByClass[name]) {
            this.handleRule(options, rule);
          }
        }
      }

      for (let i = 0; i < el.attributes.length; i++) {
        let attr = el.attributes.item(i);
        if (!attributeMap.hasOwnProperty(attr.name)) {
          continue;
        }
        isRect = true;
        this.handleRule(options, {
          target: attributeMap[attr.name],
          text:   attr.textContent,
          expr:   null
        });
      }

      if (!isRect && options.rules.length === 0) {
        return null;
      }

      // if there's no id, create a GUID
      if (!options.id) {
        options.id = Utils.guid();
      }

      return options;
    }

    private ruleFor(target: string, text: string, expr?: Expression): Rule {
      if (!expr) {
        expr = Parser.parse(text, { startRule: "expression" });
      }
      return { target, text, expr };
    }

    private identFrom({ target, text, expr }: Rule): string {
      if (!expr) {
        expr = this.ruleFor(target, text).expr;
      }
      if (expr.tag !== "ident") {
        throw new Error(`"${text}" is a ${expr.tag} not an identifier`);
      }
      return expr.value;
    }

    private handleRule(options: RectOptions, rule: Rule): void {
      try {
        let ident: string;
        switch (rule.target) {
          case "id":
          case "rect":
          case "watch":
          case "class":
            break;
          case "relative-to":
            options.container = this.identFrom(rule);
            break;
          case "center-in":
            ident = this.identFrom(rule);
            this.handleRule(options, this.ruleFor("center-x", `${ident}.center-x`));
            this.handleRule(options, this.ruleFor("center-y", `${ident}.center-y`));
            break;
          case "align-x":
            ident = this.identFrom(rule);
            this.handleRule(options, this.ruleFor("left", `${ident}.left`));
            this.handleRule(options, this.ruleFor("right", `${ident}.right`));
            break;
          case "align-y":
            ident = this.identFrom(rule);
            this.handleRule(options, this.ruleFor("top", `${ident}.top`));
            this.handleRule(options, this.ruleFor("bottom", `${ident}.bottom`));
            break;
          case "size":
            ident = this.identFrom(rule);
            this.handleRule(options, this.ruleFor("width", `${ident}.width`));
            this.handleRule(options, this.ruleFor("height", `${ident}.height`));
            break;
          case "fill":
            ident = this.identFrom(rule);
            this.handleRule(options, this.ruleFor("top", `${ident}.top`));
            this.handleRule(options, this.ruleFor("bottom", `${ident}.bottom`));
            this.handleRule(options, this.ruleFor("left", `${ident}.left`));
            this.handleRule(options, this.ruleFor("right", `${ident}.right`));
            break;
          case "style":
            let rules = Parser.parse<Rule[]>(rule.text, { startRule: "inline_rules" });
            for (let rule of rules) {
              this.handleRule(options, rule);
            }
            break;
          default:
            options.rules.push(
                this.ruleFor(rule.target, rule.text, rule.expr));
        }
      } catch (e) {
        let reason = e instanceof Error ? e.message : e.toString();
        throw new Error(
          `couldn't create rule ${rule.target}="${rule.text}" because ${reason}`);
      }
    }

    hasRulesForId(id: string): boolean {
      return this.rulesById.hasOwnProperty(id);
    }

    hasRulesForClass(id: string): boolean {
      return this.rulesByClass.hasOwnProperty(id);
    }

    hasRulesForVirtual(id: string): boolean {
      return this.rulesByVirtual.hasOwnProperty(id);
    }

    getUserVariables(): VariableNode[] {
      return this.userVariables;
    }

    getVirtuals(): RectOptions[] {
      return Object.keys(this.rulesByVirtual).map(id => {
        let options: RectOptions = {
          id:        id,
          container: null,
          watcher:   null,
          rules:     []
        };
        for (let rule of this.rulesByVirtual[id]) {
          this.handleRule(options, rule);
        }
        return options;
      });
    }

  }

}
