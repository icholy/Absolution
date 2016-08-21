const enum Property {

  // X Axis
  LEFT, RIGHT, WIDTH, CENTER_X,

  // Y Axis
  TOP, BOTTOM, HEIGHT, CENTER_Y
}

const nameToProperty = {
  "left":     Property.LEFT,
  "right":    Property.RIGHT,
  "width":    Property.WIDTH,
  "center-x": Property.CENTER_X,
  "top":      Property.TOP,
  "bottom":   Property.BOTTOM,
  "height":   Property.HEIGHT,
  "center-y": Property.CENTER_Y
};

const enum Axis { X, Y, NONE }
const enum XDependency { LEFT_AND_WIDTH, LEFT, WIDTH, NONE }
const enum YDependency { TOP_AND_HEIGHT, TOP, HEIGHT, NONE }

interface RectPosition {
  left:   number;
  top:    number;
  width:  number;
  height: number;
}

abstract class AbstractRect implements Rect {

  private expressions: { [propertyName: string]: string; } = {};

  // the dependencies are the rects properties that are
  // reported to the constaint system when requested
  private xAxisDependencies = XDependency.LEFT_AND_WIDTH;
  private yAxisDependencies = YDependency.TOP_AND_HEIGHT;

  protected constrained = [] as Property[];
  protected isDebugEnabled = false;

  // these variables represent the element's propeties
  // inside the constaint system
  private left:   Constraints.Variable;
  private width:  Constraints.Variable;
  private top:    Constraints.Variable;
  private height: Constraints.Variable;

  // current Rect position
  private currentPosition: RectPosition;

  constructor(
    protected system: Constraints.System,
    protected id:     string
  ) {

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

  /**
   * Constrain a property name to equal the expression.
   * There can only be two constraints per axis.
   */
  constrain(propertyName: string, expression: string): void {
    try {

      let property = this.getPropertyByName(propertyName);
      this.assertIsNotConstrained(propertyName);

      switch (this.getPropertyAxis(property)) {
        case Axis.X:
          this.constrainXProperty(property);
          break;
        case Axis.Y:
          this.contrainYProperty(property);
          break;
        default:
          this.constrained.push(property);
      }

      this.expressions[propertyName] = expression;
      this.system.set(`${this.id}.${propertyName}`, expression.toString());

      if (this.isDebugEnabled) {
        console.debug(`(${this.id}) constrain ${propertyName} = "${expression}"`);
      }

    } catch (e) {
      throw new Error(this.createErrorMessage(propertyName, expression, e));
    }
  }

  /**
   * Set the Rect's current position.
   */
  abstract setPosition(rect: RectPosition): void;

  /**
   * Get the Rect's current position.
   */
  abstract getPosition(): RectPosition;

  /**
   * Update the rect using the values in the constraint system
   */
  updateRect(): void {
    let position = {
      left:   this.left.getValue(),
      top:    this.top.getValue(),
      width:  this.width.getValue(),
      height: this.height.getValue()
    };
    if (this.isPositionDifferent(position)) {
      this.setPosition(position);
      this.currentPosition = position;
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

    let position = this.getPosition();

    // x axis
    switch (this.xAxisDependencies) {
      case XDependency.LEFT_AND_WIDTH:
        this.left.assignValue(position.left);
        this.width.assignValue(position.width);
        break;
      case XDependency.LEFT:
        this.left.assignValue(position.left);
        break;
      case XDependency.WIDTH:
        this.width.assignValue(position.width);
        break;
    }

    // y axis
    switch (this.yAxisDependencies) {
      case YDependency.TOP_AND_HEIGHT:
        this.top.assignValue(position.top);
        this.height.assignValue(position.height);
        break;
      case YDependency.TOP:
        this.top.assignValue(position.top);
        break;
      case YDependency.HEIGHT:
        this.height.assignValue(position.height);
        break;
    }
  }

  /**
   * Destroy the Rect and all its variables.
   */
  destroy(): void {
    let system = this.system;
    system.destroyVariable(this.top);
    system.destroyVariable(this.height);
    system.destroyVariable(this.left);
    system.destroyVariable(this.top);
  }

  private isPositionDifferent(position: RectPosition): boolean {
    let current = this.currentPosition;
    return !current
        || position.width !== current.width
        || position.height !== current.height
        || position.left !== current.left
        || position.top !== current.top;
  }

  private constrainXProperty(property: Property): void {
    let isWidth = property === Property.WIDTH;
    switch (this.xAxisDependencies) {
      case XDependency.LEFT_AND_WIDTH:
        this.xAxisDependencies = isWidth ? XDependency.LEFT : XDependency.WIDTH;
        this.constrained.push(isWidth ? Property.WIDTH : Property.LEFT);
        break;
      case XDependency.LEFT:
        this.xAxisDependencies = XDependency.NONE;
        this.constrained.push(Property.LEFT);
        break;
      case XDependency.WIDTH:
        this.xAxisDependencies = XDependency.NONE;
        this.constrained.push(Property.WIDTH);
        break;
      default:
          throw new Error(`the x axis already has 2 constraints`);
    }
  }

  private contrainYProperty(property: Property): void {
    let isHeight = property === Property.HEIGHT;
    switch (this.yAxisDependencies) {
      case YDependency.TOP_AND_HEIGHT:
        this.yAxisDependencies = isHeight ? YDependency.TOP : YDependency.HEIGHT;
        this.constrained.push(isHeight ? Property.HEIGHT : Property.TOP);
        break;
      case YDependency.TOP:
        this.constrained.push(Property.TOP);
        this.yAxisDependencies = YDependency.NONE;
        break;
      case YDependency.HEIGHT:
        this.constrained.push(Property.HEIGHT);
        this.yAxisDependencies = YDependency.NONE;
        break;
      default:
          throw new Error(`the y axis already has 2 constraints`);
    }
  }

  private getPropertyAxis(property: Property): Axis {
    switch (property) {
      case Property.LEFT:
      case Property.WIDTH:
      case Property.RIGHT:
      case Property.CENTER_X:
        return Axis.X;
      case Property.TOP:
      case Property.HEIGHT:
      case Property.BOTTOM:
      case Property.CENTER_Y:
        return Axis.Y;
      default:
        return Axis.NONE;
    }
  }

  private assertIsNotConstrained(propertyName: string): void {
    if (this.expressions.hasOwnProperty(propertyName)) {
      throw new Error(`it's already set to (${this.expressions[propertyName]})`);
    }
  }

  private getPropertyByName(name: string): Property {
    if (!nameToProperty.hasOwnProperty(name)) {
      throw new Error(`"${name}" is not a supported property`);
    }
    return nameToProperty[name];
  }

  private createErrorMessage(propertyName: string, expression: string, error: any): string {
    let reason = error instanceof Error ? error.message : error.toString();
    let description = `${this.id}.${propertyName}="${expression}"`;
    let expressions = Object.keys(this.expressions).map(propertyName => {
      return `\t${this.id}.${propertyName} = ${this.expressions[propertyName]}`
    }).join("\n");
    return `cannot set ${description} because ${reason}\n\nConstraints:\n\n${expressions}`;
  }

}
