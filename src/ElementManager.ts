
class ElementManager {

  private id: string;
  private expressions: { [property: string]: string; } = {};
  private constrained = [] as string[];

  private xAxisConstraints = 0;
  private yAxisConstraints = 0;

  private left:   Variable;
  private width:  Variable;
  private top:    Variable;
  private height: Variable;

  constructor(
    private system:    System,
    private element:   HTMLElement,
    private container: HTMLElement
  ) {
    this.id = element.id ? element.id : this.guid();
    let id = this.id;

    // x axis
    system.subtract(`${id}.width`, `${id}.right`, `${id}.left`);
    system.divide(`${id}_tmp1`, `${id}.width`, 2);
    system.add(`${id}.hcenter`, `${id}.left`, `${id}_tmp1`);

    this.left  = system.getVariable(`${id}.left`);
    this.width = system.getVariable(`${id}.width`);

    // y axis
    system.subtract(`${id}.height`, `${id}.bottom`, `${id}.top`);
    system.divide(`${id}_tmp2`, `${id}.height`, 2);
    system.add(`${id}.vcenter`, `${id}.top`, `${id}_tmp2`);

    this.top    = system.getVariable(`${id}.top`);
    this.height = system.getVariable(`${id}.height`);
  }

  constrain(property: string, expression: string): void {
    if (this.isConstrained(property)) {
      throw new Error(
        `${property} is already set to ${this.expressions[property]}`);
    }
    switch (property) {
      case "width":
      case "left":
      case "right":
      case "hcenter":
        this.xAxisConstraints++;
        break;
      case "height":
      case "top":
      case "bottom":
      case "vcenter":
        this.yAxisConstraints++;
        break;
      default:
        throw new Error(`${property} is not a supported property`);
    }
    this.expressions[property] = expression;
    this.constrained.push(property);
    this.system.set(`${this.id}.${property}`, expression.toString());
  }

  updateSystem(): void {
    let rect = this.getBoundingRect();
    if (this.xAxisConstraints === 0) {
      this.left.assignValue(rect.left);
      this.width.assignValue(rect.width);
    }
    else if (this.xAxisConstraints === 1) {
      if (this.isConstrained("width")) {
        this.left.assignValue(rect.left);
      } else {
        this.width.assignValue(rect.width);
      }
    }
    if (this.yAxisConstraints === 0) {
      this.top.assignValue(rect.top);
      this.height.assignValue(rect.height);
    }
    else if (this.yAxisConstraints === 1) {
      if (this.isConstrained("height")) {
        this.top.assignValue(rect.top);
      } else {
        this.height.assignValue(rect.height);
      }
    }
  }

  updateElement(): void {
    let style = this.element.style;
    for (let property of this.constrained) {
      switch (property) {
        case "top":
        case "bottom":
        case "vcenter":
          style.top = `${this.top.getValue()}px`;
          break;
        case "height":
          style.height = `${this.height.getValue()}px`;
          break;
        case "left":
        case "right":
        case "hcenter":
          style.left = `${this.left.getValue()}px`;
          break;
        case "width":
          style.width = `${this.width.getValue()}px`;
          break;
      }
    }
  }
  
  private getBoundingRect(): ClientRect {
    let inner = this.element.getBoundingClientRect();
    if (!this.container) {
      return inner;
    }
    let outer = this.container.getBoundingClientRect();
    return {
      left:   inner.left - outer.left,
      right:  inner.right - outer.right,
      top:    inner.top - outer.top,
      bottom: inner.bottom - outer.bottom,
      width:  inner.width,
      height: inner.height
    };
  }

  private isConstrained(property: string): boolean {
    return this.expressions.hasOwnProperty(property);
  }

  private guid(): string {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
  }

}
