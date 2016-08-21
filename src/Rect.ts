module Robin {

  export abstract class Rect {

    protected system: System;

    // these variables represent the rect's propeties
    // inside the constaint system
    protected left:       Variable;
    protected width:      Variable;
    protected top:        Variable;
    protected height:     Variable;
    protected topOffset:  Variable;
    protected leftOffset: Variable;

    constructor(
      protected layout:    Layout,
      protected id:        string,
      protected container: string = null
    ) {

      let system = this.system = layout.system;

      // x axis
      system.subtract(`${id}.width`, `${id}.right`, `${id}.left`);
      system.divide(`${id}_tmp1`, `${id}.width`, 2);
      system.add(`${id}.center-x`, `${id}.left`, `${id}_tmp1`);
      system.subtract(`${id}.left-offset`, `${id}.left`, `${container}.left`);

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

    abstract updateSystem(): void;
    abstract updateRect(): void;

    getId(): string {
      return this.id;
    }
  }

}
