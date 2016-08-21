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
        options.rules.push(...this.rulesets[options.id]);
      }

      for (let i = 0; i < el.attributes.length; i++) {
        let attr = el.attributes.item(i);
        if (!attributeMap.hasOwnProperty(attr.name)) {
          continue;
        }
        isRect = true;

        let target = attributeMap[attr.name];
        let text   = attr.textContent;

        try {
          this.handleAttribute(options, target, text);
        } catch (e) {
          throw new Error(`${target}="${text}" ${e}`);
        }
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

    private ruleFor(target: string, expression: string): Rule {
      return {
        target: target,
        text:   expression,
        expr:   Parser.parse(expression, { startRule: "expression" })
      };
    }

    private handleAttribute(options: RectOptions, target: string, text: string): void {

      switch (target) {
        case "register":
        case "id":
        case "watch":
          break;
        case "container":
          options.container = text;
          break;
        case "center-in":
          options.rules.push(this.ruleFor("center-x", `${text}.center-x`));
          options.rules.push(this.ruleFor("center-y", `${text}.center-y`));
          break;
        case "align-x":
          options.rules.push(this.ruleFor("left", `${text}.left`));
          options.rules.push(this.ruleFor("right", `${text}.right`));
          break;
        case "align-y":
          options.rules.push(this.ruleFor("top", `${text}.top`));
          options.rules.push(this.ruleFor("bottom", `${text}.bottom`));
          break;
        case "size":
          options.rules.push(this.ruleFor("width", `${text}.width`));
          options.rules.push(this.ruleFor("height", `${text}.height`));
          break;
        case "fill":
          options.rules.push(this.ruleFor("top", `${text}.top`));
          options.rules.push(this.ruleFor("bottom", `${text}.bottom`));
          options.rules.push(this.ruleFor("left", `${text}.left`));
          options.rules.push(this.ruleFor("right", `${text}.right`));
          break;
        case "style":
          let rules = Parser.parse(text, { startRule: "inline_rules" });
          options.rules.push(...rules);
          break;
        default:
          options.rules.push(this.ruleFor(target, text));
      }
    }

    parseStyleSheet(input: string): void {
      let rulesets = Parser.parse(input, { startRule: "rulesets" }) as RuleSet[];
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
    func(name: string, func: Function, arity?: number): void {
      this.system.func(name, func, arity);
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
