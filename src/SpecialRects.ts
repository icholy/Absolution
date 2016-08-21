
module Absolution {

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

  export class VirtualRect extends ManagedRect {}

}
