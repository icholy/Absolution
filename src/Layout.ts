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
    rulesById = {} as { [id: string]: Rule[]; };
    rulesByClass = {} as { [className: string]: Rule[]; };
    changedRects: ManagedRect[] = [];

    private updateIsRequested = false;

    attachTo(root: HTMLElement, options: LayoutOptions = defaultLayoutOptions) {

      // add the special rects
      new ViewportRect(this);
      new DocumentRect(this);
      new BodyRect(this);

      // find rulesets from script tags
      if (options.findStyleSheets) {
        let scriptTags = document.getElementsByTagName("script");
        for (let i = 0; i < scriptTags.length; i++) {
          let scriptTag = scriptTags.item(i);
          if (scriptTag.getAttribute("type") === "text/absolution") {
            this.env.parseStyleSheet(scriptTag.textContent);
          }
        }
      }

      // walk the dom and find elements with a-attributes
      if (options.findElements) {
        let iterator = document.createNodeIterator(root, NodeFilter.SHOW_ELEMENT);
        let el: HTMLElement;
        while (el = iterator.nextNode() as any) {
          let options = this.env.getRectOptions(el);
          if (options) {
            new ElementRect(el, this, options);
          }
        }
      }

      this.update();
    }

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
