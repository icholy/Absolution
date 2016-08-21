module Absolution {

  export interface ManagerOptions {
    findStyleSheets?: boolean;
    findElements?:    boolean;
    lookupSelectors?: boolean;
    styleSheet?:      StyleSheet;
  }

  const defaultOptions: ManagerOptions = {
    findStyleSheets: true,
    findElements:    true
  };

  export class Manager {

    private digestID = 0;
    private changedRects: ManagedRect[] = [];
    private updateIsRequested = false;
    private rects = {} as { [id: string]: Rect; };

    constructor(
      public env    = new Environment(),
      public system = new System()
    ) {}

    initialize(options: ManagerOptions = defaultOptions) {

      // add the special rects
      this.rects["viewport"] = new ViewportRect(this);
      this.rects["document"] = new DocumentRect(this);
      this.rects["body"]     = new BodyRect(this);

      // load pre-compiled stylesheet
      if (options.styleSheet) {
        this.env.loadStyleSheet(options.styleSheet);
      }

      // find rulesets from script tags
      if (options.findStyleSheets) {
        Utils.forEachStyleScriptTag(el => {
          this.env.parseStyleSheet(el.textContent);
        });
      }

      // add variables from stylesheet
      for (let userVar of this.env.getUserVariables()) {
        this.system.setNode(userVar.name, userVar.expr);
      }

      // add the virtual rects from the stylesheet
      for (let options of this.env.getVirtuals()) {
        this.rects[options.id] = new VirtualRect(this, options);
      }

      // walk the dom and find elements with a-attributes
      if (options.findElements) {
        Utils.forEachElement(document.body, el => this.register(el));
      }

      // use stylesheet selectors to lookup elements
      if (options.lookupSelectors) {
        for (let selector of this.env.getSelectors()) {
          Utils.forEachSelector(selector, el => this.register(el));
        }
      }

      this.update();
    }

    /**
     * Returns true if the element is a registered rect.
     */
    private isRegistered(el: HTMLElement): boolean {
      let id = Utils.getRectId(el);
      return this.rects.hasOwnProperty(id);
    }

    /**
     * Register an element with the manager.
     */
    register(el: HTMLElement, options?: RectOptions): void {
      if (this.isRegistered(el)) {
        return;
      }
      options = options || this.env.getRectOptions(el);
      if (options) {
        let rect = new ElementRect(el, this, options);
        let { id } = options;
        Utils.setRectId(el, id);
        this.rects[id] = rect;
      }
    }

    /**
     * Unregister an element from the manager.
     */
    unregister(el: HTMLElement): void {
      let id = Utils.getRectId(el);
      let rect = this.rects[id];
      if (rect) {
        rect.destroy();
        delete this.rects[id];
      }
    }

    /**
     * Get a rect by it's id.
     */
    getRect(id: string): Rect {
      return this.rects[id];
    }

    /**
     * Queue a rect to be updated after the system
     * is finished being solved.
     */
    enqueueRect(rect: ManagedRect): void {
      this.changedRects.push(rect);
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
        this.system.solve(this.digestID++);
        for (let rect of this.changedRects) {
          rect.updateRectPosition();
        }
        this.changedRects = [];
        this.updateIsRequested = false;
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
     * Register all functions on an object.
     */
    funcs(object: any, objectName?: string): void {
      let prefix = objectName ? `${objectName}.` : "";
      for (let name of Object.getOwnPropertyNames(object)) {
        let value = object[name];
        if (typeof value === "function") {
          this.func(`${prefix}${name}`, value.bind());
        }
      }
    }

  }
}
