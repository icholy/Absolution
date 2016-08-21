module Absolution {

  export interface LayoutOptions {
    findStyleSheets?: boolean;
    findElements?:    boolean;
  }

  const defaultLayoutOptions: LayoutOptions = {
    findStyleSheets: true,
    findElements:    true
  };

  export class Layout {

    env = new Environment();
    system = new System();
    digestID = 0;
    changedRects: ManagedRect[] = [];

    private updateIsRequested = false;

    attachTo(root: HTMLElement, options: LayoutOptions = defaultLayoutOptions) {

      // add the special rects
      new ViewportRect(this);
      new DocumentRect(this);
      new BodyRect(this);

      // find rulesets from script tags
      if (options.findStyleSheets) {
        this.env.findStyleSheets();
      }

      // walk the dom and find elements with a-attributes
      if (options.findElements) {
        this.env.findRectElements(root, (el: HTMLElement, options: RectOptions) => {
          new ElementRect(el, this, options);
        });
      }

      this.update();
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
        this.updateIsRequested = false;
        this.system.solve(this.digestID++);
        for (let rect of this.changedRects) {
          rect.updateRectPosition();
        }
        this.changedRects = [];
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

  }
}
