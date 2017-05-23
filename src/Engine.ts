module uzi {

  export interface EngineOptions {

    // Find and parse script tags where type="text/uzi"
    findStyleSheets?: boolean;

    // Walk the dom and find elements with `a-rect` or `a-style` attributes.
    findElements?: boolean;

    // Use the selectors in the stylesheets to lookup elements in the dom.
    lookupSelectors?: boolean;

    // Provide pre-compiled rules to the env.
    envData?: EnvData;
  }

  const defaultOptions: EngineOptions = {
    findStyleSheets: true,
    findElements:    true
  };

  /**
   * The engine is the primary interface to the client.
   */
  export class Engine {

    private system          = new System();
    private env             = new Environment();
    private digestID        = 0;
    private changedRects    = [] as ManagedRect[];
    private isUpdatePending = false;
    private rects           = {} as { [id: string]: Rect; };

    /**
     * Initializes the environment and finds rects in the dom.
     */
    initialize(options: EngineOptions = defaultOptions) {

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
        let ctx = new Context();
        this.rects[options.id] = new VirtualRect(this, ctx, options);
      }

      // walk the dom and find elements with a-attributes
      if (options.findElements) {
        Utils.forEachElement(document.body, el => this.mount(el));
      }

      // use stylesheet selectors to lookup elements
      if (options.lookupSelectors) {
        for (let selector of this.env.getSelectors()) {
          Utils.forEachSelector(selector, el => this.mount(el));
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
    private isMounted(el: HTMLElement): boolean {
      return Utils.getRectId(el) in this.rects;
    }

    /**
     * Register a rect with the engine.
     */
    register(rect: Rect): void {
      let id = rect.getId();
      if (id in this.rects) {
        return;
      }
      this.rects[id] = rect;
    }

    /**
     * Unregister a rect from the engine.
     */
    unregister(rect: Rect): void {
      let id = rect.getId();
      delete this.rects[id];
    }

    /**
     * Mount an element to the engine.
     */
    mount(el: HTMLElement): void {
      if (this.isMounted(el)) {
        return;
      }
      let options = this.env.getRectOptions(el);
      if (options) {
        let context = new RectContext(options);
        let rect = new ElementRect(el, this, context, options);
        let { id } = options;
        Utils.setRectId(el, id);
        this.register(rect);
      }
    }

    /**
     * Unmount an element from the engine.
     */
    unmount(el: HTMLElement): void {
      let id = Utils.getRectId(el);
      let rect = this.rects[id];
      if (rect) {
        this.unregister(rect);
        rect.destroy();
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
     * Run an update now.
     */
    updateNow(): void {
      this.system.solve(this.digestID++);
      for (let rect of this.changedRects) {
        rect.updateRectPosition();
      }
      this.changedRects = [];
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
        this.updateNow();
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
          this.func(`${prefix}${name}`, value.bind(object));
        }
      }
    }

    /**
     * Destroy the engine.
     */
    destroy(): void {
      for (let id of Object.keys(this.rects)) {
        let rect = this.getRect(id);
        this.unregister(rect);
        rect.destroy();
      }
    }

  }
}
