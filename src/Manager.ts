module Absolution {

  export interface ManagerOptions {

    // Find and parse script tags where type="text/absolution"
    findStyleSheets?: boolean;

    // Walk the dom and find elements with `a-rect` or `a-style` attributes.
    findElements?: boolean;

    // Use the selectors in the stylesheets to lookup elements in the dom.
    lookupSelectors?: boolean;

    // Provide pre-compiled rules to the env.
    envData?: EnvData;
  }

  const defaultOptions: ManagerOptions = {
    findStyleSheets: true,
    findElements:    true
  };

  /**
   * The manager is the primary interface to the client.
   */
  export class Manager {

    private system          = new System();
    private env             = new Environment();
    private digestID        = 0;
    private changedRects    = [] as ManagedRect[];
    private isUpdatePending = false;
    private rects           = {} as { [id: string]: Rect; };

    /**
     * Initializes the environment and finds rects in the dom.
     */
    initialize(options: ManagerOptions = defaultOptions) {

      // add the special rects
      this.rects["viewport"] = new ViewportRect(this);
      this.rects["document"] = new DocumentRect(this);
      this.rects["body"]     = new BodyRect(this);

      // load pre-compiled stylesheet
      if (options.envData) {
        this.env.setExportData(options.envData);
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
     * Get the system instance.
     */
    getSystem(): System {
      return this.system;
    }

    /**
     * Get the environtment instance.
     */
    getEnv(): Environment {
      return this.env;
    }

    /**
     * Returns true if the element is a registered rect.
     */
    private isRegistered(el: HTMLElement): boolean {
      return Utils.getRectId(el) in this.rects;
    }

    /**
     * Register an element with the manager.
     */
    register(el: HTMLElement, options?: RectOptions): void {
      if (this.isRegistered(el)) {
        return;
      }
      if (!options) {
        options = this.env.getRectOptions(el);
      }
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
      if (this.isUpdatePending) {
        return;
      }
      this.isUpdatePending = true;
      window.requestAnimationFrame(() => {
        this.system.solve(this.digestID++);
        for (let rect of this.changedRects) {
          rect.updateRectPosition();
        }
        this.changedRects = [];
        this.isUpdatePending = false;
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
