module Absolution {

  export interface EnvData {
    cache:      { [input: string]: any; };
    stylesheets: StyleSheet[];
  }

  export class Environment {

    private rulesById      = {} as { [id: string]: Rule[]; };
    private rulesByClass   = {} as { [className: string]: Rule[]; };
    private rulesByVirtual = {} as { [id: string]: Rule[]; };
    private userVariables  = [] as VariableNode[];
    private parserCache    = {} as { [input: string]: any; };
    private stylesheets    = [] as StyleSheet[];

    constructor(data?: EnvData) {
      if (data) {
        for (let stylesheet of data.stylesheets) {
          this.loadStyleSheet(stylesheet);
        }
        this.parserCache = data.cache;
      }
    }

    private parse<T>(input: string, options?: ParseOptions, useCache: boolean = false): T {
      if (!useCache) {
        return Parser.parse<T>(input, options);
      }
      let result = this.parserCache[input];
      if (!result) {
        if (!Absolution.Parser) {
          throw new Error("Absolution.Parser is not loaded!");
        }
        result = Parser.parse<T>(input, options);
        this.parserCache[input] = result;
      }
      return result;
    }

    /**
     * Export the environments data. This is used to pre-compile rules
     * for faster startup time and faster page load (no parser needed).
     */
    getExportData(): EnvData {
      return {
        cache:       this.parserCache,
        stylesheets: this.stylesheets
      };
    }

    /**
     * Get a list of selectors from the stylesheet.
     */
    getSelectors(): string[] {
      let selectors = [];
      for (let className of Object.keys(this.rulesByClass)) {
        selectors.push(`.${className}`);
      }
      for (let id of Object.keys(this.rulesById)) {
        selectors.push(`#${id}`);
      }
      return selectors;
    }

    /**
     * Parse and save rulesets.
     */
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

    /**
     * Load and save a stylesheet.
     */
    loadStyleSheet(stylesheet: StyleSheet): void {
      this.stylesheets.push(stylesheet);
      this.parseRulesets(stylesheet.rulesets);
      this.userVariables.push(...stylesheet.variables);
    }

    /**
     * Parse a stylesheet as a string and load it.
     */
    parseStyleSheet(input: string): void {
      try {
        let stylesheet = this.parse<StyleSheet>(input, { startRule: "stylesheet" });
        this.loadStyleSheet(stylesheet);
      } catch (e) {
        if (e instanceof Parser.SyntaxError) {
          throw new Error(Utils.formatParserError(e, input));
        } else {
          throw e;
        }
      }
    }

    /**
     * Get an array of class names from an Element.
     */
    private getClassNames(el: HTMLElement): string[] {
      let classNames = el.className.split(" ");
      return classNames.map(name => name.trim());
    }

    /**
     * Get the rect options for an element, or null if it's not valid.
     * You can pass a second parameter which forces it.
     */
    getRectOptions(el: HTMLElement, isRect: boolean = false): RectOptions {

      let options: RectOptions = {
        id:        el.id,
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

      if (el.hasAttribute("a-rect")) {
        isRect = true;
      }

      if (el.hasAttribute("a-style")) {
        let style = el.getAttribute("a-style");
        let rules = this.parse<Rule[]>(style, { startRule: "inline_rules" }, true);
        for (let rule of rules) {
          this.handleRule(options, rule);
        }
        isRect = true;
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

    /**
     * Create a rule from its components. Parse if need be.
     */
    private ruleFor(target: string, text: string, expr?: Expression): Rule {
      if (!expr) {
        expr = this.parse<Expression>(text, { startRule: "expression" });
      }
      return { target, text, expr };
    }

    /**
     * Get a string identifier from a Rule. This will throw an error 
     * if the underlying expression is not an IdentNode.
     */
    private identFrom({ target, text, expr }: Rule): string {
      if (!expr) {
        expr = this.ruleFor(target, text).expr;
      }
      if (expr.tag !== "ident") {
        throw new Error(`"${text}" is a ${expr.tag} not an identifier`);
      }
      return expr.value;
    }

    /**
     * Add the rule to the rect options.
     */
    private handleRule(options: RectOptions, rule: Rule): void {
      try {
        let ident: string;
        switch (rule.target) {
          case "watch":
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

    /**
     * Check if there are any rules for the specified rect id.
     */
    hasRulesForId(id: string): boolean {
      return id in this.rulesById;
    }

    /**
     * Check if there are any rules for the specified rect class.
     */
    hasRulesForClass(className: string): boolean {
      return className in this.rulesByClass;
    }

    /**
     * Check if there are any rules for the specified virtual rect id.
     */
    hasRulesForVirtual(id: string): boolean {
      return id in this.rulesByVirtual;
    }

    /**
     * Get an array of variables declared in the stylesheet.
     */
    getUserVariables(): VariableNode[] {
      return this.userVariables;
    }

    /**
     * Get an array of rect options for all the virtual rects
     * in the stylesheet.
     */
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
