enum ElementProperty {
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
  "left":    ElementProperty.LEFT,
  "right":   ElementProperty.RIGHT,
  "width":   ElementProperty.WIDTH,
  "hcenter": ElementProperty.HCENTER,
  "top":     ElementProperty.VCENTER,
  "bottom":  ElementProperty.BOTTOM,
  "height":  ElementProperty.HEIGHT,
  "vcenter": ElementProperty.VCENTER
};

class ElementManager {

  private id: string;
  private expressions: { [property: number]: string; } = {};
  private constrained = [] as ElementProperty[];

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

  constrain(propertyName: string, expression: string): void {
    let property = nameToProperty[propertyName];
    if (this.isConstrained(property)) {
      throw new Error(
        `${this.id}.${propertyName} is already set to ${this.expressions[property]}`);
    }
    switch (property) {
      case ElementProperty.WIDTH:
      case ElementProperty.LEFT:
      case ElementProperty.RIGHT:
      case ElementProperty.HCENTER:
        if (this.xAxisConstraints >= 2) {
          throw new Error(
            `cannot set ${this.id}.${propertyName} because the x axis already has 2 constraints`);
        }
        this.xAxisConstraints++;
        break;
      case ElementProperty.HEIGHT:
      case ElementProperty.TOP:
      case ElementProperty.BOTTOM:
      case ElementProperty.VCENTER:
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
        case ElementProperty.TOP:
        case ElementProperty.BOTTOM:
        case ElementProperty.VCENTER:
          style.top = `${this.top.getValue()}px`;
          break;
        case ElementProperty.HEIGHT:
          style.height = `${this.height.getValue()}px`;
          break;
        case ElementProperty.LEFT:
        case ElementProperty.RIGHT:
        case ElementProperty.HCENTER:
          style.left = `${this.left.getValue()}px`;
          break;
        case ElementProperty.WIDTH:
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
        if (this.isConstrained(ElementProperty.WIDTH)) {
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
        if (this.isConstrained(ElementProperty.HEIGHT)) {
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

  private isConstrained(property: ElementProperty): boolean {
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
