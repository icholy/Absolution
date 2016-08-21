
module Robin {

  export class DocumentRect extends Rect {

    constructor(layout: Layout) {
      super(layout, "document");
      window.addEventListener("resize", () => {
        this.updateSystem();
        layout.update();
      });
      this.updateSystem();
    }

    updateRect(): void {}

    updateSystem(): void {
      let element = document.documentElement;
      let position = Utils.getRectPosition(element);
      this.left.assignValue(position.left);
      this.top.assignValue(position.top);
      this.width.assignValue(position.width);
      this.height.assignValue(position.height);
    }

  }

}
