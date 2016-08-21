module Robin {

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
  const enum XConstraint { LEFT_AND_WIDTH, LEFT, WIDTH, NONE }
  const enum YConstraint { TOP_AND_HEIGHT, TOP, HEIGHT, NONE }

  export class ElementRect extends Rect {

    // used to check if a property has already been constrained.
    // also for generating useful error messages.
    private expressions: { [propertyName: string]: string; } = {};

    // the dependencies are the rects properties that are
    // constained by the system
    private xAxisConstraints = XConstraint.NONE;
    private yAxisConstraints = YConstraint.NONE;

    // current Rect position
    private position: RectPosition;

    // the element that's being managed
    private element: HTMLElement;

    private observer: MutationObserver;

    constructor(
      id:        string,
      element:   HTMLElement,
      container: string,
      layout:    Layout
    ) {
      super(layout, id, container);
      this.element = element;
      this.observer = new MutationObserver(mutations => {
        layout.update();
      });
      this.observer.observe(element, {
        attributes:    true,
        characterData: true,
        childList:     true
      });
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
            this.constrainX(property);
            break;
          case Axis.Y:
            this.constrainY(property);
            break;
        }

        this.system.set(`${this.id}.${propertyName}`, expression.toString());
        this.expressions[propertyName] = expression;

      } catch (e) {
        throw new Error(this.createErrorMessage(propertyName, expression, e));
      }
    }

    private constrainX(property: Property): void {
      switch (this.xAxisConstraints) {
        case XConstraint.NONE:
          if (property === Property.WIDTH) {
            this.xAxisConstraints = XConstraint.WIDTH;
          } else {
            this.xAxisConstraints = XConstraint.LEFT;
          }
          break;
        case XConstraint.LEFT:
        case XConstraint.WIDTH:
          this.xAxisConstraints = XConstraint.LEFT_AND_WIDTH;
          break;
        default:
            throw new Error(`the x axis already has 2 constraints`);
      }
    }

    private constrainY(property: Property): void {
      switch (this.yAxisConstraints) {
        case YConstraint.NONE:
          if (property === Property.HEIGHT) {
            this.yAxisConstraints = YConstraint.HEIGHT;
          } else {
            this.yAxisConstraints = YConstraint.TOP;
          }
          break;
        case YConstraint.TOP:
          this.yAxisConstraints = YConstraint.TOP_AND_HEIGHT;
          break;
        case YConstraint.HEIGHT:
          this.yAxisConstraints = YConstraint.TOP_AND_HEIGHT;
          break;
        default:
            throw new Error(`the y axis already has 2 constraints`);
      }
    }

    /**
     * Set the Rect's current position.
     */
    setRectPosition(rect: RectPosition): void {
      let style = this.element.style;
      let positionChanged = false;
      let left  = 0;
      let top = 0;

      switch (this.xAxisConstraints) {
        case XConstraint.LEFT:
          positionChanged = true;
          left = rect.left;
          break;
        case XConstraint.WIDTH:
          style.width = `${rect.width}px`;
          break;
        case XConstraint.LEFT_AND_WIDTH:
          positionChanged = true;
          left = rect.left;
          style.width = `${rect.width}px`;
          break;
      }

      switch (this.yAxisConstraints) {
        case YConstraint.TOP:
          positionChanged = true;
          top = rect.top;
          break;
        case YConstraint.HEIGHT:
          style.height = `${rect.height}px`;
          break;
        case YConstraint.TOP_AND_HEIGHT:
          positionChanged = true;
          top = rect.top;
          style.height = `${rect.height}px`;
          break;
      }

      if (positionChanged) {
        style.transform = `translate(${left}px, ${top}px)`;
        style.left = "0px";
        style.top = "0px";
      }
    }

    /**
     * Update the rect using the values in the constraint system
     */
    updateRect(): void {
      let position = {
        left:   this.leftOffset.getValue(),
        top:    this.topOffset.getValue(),
        width:  this.width.getValue(),
        height: this.height.getValue()
      };
      if (this.isConstrainedPositionDifferent(position)) {
        this.setRectPosition(position);
        this.position = position;
      }
    }

    private isConstrainedPositionDifferent(position: RectPosition): boolean {
      return !this.position
          || this.isConstrainedXPositionDifferent(position)
          || this.isConstrainedYPositionDifferent(position);
    }

    private isConstrainedXPositionDifferent(position: RectPosition): boolean {
      let current = this.position;
      switch (this.xAxisConstraints) {
        case XConstraint.LEFT_AND_WIDTH:
          return current.left !== position.left
              || current.width !== position.width;
        case XConstraint.LEFT:
          return current.left !== position.left;
        case XConstraint.WIDTH:
          return current.width !== position.width;
        default:
          return false;
      }
    }

    private isConstrainedYPositionDifferent(position: RectPosition): boolean {
      let current = this.position;
      switch (this.yAxisConstraints) {
        case YConstraint.TOP_AND_HEIGHT:
          return current.top !== position.top
              || current.left !== position.left;
        case YConstraint.TOP:
          return current.top !== position.top;
        case YConstraint.HEIGHT:
          return current.height !== position.height;
        default:
          return false;
      }
    }

    private isIndependentPositionDifferent(position: RectPosition): boolean {

      // if both axis are completely constrained, we don't need the element's position
      if (
        this.xAxisConstraints === XConstraint.LEFT_AND_WIDTH &&
        this.yAxisConstraints === YConstraint.TOP_AND_HEIGHT
      ) {
        return false;
      }

      return !this.position
          || this.isConstrainedXPositionDifferent(position)
          || this.isConstrainedYPositionDifferent(position);
    }

    private isIndependentXPositionDifferent(position: RectPosition): boolean {
      let current = this.position;
      switch (this.xAxisConstraints) {
        case XConstraint.NONE:
          return current.left !== position.left
              || current.width !== position.width;
        case XConstraint.WIDTH:
          return current.left !== position.left;
        case XConstraint.LEFT:
          return current.width !== position.width;
        default:
          return false;
      }
    }

    private isIndependentYPositionDifferent(position: RectPosition): boolean {
      let current = this.position;
      switch (this.yAxisConstraints) {
        case YConstraint.NONE:
          return current.top !== position.top
              || current.left !== position.left;
        case YConstraint.HEIGHT:
          return current.top !== position.top;
        case YConstraint.TOP:
          return current.height !== position.height;
        default:
          return false;
      }
    }

    updateSystem(): void {
      let position = Utils.getRectPosition(this.element);
      if (this.isIndependentPositionDifferent(position)) {
        this.setSystemPosition(position);
      }
    }

    /**
     * Update the constaint system using the elements properties.
     */
    setSystemPosition(position: RectPosition): void {

      // x axis
      switch (this.xAxisConstraints) {
        case XConstraint.NONE:
          this.left.assignValue(position.left);
          this.width.assignValue(position.width);
          break;
        case XConstraint.WIDTH:
          this.left.assignValue(position.left);
          break;
        case XConstraint.LEFT:
          this.width.assignValue(position.width);
          break;
      }

      // y axis
      switch (this.yAxisConstraints) {
        case YConstraint.NONE:
          this.top.assignValue(position.top);
          this.height.assignValue(position.height);
          break;
        case YConstraint.HEIGHT:
          this.top.assignValue(position.top);
          break;
        case YConstraint.TOP:
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
      system.destroyVariable(this.topOffset);
      system.destroyVariable(this.height);
      system.destroyVariable(this.left);
      system.destroyVariable(this.leftOffset);
      system.destroyVariable(this.width);
      this.observer.disconnect();
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

}
