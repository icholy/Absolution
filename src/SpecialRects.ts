
module Absolution {

  /**
   * A rect for the dom's document.
   * It triggers an update on page resize.
   */
  export class DocumentRect extends Rect {

    constructor(manager: Manager) {
      super(manager, "document");
      window.addEventListener("resize", () => {
        this.updateSystemPosition();
        manager.update();
      });
      this.updateSystemPosition();
    }

    private updateSystemPosition(): void {
      let element = document.documentElement;
      let position = Utils.getRectPosition(element);
      this.left.assignValue(position.left);
      this.top.assignValue(position.top);
      this.width.assignValue(position.width);
      this.height.assignValue(position.height);
    }

  }

  /**
   * A rect for the page's viewport.
   * It triggers an update on page resize.
   */
  export class ViewportRect extends Rect {

    constructor(manager: Manager) {
      super(manager, "viewport");
      window.addEventListener("resize", () => {
        this.updateSystemPosition();
        this.manager.update();
      });
      window.addEventListener("scroll", () => {
        this.updateSystemPosition();
        this.manager.update();
      });
      this.updateSystemPosition();
    }

    private updateSystemPosition(): void {
      let position = Utils.getViewportRectPosition();
      this.left.assignValue(position.left);
      this.top.assignValue(position.top);
      this.width.assignValue(position.width);
      this.height.assignValue(position.height);
    }

  }

  /**
   * A rect for the dom's body.
   * It triggers an update on page resize.
   */
  export class BodyRect extends Rect {

    constructor(manager: Manager) {
      super(manager, "body");
      window.addEventListener("resize", () => {
        this.updateSystemPosition();
        manager.update();
      });
      this.updateSystemPosition();
    }

    private updateSystemPosition(): void {
      let element = document.body;
      let position = Utils.getRectPosition(element);
      this.left.assignValue(position.left);
      this.top.assignValue(position.top);
      this.width.assignValue(position.width);
      this.height.assignValue(position.height);
    }

  }

  /**
   * A virtual rect is one that does not represent an existing
   * element. It can be used as a container for other rects without
   * needing to add additional html.
   */
  export class VirtualRect extends ManagedRect {}

}
