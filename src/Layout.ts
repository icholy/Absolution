module Robin {

  interface RectInfo {
    id:        string;
    container: string;
    watcher:   string;
    rules:     Rule[];
  }

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
    "r-style":     "style",

    "data-r-id":        "id",
    "data-r-left":      "left",
    "data-r-right":     "right",
    "data-r-top":       "top",
    "data-r-bottom":    "bottom",
    "data-r-width":     "width",
    "data-r-height":    "height",
    "data-r-center-x":  "center-x",
    "data-r-center-y":  "center-y",
    "data-r-register":  "register",
    "data-r-container": "container",
    "data-r-center-in": "center-in",
    "data-r-align-x":   "align-x",
    "data-r-align-y":   "align-y",
    "data-r-size":      "size",
    "data-r-fill":      "fill",
    "data-r-watch":     "watch",
    "data-r-style":     "style"
  };

  export class Layout {

    system = new System();
    rects = [] as Rect[];
    digestID = 0;
    rulesets = {} as { [id: string]: Rule[]; };

    private updateIsRequested = false;

    attachTo(root: HTMLElement) {

      // add the special rects
      this.rects.push(new ViewportRect(this));
      this.rects.push(new DocumentRect(this));
      this.rects.push(new BodyRect(this));

      let styleTags = document.getElementsByTagName("style");
      for (let i = 0; i < styleTags.length; i++) {
        let styleTag = styleTags.item(i);
        if (styleTag.getAttribute("type") === "text/robin") {
          this.parseStyleSheet(styleTag.textContent);
        }
      }

      // walk the dom and find elements with robin attributes
      let iterator = document.createNodeIterator(root, NodeFilter.SHOW_ELEMENT);
      let el: HTMLElement;
      while (el = iterator.nextNode() as any) {
        this.maybeAddElement(el);
      }

      this.update();
    }

    private getRectInfo(el: HTMLElement): RectInfo {

      let isRect = false;

      let info: RectInfo = {
        id:        el.id ? el.id : this.getAttribute(el, "id"),
        container: "document",
        watcher:   null,
        rules:     []
      }

      if (info.id && this.hasRuleSet(info.id)) {
        isRect = true;
        info.rules = this.rulesets[info.id].slice();
      }

      for (let i = 0; i < el.attributes.length; i++) {
        let attr = el.attributes.item(i);
        if (!attributeMap.hasOwnProperty(attr.name)) {
          continue;
        }
        isRect = true;

        let target = attributeMap[attr.name];
        let text   = attr.textContent;

        switch (target) {
          case "register":
          case "id":
          case "watch":
            break;
          case "container":
            info.container = text;
            break;
          case "center-in":
            info.rules.push(this.makeRuleFor("center-x", `${text}.center-x`));
            info.rules.push(this.makeRuleFor("center-y", `${text}.center-y`));
            break;
          case "align-x":
            info.rules.push(this.makeRuleFor("left", `${text}.left`));
            info.rules.push(this.makeRuleFor("right", `${text}.right`));
            break;
          case "align-y":
            info.rules.push(this.makeRuleFor("top", `${text}.top`));
            info.rules.push(this.makeRuleFor("bottom", `${text}.bottom`));
            break;
          case "size":
            info.rules.push(this.makeRuleFor("width", `${text}.width`));
            info.rules.push(this.makeRuleFor("height", `${text}.height`));
            break;
          case "fill":
            info.rules.push(this.makeRuleFor("top", `${text}.top`));
            info.rules.push(this.makeRuleFor("bottom", `${text}.bottom`));
            info.rules.push(this.makeRuleFor("left", `${text}.left`));
            info.rules.push(this.makeRuleFor("right", `${text}.right`));
            break;
          case "style":
            let rules = Parser.parse(text, { startRule: "inline_rules" });
            info.rules = info.rules.concat(rules);
            break;
          default:
            info.rules.push(this.makeRuleFor(target, text));
        }
      }

      if (!isRect) {
        return null;
      }

      // if there's no id, create a GUID
      if (!info.id) {
        info.id = Utils.guid();
      }

      return info;
    }

    private makeRuleFor(target: string, expression: string): Rule {
      return {
        target: target,
        text:   expression,
        expr:   Parser.parse(expression, { startRule: "expression" })
      };
    }

    maybeAddElement(el: HTMLElement): void {
      let info = this.getRectInfo(el);
      if (!info) {
        return;
      }
      let rect = new ElementRect(info.id, el, info.container, this);
      for (let rule of info.rules) {
        rect.constrain(rule.target, rule.text, rule.expr)
      }

      // add a watcher if one is specified
      if (info.watcher) {
        if (info.watcher !== "mutation") {
          throw new Error(
            `${rect.getId()}.r-watch value error: "${info.watcher}" is not a supported watcher`);
        }
        let watcher = new MutationObserverWatcher(rect)
        rect.addWatcher(watcher);
      }

      rect.initialize();
    }

    parseStyleSheet(input: string): void {
      let rulesets = Parser.parse(input, { startRule: "rulesets" }) as RuleSet[];
      for (let set of rulesets) {
        if (this.hasRuleSet(set.id)) {
          this.rulesets[set.id] = this.rulesets[set.id].concat(set.rules);
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

    private getAttribute(element: HTMLElement, name: string): string {
      if (element.hasAttribute(`r-${name}`)) {
        return element.getAttribute(`r-${name}`);
      }
      if (element.hasAttribute(`r-data-${name}`)) {
        return element.getAttribute(`r-data-${name}`);
      }
      return null;
    }

    private hasRuleSet(id: string): boolean {
      return this.rulesets.hasOwnProperty(id);
    }

  }
}
