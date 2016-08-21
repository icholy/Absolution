enum Property {
  LEFT,
  RIGHT,
  WIDTH,
  HCENTER,
  TOP,
  BOTTOM,
  HEIGHT,
  VCENTER
}

const nameToProperty = {
  "left":    Property.LEFT,
  "right":   Property.RIGHT,
  "width":   Property.WIDTH,
  "hcenter": Property.HCENTER,
  "top":     Property.VCENTER,
  "bottom":  Property.BOTTOM,
  "height":  Property.HEIGHT,
  "vcenter": Property.VCENTER
};

class ElementManager {

  private id: string;
  private expressions: { [property: number]: string; } = {};
  private constrained = [] as Property[];

  private xAxisConstraints = 0;
  private yAxisConstraints = 0;

  private left:   Constraints.Variable;
  private width:  Constraints.Variable;
  private top:    Constraints.Variable;
  private height: Constraints.Variable;

  constructor(
    private system:    Constraints.System,
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

  constrain(propertyName: string, expression: string): void {
    let property = nameToProperty[propertyName];
    if (this.isConstrained(property)) {
      throw new Error(
        `${this.id}.${propertyName} is already set to ${this.expressions[property]}`);
    }
    switch (property) {
      case Property.WIDTH:
      case Property.LEFT:
      case Property.RIGHT:
      case Property.HCENTER:
        if (this.xAxisConstraints >= 2) {
          throw new Error(
            `cannot set ${this.id}.${propertyName} because the x axis already has 2 constraints`);
        }
        this.xAxisConstraints++;
        break;
      case Property.HEIGHT:
      case Property.TOP:
      case Property.BOTTOM:
      case Property.VCENTER:
        if (this.yAxisConstraints >= 2) {
          throw new Error(
            `cannot set ${this.id}.${propertyName} because the y axis already has 2 constraints`);
        }
        this.yAxisConstraints++;
        break;
      default:
        throw new Error(`${this.id}.${propertyName} is not a supported property`);
    }
    this.expressions[property] = expression;
    this.constrained.push(property);
    this.system.set(`${this.id}.${propertyName}`, expression.toString());
  }

  updateElement(): void {
    let style = this.element.style;
    for (let property of this.constrained) {
      switch (property) {
        case Property.TOP:
        case Property.BOTTOM:
        case Property.VCENTER:
          style.top = `${this.top.getValue()}px`;
          break;
        case Property.HEIGHT:
          style.height = `${this.height.getValue()}px`;
          break;
        case Property.LEFT:
        case Property.RIGHT:
        case Property.HCENTER:
          style.left = `${this.left.getValue()}px`;
          break;
        case Property.WIDTH:
          style.width = `${this.width.getValue()}px`;
          break;
      }
    }
  }
  
  updateSystem(): void {
    let rect = this.getBoundingRect();
    this.updateXAxisWith(rect);
    this.updateYAxisWith(rect);
  }

  private updateXAxisWith(rect: ClientRect): void {
    switch (this.xAxisConstraints) {
      case 0:
        this.left.assignValue(rect.left);
        this.width.assignValue(rect.width);
        break;
      case 1:
        if (this.isConstrained(Property.WIDTH)) {
          this.left.assignValue(rect.left);
        } else {
          this.width.assignValue(rect.width);
        }
        break;
    }
  }

  private updateYAxisWith(rect: ClientRect): void {
    switch (this.yAxisConstraints) {
      case 0:
        this.top.assignValue(rect.top);
        this.height.assignValue(rect.height);
        break;
      case 1:
        if (this.isConstrained(Property.HEIGHT)) {
          this.top.assignValue(rect.top);
        } else {
          this.height.assignValue(rect.height);
        }
        break;
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

  private isConstrained(property: Property): boolean {
    return this.expressions.hasOwnProperty(property.toString());
  }

  private guid(): string {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
  }

}
