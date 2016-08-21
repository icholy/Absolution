
module Absolution {

  export class DocumentRect extends Rect {

    constructor(layout: Layout) {
      super(layout, "document");
      window.addEventListener("resize", () => {
        this.updateSystemPosition();
        layout.update();
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

    constructor(layout: Layout) {
      super(layout, "viewport");
      window.addEventListener("resize", () => {
        this.updateSystemPosition();
        this.layout.update();
      });
      window.addEventListener("scroll", () => {
        this.updateSystemPosition();
        this.layout.update();
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

    constructor(layout: Layout) {
      super(layout, "body");
      window.addEventListener("resize", () => {
        this.updateSystemPosition();
        layout.update();
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

}
