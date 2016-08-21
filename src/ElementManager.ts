const enum Property {
  LEFT    = 0,
  RIGHT   = 1,
  WIDTH   = 2,
  HCENTER = 3,
  TOP     = 4,
  BOTTOM  = 5,
  HEIGHT  = 6,
  VCENTER = 7
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

const enum XDependency {
  LEFT_AND_WIDTH = 0,
  LEFT           = 1,
  WIDTH          = 2,
  NONE           = 3
}

const enum YDependency {
  TOP_AND_HEIGHT = 0,
  TOP            = 1,
  HEIGHT         = 2,
  NONE           = 3
}

class ElementManager {

  private id: string;
  private expressions: { [property: number]: string; } = {};
  private constrained = [] as Property[];

  // the dependencies are the element properties that are
  // reported to the constaint system when requested
  private xAxisDependencies = XDependency.LEFT_AND_WIDTH;
  private yAxisDependencies = YDependency.TOP_AND_HEIGHT;

  // these variables represent the element's propeties
  // inside the constaint system
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
    try {

      let property = this.getPropertyByName(propertyName);
      this.assertIsNotConstrained(property);

        if (this.isXAxisProperty(property)) {
          this.constrainXProperty(property);
        } else {
          this.contrainYProperty(property);
        }

      this.expressions[property] = expression;
      this.system.set(`${this.id}.${propertyName}`, expression.toString());

    } catch (e) {
      let reason = e instanceof Error ? e.message : e.toString();
      throw new Error(`cannot set ${this.id}.${propertyName} because ${reason}`);
    }
  }

  /**
   * Update the elements using the values in the constraint system
   */
  updateElement(): void {
    let style = this.element.style;
    for (let property of this.constrained) {
      switch (property) {
        case Property.TOP:
          style.top = `${this.top.getValue()}px`;
          break;
        case Property.HEIGHT:
          style.height = `${this.height.getValue()}px`;
          break;
        case Property.LEFT:
          style.left = `${this.left.getValue()}px`;
          break;
        case Property.WIDTH:
          style.width = `${this.width.getValue()}px`;
          break;
      }
    }
  }
  
  /**
   * Update the constaint system using the elements properties.
   */
  updateSystem(): void {

    if (
      this.xAxisDependencies === XDependency.NONE &&
      this.yAxisDependencies === YDependency.NONE
    ) {
      return;
    }

    let rect = this.getBoundingRect();

    // x axis
    switch (this.xAxisDependencies) {
      case XDependency.LEFT_AND_WIDTH:
        this.left.assignValue(rect.left);
        this.width.assignValue(rect.width);
        break;
      case XDependency.LEFT:
        this.left.assignValue(rect.left);
        break;
      case XDependency.WIDTH:
        this.width.assignValue(rect.width);
        break;
    }

    // y axis
    switch (this.yAxisDependencies) {
      case YDependency.TOP_AND_HEIGHT:
        this.top.assignValue(rect.top);
        this.height.assignValue(rect.height);
        break;
      case YDependency.TOP:
        this.top.assignValue(rect.top);
        break;
      case YDependency.HEIGHT:
        this.height.assignValue(rect.height);
        break;
    }
  }

  private constrainXProperty(property: Property): void {
    let isWidth = property === Property.WIDTH;
    switch (this.xAxisDependencies) {
      case XDependency.LEFT_AND_WIDTH:
        this.xAxisDependencies = isWidth ? XDependency.LEFT : XDependency.WIDTH;
        break;
      case XDependency.LEFT:
      case XDependency.WIDTH:
        this.xAxisDependencies = XDependency.NONE;
        break;
      default:
          throw new Error(`the x axis already has 2 constraints`);
    }
    this.constrained.push(isWidth ? Property.WIDTH : Property.LEFT);
  }

  private contrainYProperty(property: Property): void {
    let isHeight = property === Property.HEIGHT;
    switch (this.yAxisDependencies) {
      case YDependency.TOP_AND_HEIGHT:
        this.yAxisDependencies = isHeight ? YDependency.TOP : YDependency.HEIGHT;
        break;
      case YDependency.TOP:
      case YDependency.HEIGHT:
        this.yAxisDependencies = YDependency.NONE;
        break;
      default:
          throw new Error(`the y axis already has 2 constraints`);
    }
    this.constrained.push(isHeight ? Property.HEIGHT : Property.TOP);
  }

  private isXAxisProperty(property: Property): boolean {
    return property === Property.LEFT
        || property === Property.WIDTH
        || property === Property.RIGHT
        || property === Property.HCENTER;
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

  private assertIsNotConstrained(property: Property): void {
    if (this.expressions.hasOwnProperty(property.toString())) {
      throw new Error(`it's already set to (${this.expressions[property]})`);
    }
  }

  private getPropertyByName(name: string): Property {
    if (!nameToProperty.hasOwnProperty(name)) {
      throw new Error(`"${name}" is not a supported property`);
    }
    return nameToProperty[name];
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
