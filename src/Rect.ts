module Absolution {

  /**
   * A base class for all rects types.
   */
  export abstract class Rect {

    protected system: System;

    // these variables represent the rect's properties
    // inside the constaint system
    public left:       Variable;
    public width:      Variable;
    public top:        Variable;
    public height:     Variable;
    public topOffset:  Variable;
    public leftOffset: Variable;

    constructor(
      protected manager:    Manager,
      protected id:         string,
      protected container?: string
    ) {

      let system = this.system = manager.getSystem();

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

      // container offsets
      if (container) {
        system.subtract(`${id}.left-offset`, `${id}.left`, `${container}.left`);
        system.subtract(`${id}.top-offset`, `${id}.top`, `${container}.top`);
      } else {
        system.equals(`${id}.left-offset`, `${id}.left`);
        system.equals(`${id}.top-offset`, `${id}.top`);
      }

      this.topOffset = system.getVariable(`${id}.top-offset`);
      this.leftOffset = system.getVariable(`${id}.left-offset`);
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
    }

    getId(): string {
      return this.id;
    }
  }

}
