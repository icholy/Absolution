module uzi {

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
      protected engine:     Engine,
      protected ctx:        Context,
      protected id:         string,
      protected container?: string
    ) {

      let system = engine.getSystem();
      this.system = system;

      // x axis
      ctx.link(system.subtract(`${id}.width`, `${id}.right`, `${id}.left`));
      ctx.link(system.divide(`${id}_tmp1`, `${id}.width`, 2));
      ctx.link(system.add(`${id}.center-x`, `${id}.left`, `${id}_tmp1`));

      this.left  = system.getVariable(`${id}.left`);
      this.width = system.getVariable(`${id}.width`);

      // y axis
      ctx.link(system.subtract(`${id}.height`, `${id}.bottom`, `${id}.top`));
      ctx.link(system.divide(`${id}_tmp2`, `${id}.height`, 2));
      ctx.link(system.add(`${id}.center-y`, `${id}.top`, `${id}_tmp2`));

      this.top    = system.getVariable(`${id}.top`);
      this.height = system.getVariable(`${id}.height`);

      // container offsets
      if (container) {
        ctx.link(system.subtract(`${id}.left-offset`, `${id}.left`, `${container}.left`));
        ctx.link(system.subtract(`${id}.top-offset`, `${id}.top`, `${container}.top`));
      } else {
        ctx.link(system.equals(`${id}.left-offset`, `${id}.left`));
        ctx.link(system.equals(`${id}.top-offset`, `${id}.top`));
      }

      this.topOffset = system.getVariable(`${id}.top-offset`);
      this.leftOffset = system.getVariable(`${id}.left-offset`);
    }

    /**
     * Destroy the Rect.
     */
    destroy(): void {
      for (let r of this.ctx.getLinked()) {
        this.system.destroyRelationship(r);
      }
    }

    getId(): string {
      return this.id;
    }
  }

}
