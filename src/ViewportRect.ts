module Robin {

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

    updateSystemPosition(): void {
      let position = Utils.getViewportRectPosition();
      this.left.assignValue(position.left);
      this.top.assignValue(position.top);
      this.width.assignValue(position.width);
      this.height.assignValue(position.height);
    }

  }

}
