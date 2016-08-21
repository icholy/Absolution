module Robin {

  export class ElementRect extends ManagedRect {

    // the element that's being managed
    public element: HTMLElement;

    // true if postition: "absolute" has been set
    private isAbsoluteSet = false;

    // list of watchers to be cleaned up
    // when the rect is destroyed
    private watchers: Watcher[] = [];

    constructor(
      element:   HTMLElement,
      layout:    Layout,
      options:   RectOptions
    ) {
      super(layout, options);
      this.element = element;

      // add a watcher if one is specified
      if (options.watcher) {
        if (options.watcher !== "mutation") {
          throw new Error(
            `${this.getId()}.r-watch value error: "${options.watcher}" is not a supported watcher`);
        }
        let watcher = new MutationObserverWatcher(this);
        this.watchers.push(watcher);
      }

      this.initialize();
    }

    /**
     * Get the element's position
     */
    getRectPosition(): RectPosition {
      return Utils.getRectPosition(this.element);
    }

    private setAbsolute(): void {
      if (!this.isAbsoluteSet) {
        this.element.style.position = "absolute";
        this.isAbsoluteSet = true;
      }
    }

    /**
     * Set the element's left offset
     */
    setLeft(value: number): void {
      this.setAbsolute();
      this.element.style.left = `${value}px`;
    }

    /**
     * Set the element's top offset
     */
    setTop(value: number): void {
      this.setAbsolute();
      this.element.style.top = `${value}px`;
    }

    /**
     * Set the element's width
     */
    setWidth(value: number): void {
      this.element.style.width = `${value}px`;
    }

    /**
     * Set the element's height
     */
    setHeight(value: number): void {
      this.element.style.height = `${value}px`;
    }

    destroy(): void {
      super.destroy();
      for (let watcher of this.watchers) {
        watcher.destroy();
      }
    }

  }

}
