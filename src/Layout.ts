module Robin {

  const attributeMap = {
    "r-id":        "id",
    "r-left":      "left",
    "r-right":     "right",
    "r-top":       "top",
    "r-bottom":    "bottom",
    "r-width":     "width",
    "r-height":    "height",
    "r-center-x":  "center-x",
    "r-center-y":  "center-y",
    "r-register":  "register",
    "r-container": "container",
    "r-center-in": "center-in",
    "r-align-x":   "align-x",
    "r-align-y":   "align-y",
    "r-size":      "size",
    "r-fill":      "fill",
    "r-watch":     "watch",
    "r-style":     "style"
  };

  export interface LayoutOptions {
    findStyleSheets?: boolean;
    findElements?:    boolean;
  }

  const defaultLayoutOptions: LayoutOptions = {
    findStyleSheets: true,
    findElements:    true
  };

  export class Layout {

    system = new System();
    rects = [] as Rect[];
    digestID = 0;
    rulesets = {} as { [id: string]: Rule[]; };

    private updateIsRequested = false;

    attachTo(root: HTMLElement, options: LayoutOptions = defaultLayoutOptions) {

      // add the special rects
      this.rects.push(new ViewportRect(this));
      this.rects.push(new DocumentRect(this));
      this.rects.push(new BodyRect(this));

      // find rulesets from script tags
      if (options.findStyleSheets) {
        let scriptTags = document.getElementsByTagName("script");
        for (let i = 0; i < scriptTags.length; i++) {
          let scriptTag = scriptTags.item(i);
          if (scriptTag.getAttribute("type") === "text/robin") {
            this.parseStyleSheet(scriptTag.textContent);
          }
        }
      }

      // walk the dom and find elements with robin attributes
      if (options.findElements) {
        let iterator = document.createNodeIterator(root, NodeFilter.SHOW_ELEMENT);
        let el: HTMLElement;
        while (el = iterator.nextNode() as any) {
          let options = this.getRectOptions(el);
          if (options) {
            new ElementRect(el, this, options);
          }
        }
      }

      this.update();
    }

    getRectOptions(el: HTMLElement, isRect: boolean = false): RectOptions {

      let options: RectOptions = {
        id:        el.id ? el.id : el.getAttribute("r-id"),
        container: null,
        watcher:   null,
        rules:     []
      };

      if (options.id && this.hasRuleSet(options.id)) {
        isRect = true;
        for (let rule of this.rulesets[options.id]) {
          this.handleRule(options, rule);
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

      if (!isRect) {
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
        expr = Parser.parse(text, { startRule: "expression" })
      }
      return { target, text, expr };
    }

    private identFrom({ target, text, expr }: Rule): string {
      if (!expr) {
        expr = this.ruleFor(target, text).expr;
      }
      if (expr.tag !== "ident") {
        throw new Error(`"${text}" is not an identifier`);
      }
      return expr.value;
    }

    private handleRule(options: RectOptions, rule: Rule): void {
      try {
        switch (rule.target) {
          case "register":
          case "id":
          case "watch":
            break;
          case "container":
            options.container = this.identFrom(rule)
            break;
          case "center-in":
            let centerInIdent = this.identFrom(rule);
            this.handleRule(options, this.ruleFor("center-x", `${centerInIdent}.center-x`));
            this.handleRule(options, this.ruleFor("center-y", `${centerInIdent}.center-y`));
            break;
          case "align-x":
            let alignXIdent = this.identFrom(rule);
            this.handleRule(options, this.ruleFor("left", `${alignXIdent}.left`));
            this.handleRule(options, this.ruleFor("right", `${alignXIdent}.right`));
            break;
          case "align-y":
            let alignYIdent = this.identFrom(rule);
            this.handleRule(options, this.ruleFor("top", `${alignYIdent}.top`));
            this.handleRule(options, this.ruleFor("bottom", `${alignYIdent}.bottom`));
            break;
          case "size":
            let sizeIdent = this.identFrom(rule);
            this.handleRule(options, this.ruleFor("width", `${sizeIdent}.width`));
            this.handleRule(options, this.ruleFor("height", `${sizeIdent}.height`));
            break;
          case "fill":
            let fillIdent = this.identFrom(rule);
            this.handleRule(options, this.ruleFor("top", `${fillIdent}.top`));
            this.handleRule(options, this.ruleFor("bottom", `${fillIdent}.bottom`));
            this.handleRule(options, this.ruleFor("left", `${fillIdent}.left`));
            this.handleRule(options, this.ruleFor("right", `${fillIdent}.right`));
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

    parseStyleSheet(input: string): void {
      let rulesets = Parser.parse<RuleSet[]>(input, { startRule: "rulesets" });
      for (let set of rulesets) {
        if (this.hasRuleSet(set.id)) {
          this.rulesets[set.id].push(...set.rules);
        } else {
          this.rulesets[set.id] = set.rules;
        }
      }
    }

    /**
     * Request an update to occur the on the next
     * animation frame.
     */
    update(): void {
      if (this.updateIsRequested) {
        return;
      }
      this.updateIsRequested = true;
      window.requestAnimationFrame(() => {
        this.updateIsRequested = false;
        this.system.solve(this.digestID++);
      });
    }

    /**
     * Assign a value and update the system.
     */
    assign(name: string, value: number): void {
      this.system.assign(name, value);
      this.update();
    }

    /**
     * Register a custom function.
     */
    func(name: string, func: Function): void {
      this.system.func(name, func);
    }

    /**
     * Register all functions on an object
     */
    funcsFrom(object: any, ...names: string[]): void {
      for (let name of names) {
        this.func(name, object[name].bind(object));
      }
    }

    /**
     * Get a rect by id
     */
    getRect(id: string): Rect {
      for (let rect of this.rects) {
        if (rect.getId() === id) {
          return rect;
        }
      }
      return null;
    }

    private hasRuleSet(id: string): boolean {
      return this.rulesets.hasOwnProperty(id);
    }

  }
}
