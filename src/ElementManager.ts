
class ElementManager {

  private id: string;
  private expressions: { [property: string]: string; } = {};
  private constrained = [] as string[];

  private xAxisConstraints = 0;
  private yAxisConstraints = 0;

  constructor(
    private system:  System,
    private element: HTMLElement,
    private layout:  LayoutManager
  ) {
    this.id = element.id;
    let id = element.id;

    // x axis
    system.subtract(`${id}.width`, `${id}.right`, `${id}.left`);
    system.divide(`${id}_tmp1`, `${id}.width`, 2);
    system.add(`${id}.hcenter`, `${id}.left`, `${id}_tmp1`);

    // y axis
    system.subtract(`${id}.height`, `${id}.bottom`, `${id}.top`);
    system.divide(`${id}_tmp2`, `${id}.height`, 2);
    system.add(`${id}.vcenter`, `${id}.top`, `${id}_tmp2`);

    this.layout.register(this);
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
    }
    this.expressions[property] = expression;
    this.constrained.push(property);
    this.system.set(`${this.id}.${property}`, expression.toString());
  }

  updateSystem(): void {
    let id = this.id;
    let rect = this.element.getBoundingClientRect();
    if (this.xAxisConstraints === 0) {
      this.system.set(`${id}.left`, rect.left);
      this.system.set(`${id}.width`, rect.width);
    }
    else if (this.xAxisConstraints === 1) {
      if (this.isConstrained("width")) {
        this.system.set(`${id}.left`, rect.left);
      } else {
        this.system.set(`${id}.width`, rect.width);
      }
    }
    if (this.yAxisConstraints === 0) {
      this.system.set(`${id}.top`, rect.top);
      this.system.set(`${id}.height`, rect.height);
    }
    else if (this.yAxisConstraints === 1) {
      if (this.isConstrained("height")) {
        this.system.set(`${id}.top`, rect.height);
      } else {
        this.system.set(`${id}.height`, rect.height);
      }
    }
  }

  updateElement(): void {
    for (let property of this.constrained) {
      let value = this.system.get(`${this.id}.${property}`);
      this.element.style[property] = `${value}px`;
    }
  }

  private isConstrained(property: string): boolean {
    return this.expressions.hasOwnProperty(property);
  }

  private handleResize(): void {
    console.log("element resized");
  }

}
