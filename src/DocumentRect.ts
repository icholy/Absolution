
class DocumentRect extends Rect {

  constructor(system: Constraints.System) {
    super(system, "document");
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
