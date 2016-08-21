module Robin {

  export const enum Property {

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

  export class ElementRect extends Rect {

    // used to check if a property has already been constrained.
    // also for generating useful error messages.
    private expressions: { [propertyName: string]: string; } = {};

    // the dependencies are the rects properties that are
    // constained by the system
    private xAxis = XAxisNone;
    private yAxis = YAxisNone;

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
        this.updateSystemPosition();
      });
      this.observer.observe(element, {
        attributes:    true,
        characterData: true,
        childList:     true
      });

      let listener = () => this.updateRectPosition();
      this.width.addListener(listener);
      this.left.addListener(listener);
      this.top.addListener(listener);
      this.height.addListener(listener);
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
            this.xAxis = this.xAxis.constrain(property);
            break;
          case Axis.Y:
            this.yAxis = this.yAxis.constrain(property);
            break;
        }

        this.system.set(`${this.id}.${propertyName}`, expression.toString());
        this.expressions[propertyName] = expression;

      } catch (e) {
        throw new Error(this.createErrorMessage(propertyName, expression, e));
      }
    }

    /**
     * Update the rect using the values in the constraint system
     */
    private updateRectPosition(): void {
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

    /**
     * Set the Rect's current position.
     */
    private setRectPosition(rect: RectPosition): void {
      let style = this.element.style;
      let positionChanged = false;
      let left  = 0;
      let top = 0;

      switch (this.xAxis.constraint) {
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

      switch (this.yAxis.constraint) {
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

    private isConstrainedPositionDifferent(position: RectPosition): boolean {
      return !this.position
          || this.xAxis.constrainedAreDifferent(this.position, position)
          || this.yAxis.constrainedAreDifferent(this.position, position);
    }

    private isIndependentPositionDifferent(position: RectPosition): boolean {
      return !this.position
          || this.xAxis.independentAreDifferent(this.position, position)
          || this.yAxis.independentAreDifferent(this.position, position);
    }

    updateSystemPosition(): void {
      let position = Utils.getRectPosition(this.element);
      if (this.isIndependentPositionDifferent(position)) {
        this.position = position;
        this.setSystemPosition(position);
        this.layout.update();
      }
    }

    /**
     * Update the constaint system using the element position.
     */
    setSystemPosition(position: RectPosition): void {

      // x axis
      switch (this.xAxis.constraint) {
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
      switch (this.yAxis.constraint) {
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
