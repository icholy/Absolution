module uzi {

  /**
   * A base class for all rects types.
   */
  export abstract class Rect {

    protected system: System;
    private relationships: RelationshipGroup;

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
      protected id:         string,
      protected container?: string
    ) {

      let system = engine.getSystem();
      this.system = system;

      let relationships = new RelationshipGroup(system);
      this.relationships = relationships;

      // x axis
      relationships.subtract(`${id}.width`, `${id}.right`, `${id}.left`);
      relationships.divide(`${id}_tmp1`, `${id}.width`, 2);
      relationships.add(`${id}.center-x`, `${id}.left`, `${id}_tmp1`);

      this.left  = system.getVariable(`${id}.left`);
      this.width = system.getVariable(`${id}.width`);

      // y axis
      relationships.subtract(`${id}.height`, `${id}.bottom`, `${id}.top`);
      relationships.divide(`${id}_tmp2`, `${id}.height`, 2);
      relationships.add(`${id}.center-y`, `${id}.top`, `${id}_tmp2`);

      this.top    = system.getVariable(`${id}.top`);
      this.height = system.getVariable(`${id}.height`);

      // container offsets
      if (container) {
        relationships.subtract(`${id}.left-offset`, `${id}.left`, `${container}.left`);
        relationships.subtract(`${id}.top-offset`, `${id}.top`, `${container}.top`);
      } else {
        relationships.equals(`${id}.left-offset`, `${id}.left`);
        relationships.equals(`${id}.top-offset`, `${id}.top`);
      }

      this.topOffset = system.getVariable(`${id}.top-offset`);
      this.leftOffset = system.getVariable(`${id}.left-offset`);
    }

    /**
     * Destroy the Rect and all its variables.
     */
    destroy(): void {
      this.relationships.destroy();
    }

    getId(): string {
      return this.id;
    }
  }

}
