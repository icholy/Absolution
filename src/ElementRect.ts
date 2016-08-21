module Absolution {

  export class ElementRect extends ManagedRect {

    // the element that's being managed
    public element: HTMLElement;

    // true if postition: "absolute" has been set
    private isAbsoluteSet = false;

    constructor(
      element: HTMLElement,
      layout:  Layout,
      options: RectOptions
    ) {
      super(layout, options);
      this.element = element;
      this.updateSystemPosition();
    }

    /**
     * Create a watcher by name
     */
    makeWatcher(name: string): Watcher {
      if (name !== "mutation") {
        throw new Error(
          `${this.getId()}.a-watch value error: "${name}" is not a supported watcher`);
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
     * Apply a position update to the element
     */
    applyPositionUpdate(update: RectPositionUpdate): void {
      let style = this.element.style;

      if (update.hasHeight) {
        style.height = `${update.height}px`;
      }

      if (update.hasWidth) {
        style.width = `${update.width}px`;
      }

      if (update.hasOffset) {
        let left = update.hasLeft ? update.left : 0;
        let top = update.hasTop ? update.top : 0;
        style.transform = `translate(${left}px, ${top}px)`;
        this.setAbsolute();
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
