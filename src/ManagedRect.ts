module Absolution {

  export interface RectOptions {
    id:        string;
    container: string;
    watcher:   string;
    rules:     Rule[];
    context?:  Context;
  }

  export class ManagedRect extends Rect {

    // used to check if a property has already been constrained.
    // also for generating useful error messages.
    private expressions: { [propertyName: string]: string; } = {};

    // the axis represent the constrained properties of the 
    // element.
    private xAxis = XAxisNone;
    private yAxis = YAxisNone;

    // current Rect position
    private position: RectPosition;

    // list of watchers to be cleaned up
    // when the rect is destroyed
    private watchers: Watcher[] = [];

    constructor(
      layout:  Layout,
      options: RectOptions
    ) {
      super(layout, options.id, options.container);

      for (let rule of options.rules) {
        this.constrain(rule, options.context);
      }

      if (options.watcher) {
        let watcher = this.makeWatcher(options.watcher);
        this.watchers.push(watcher);
      }

      let updateRect = this.updateRectPosition.bind(this);
      this.width.onChange(updateRect);
      this.left.onChange(updateRect);
      this.top.onChange(updateRect);
      this.height.onChange(updateRect);
    }

    /**
     * Make a watcher for the rect
     */
    makeWatcher(name: string): Watcher {
      return new NullWatcher();
    }

    /**
     * Update the rect's position
     */
    applyPositionUpdate(update: RectPositionUpdate): void {}

    /**
     * Get the rect's position.
     */
    getRectPosition(): RectPosition {
      return {
        left:   null,
        top:    null,
        width:  null,
        height: null
      };
    }

    /**
     * Initialize the rect
     */
    protected initialize(): void {
      this.updateSystemPosition();
    }

    /**
     * Constrain a property name to equal the expression.
     * There can only be two constraints per axis.
     */
    protected constrain(rule: Rule, ctx: Context): void {

      let propertyName = rule.target;
      let expression = rule.expr.text;
      let node = rule.expr;

      try {

        let property = this.getPropertyByName(propertyName);
        this.assertIsNotConstrained(propertyName);

        switch (propertyToAxis[property]) {
          case Axis.X:
            this.xAxis = this.xAxis.constrain(property);
            break;
          case Axis.Y:
            this.yAxis = this.yAxis.constrain(property);
            break;
        }

        this.system.setNode(`${this.id}.${propertyName}`, node, ctx);
        this.expressions[propertyName] = expression;

      } catch (e) {
        throw new Error(this.createErrorMessage(propertyName, expression, e));
      }
    }

    /**
     * Update the rect using the values in the constraint system
     */
    private updateRectPosition(): void {
      let update: RectPositionUpdate = {

        // these flags are set by the axis if the rect
        // should use them to update itself
        hasAny:    false,
        hasOffset: false,
        hasLeft:   false,
        hasTop:    false,
        hasWidth:  false,
        hasHeight: false,

        left:   this.leftOffset.getValue(),
        top:    this.topOffset.getValue(),
        width:  this.width.getValue(),
        height: this.height.getValue()
      };
      if (this.isConstrainedPositionDifferent(update)) {
        this.xAxis.updateRect(update);
        this.yAxis.updateRect(update);
        if (update.hasAny) {
          this.applyPositionUpdate(update);
        }
        this.position = update;
      }
    }

    /**
     * Compare the position with the rect's current position. Check if
     * any of the constrained properties are different.
     */
    private isConstrainedPositionDifferent(position: RectPosition): boolean {
      return !this.position
          || this.xAxis.constrainedAreDifferent(this.position, position)
          || this.yAxis.constrainedAreDifferent(this.position, position);
    }

    /**
     * Compare the position with the rect's current position. Check if
     * any of the independent (unconstrained) properties are different.
     */
    private isIndependentPositionDifferent(position: RectPosition): boolean {
      return !this.position
          || this.xAxis.independentAreDifferent(this.position, position)
          || this.yAxis.independentAreDifferent(this.position, position);
    }

    /**
     * If the element's independent (unconstrained) properties
     * have changed, use them to update the system.
     */
    updateSystemPosition(): void {
      let position = this.getRectPosition();
      if (this.isIndependentPositionDifferent(position)) {
        this.position = position;
        this.xAxis.updateSystem(this, position);
        this.yAxis.updateSystem(this, position);
        this.layout.update();
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
      for (let watcher of this.watchers) {
        watcher.destroy();
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
        return `\t${this.id}.${propertyName} = ${this.expressions[propertyName]}`;
      }).join("\n");
      return `cannot set ${description} because ${reason}\n\nConstraints:\n\n${expressions}\n\n${error.stack}`;
    }

  }

}
