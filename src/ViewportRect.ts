
class ViewportRect extends Rect {

  constructor(system: Constraints.System) {
    super(system, "viewport");
  }

  updateRect(): void {}

  updateSystem(): void {
    let position = Utils.getViewportRectPosition();
    this.left.assignValue(position.left);
    this.top.assignValue(position.top);
    this.width.assignValue(position.width);
    this.height.assignValue(position.height);
  }

}
