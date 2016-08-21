module Robin {

  export class ElementRect extends ManagedRect {

    // the element that's being managed
    public element: HTMLElement;

    // true if postition: "absolute" has been set
    private isAbsoluteSet = false;

    private offsetIsSet = false;
    private offset: {
      left: number;
      top:  number;
    };

    constructor(
      element:   HTMLElement,
      layout:    Layout,
      options:   RectOptions
    ) {
      super(layout, options);
      this.element = element;
      this.offset = { left: 0, top: 0 };
      this.initialize();
    }

    makeWatcher(name: string): Watcher {
      // add a watcher if one is specified
      if (name !== "mutation") {
        throw new Error(
          `${this.getId()}.r-watch value error: "${name}" is not a supported watcher`);
      }
      return new MutationObserverWatcher(this);
    }

    /**
     * Get the element's position
     */
    getRectPosition(): RectPosition {
      return Utils.getRectPosition(this.element);
    }

    /**
     * Set the element's left offset
     */
    setLeft(value: number): void {
      this.setAbsolute();
      this.offset.left = value;
      this.offsetIsSet = true;
    }

    /**
     * Set the element's top offset
     */
    setTop(value: number): void {
      this.offset.top = value;
      this.offsetIsSet = true;
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

    /**
     * Called after all the set methods.
     */
    afterUpdateRect(): void {
      if (this.offsetIsSet) {
        this.setAbsolute();
        this.element.style.transform = `translate(${this.offset.left}px, ${this.offset.top}px)`
        this.offset = { left: 0, top: 0 };
        this.offsetIsSet = false;
      }
    }

    private setAbsolute(): void {
      if (!this.isAbsoluteSet) {
        let style = this.element.style;
        style.position = "absolute";
        style.left = "0px";
        style.top = "0px";
        this.isAbsoluteSet = true;
      }
    }


  }

}
