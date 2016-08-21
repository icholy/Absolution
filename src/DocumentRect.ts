
class DocumentRect implements Rect {

  private left:   Constraints.Variable;
  private width:  Constraints.Variable;
  private top:    Constraints.Variable;
  private height: Constraints.Variable;

  constructor(private system: Constraints.System) {

    let id = "document";

    // x axis
    system.subtract(`${id}.width`, `${id}.right`, `${id}.left`);
    system.divide(`${id}_tmp1`, `${id}.width`, 2);
    system.add(`${id}.center-x`, `${id}.left`, `${id}_tmp1`);

    this.left  = system.getVariable(`${id}.left`);
    this.width = system.getVariable(`${id}.width`);

    // y axis
    system.subtract(`${id}.height`, `${id}.bottom`, `${id}.top`);
    system.divide(`${id}_tmp2`, `${id}.height`, 2);
    system.add(`${id}.center-y`, `${id}.top`, `${id}_tmp2`);

    this.top    = system.getVariable(`${id}.top`);
    this.height = system.getVariable(`${id}.height`);
  }

  updateRect(): void {}

  updateSystem(): void {
    let element = document.documentElement;
    let position = element.getBoundingClientRect();
    this.left.assignValue(position.left);
    this.top.assignValue(position.top);
    this.width.assignValue(position.width);
    this.height.assignValue(position.height);
  }

}
