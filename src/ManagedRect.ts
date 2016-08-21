module Absolution {

  /**
   * Rect configuration options.
   */
  export interface RectOptions {
    id:        string;
    container: string;
    watcher:   string;
    rules:     Rule[];
    context?:  Context;
  }

  /**
   * A managed rect is a rect who's properties can be constrained.
   */
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

    // True if the rect already requested to be updated
    // after the system is solved
    private isEnqueued = false;

    constructor(
      manager:  Manager,
      options: RectOptions
    ) {
      super(manager, options.id, options.container);

      for (let rule of options.rules) {
        this.constrain(rule, options.context);
      }

      if (options.watcher) {
        let watcher = this.makeWatcher(options.watcher);
        this.watchers.push(watcher);
      }

      // if one of the variables changes, request the manager to update the
      // rect after the system is finished solving itself.
      let enqueue = () => {
        if (!this.isEnqueued) {
          this.isEnqueued = true;
          manager.enqueueRect(this);
        }
      };
      this.width.onChange(enqueue);
      this.left.onChange(enqueue);
      this.top.onChange(enqueue);
      this.height.onChange(enqueue);
    }

    /**
     * Make a watcher for the rect
     */
    makeWatcher(name: string): Watcher {
      return new NullWatcher();
    }

    /**
     * Update the rect's position.
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
        throw this.constraintError(propertyName, expression, e);
      }
    }

    /**
     * Update the rect using the values in the constraint system
     */
    updateRectPosition(): void {

      this.isEnqueued = false;

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
        this.manager.update();
      }
    }

    /**
     * Destroy the Rect and all its variables.
     */
    destroy(): void {
      super.destroy();
      for (let watcher of this.watchers) {
        watcher.destroy();
      }
    }

    /**
     * Throws an exception if the specified property has already been constrained.
     */
    private assertIsNotConstrained(propertyName: string): void {
      if (propertyName in this.expressions) {
        throw new Error(`it's already set to (${this.expressions[propertyName]})`);
      }
    }

    /**
     * Convert a property name to it's enumerated value.
     */
    private getPropertyByName(name: string): Property {
      if (name in nameToProperty) {
        return nameToProperty[name];
      }
      throw new Error(`"${name}" is not a supported property`);
    }

    /**
     * Format an Error caused by an invalid constraint.
     */ 
    private constraintError(propertyName: string, expression: string, error: any): Error {
      let reason = error instanceof Error ? error.message : error.toString();
      let description = `${this.id}.${propertyName}="${expression}"`;
      let expressions = Object.keys(this.expressions).map(propertyName => {
        return `\t${this.id}.${propertyName} = ${this.expressions[propertyName]}`;
      }).join("\n");
      return new Error(
          `cannot set ${description} because ${reason}\n\nConstraints:\n\n${expressions}\n\n${error.stack}`);
    }

  }

}
