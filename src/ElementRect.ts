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
  const enum XDependency { LEFT_AND_WIDTH, LEFT, WIDTH, NONE }
  const enum YDependency { TOP_AND_HEIGHT, TOP, HEIGHT, NONE }

  export class ElementRect extends Rect {

    // used to check if a property has already been constrained.
    // also for generating useful error messages.
    private expressions: { [propertyName: string]: string; } = {};

    // the dependencies are the rects properties that are
    // reported to the constaint system when requested
    private xAxisDependencies = XDependency.LEFT_AND_WIDTH;
    private yAxisDependencies = YDependency.TOP_AND_HEIGHT;

    // used to determine which properties from the constrain
    // system should be used to update the element
    private constrained = [] as Property[];

    // current Rect position
    private currentPosition: RectPosition;

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
            property = this.updateXDependency(property);
            break;
          case Axis.Y:
            property = this.updateYDependency(property);
            break;
        }

        this.system.set(`${this.id}.${propertyName}`, expression.toString());
        this.constrained.push(property);
        this.expressions[propertyName] = expression;

      } catch (e) {
        throw new Error(this.createErrorMessage(propertyName, expression, e));
      }
    }

    /**
     * Set the Rect's current position.
     */
    setPosition(rect: RectPosition): void {
      let style = this.element.style;
      let positionChanged = false;
      let left  = 0;
      let top = 0;

      for (let property of this.constrained) {
        switch (property) {
          case Property.TOP:
            positionChanged = true;
            top = rect.top;
            break;
          case Property.LEFT:
            positionChanged = true;
            left = rect.left;
            break;
          case Property.HEIGHT:
            style.height = `${rect.height}px`;
            break;
          case Property.WIDTH:
            style.width = `${rect.width}px`;
            break;
        }
      }

      if (positionChanged) {
        style.transform = `translate(${left}px, ${top}px)`;
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

      let position = Utils.getRectPosition(this.element);

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
      system.destroyVariable(this.topOffset);
      system.destroyVariable(this.height);
      system.destroyVariable(this.left);
      system.destroyVariable(this.leftOffset);
      system.destroyVariable(this.width);
      this.observer.disconnect();
    }

    private isPositionDifferent(position: RectPosition): boolean {
      let current = this.currentPosition;
      return !current
          || position.width !== current.width
          || position.height !== current.height
          || position.left !== current.left
          || position.top !== current.top;
    }

    private updateXDependency(property: Property): Property {
      let isWidth = property === Property.WIDTH;
      switch (this.xAxisDependencies) {
        case XDependency.LEFT_AND_WIDTH:
          this.xAxisDependencies = isWidth ? XDependency.LEFT : XDependency.WIDTH;
          return isWidth ? Property.WIDTH : Property.LEFT;
        case XDependency.LEFT:
          this.xAxisDependencies = XDependency.NONE;
          return Property.LEFT;
        case XDependency.WIDTH:
          this.xAxisDependencies = XDependency.NONE;
          return Property.WIDTH;
        default:
            throw new Error(`the x axis already has 2 constraints`);
      }
    }

    private updateYDependency(property: Property): Property {
      let isHeight = property === Property.HEIGHT;
      switch (this.yAxisDependencies) {
        case YDependency.TOP_AND_HEIGHT:
          this.yAxisDependencies = isHeight ? YDependency.TOP : YDependency.HEIGHT;
          return isHeight ? Property.HEIGHT : Property.TOP;
        case YDependency.TOP:
          this.yAxisDependencies = YDependency.NONE;
          return Property.TOP;
        case YDependency.HEIGHT:
          this.yAxisDependencies = YDependency.NONE;
          return Property.HEIGHT;
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

}
