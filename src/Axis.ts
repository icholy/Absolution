
module Robin {

  export const enum XConstraint { LEFT_AND_WIDTH, LEFT, WIDTH, NONE }
  export const enum YConstraint { TOP_AND_HEIGHT, TOP, HEIGHT, NONE }

  export interface XAxis {
    constraint: XConstraint;
    constrain(property: Property): XAxis;
    constrainedAreDifferent(a: RectPosition, b: RectPosition): boolean;
    independentAreDifferent(a: RectPosition, b: RectPosition): boolean;
    updateSystem(rect: ElementRect, position: RectPosition): void;
    updateRect(rect: ElementRect, position: RectPosition): void;
  }

  export interface YAxis {
    constraint: YConstraint;
    constrain(property: Property): YAxis;
    constrainedAreDifferent(a: RectPosition, b: RectPosition): boolean;
    independentAreDifferent(a: RectPosition, b: RectPosition): boolean;
    updateSystem(rect: ElementRect, position: RectPosition): void;
    updateRect(rect: ElementRect, position: RectPosition): void;
  }

  export let XAxisBoth: XAxis = {

    constraint: XConstraint.LEFT_AND_WIDTH,

    constrain(property: Property): XAxis {
      throw new Error(`the x axis already has 2 constraints`);
    },

    constrainedAreDifferent(a: RectPosition, b: RectPosition): boolean {
      return a.left !== b.left || a.width !== b.width;
    },

    independentAreDifferent(a: RectPosition, b: RectPosition): boolean {
      return false;
    },

    updateSystem(rect: ElementRect, position: RectPosition): void {},

    updateRect(rect: ElementRect, position: RectPosition): void {
      let style = rect.element.style;
      style.left = `${position.left}px`;
      style.width = `${position.width}px`;
    }
  };

  export let XAxisLeft: XAxis = {

    constraint: XConstraint.LEFT,

    constrain(property: Property): XAxis {
      return XAxisBoth;
    },

    constrainedAreDifferent(a: RectPosition, b: RectPosition): boolean {
      return a.left !== b.left;
    },

    independentAreDifferent(a: RectPosition, b: RectPosition): boolean {
      return a.width !== b.width;
    },

    updateSystem(rect: ElementRect, position: RectPosition): void {
      rect.width.assignValue(position.width);
    },

    updateRect(rect: ElementRect, position: RectPosition): void {
      let style = rect.element.style;
      style.left = `${position.left}px`;
    }
  };

  export let XAxisWidth: XAxis = {

    constraint: XConstraint.WIDTH,

    constrain(property: Property): XAxis {
      return XAxisBoth;
    },

    constrainedAreDifferent(a: RectPosition, b: RectPosition): boolean {
      return a.width !== b.width;
    },

    independentAreDifferent(a: RectPosition, b: RectPosition): boolean {
      return a.left !== b.left;
    },

    updateSystem(rect: ElementRect, position: RectPosition): void {
      rect.left.assignValue(position.left);
    },

    updateRect(rect: ElementRect, position: RectPosition): void {
      let style = rect.element.style;
      style.width = `${position.width}px`;
    }
  };

  export let XAxisNone: XAxis = {

    constraint: XConstraint.NONE,

    constrain(property: Property): XAxis {
      if (property === Property.WIDTH) {
        return XAxisWidth;
      } else {
        return XAxisLeft;
      }
    },

    constrainedAreDifferent(a: RectPosition, b: RectPosition): boolean {
      return false;
    },

    independentAreDifferent(a: RectPosition, b: RectPosition): boolean {
      return a.width !== b.width || a.left !== b.left;
    },

    updateSystem(rect: ElementRect, position: RectPosition): void {
      rect.left.assignValue(position.left);
      rect.width.assignValue(position.width);
    },

    updateRect(rect: ElementRect, position: RectPosition): void {}
  };

  export let YAxisBoth: YAxis = {

    constraint: YConstraint.TOP_AND_HEIGHT,

    constrain(property: Property): YAxis {
      throw new Error(`the y axis already has 2 constraints`);
    },

    constrainedAreDifferent(a: RectPosition, b: RectPosition): boolean {
      return a.top !== b.top || a.height !== b.height;
    },

    independentAreDifferent(a: RectPosition, b: RectPosition): boolean {
      return false;
    },

    updateSystem(rect: ElementRect, position: RectPosition): void {},

    updateRect(rect: ElementRect, position: RectPosition): void {
      let style = rect.element.style;
      style.top = `${position.top}px`;
      style.height = `${position.height}px`;
    }
  };

  export let YAxisTop: YAxis = {

    constraint: YConstraint.TOP,

    constrain(property: Property): YAxis {
      return YAxisBoth;
    },

    constrainedAreDifferent(a: RectPosition, b: RectPosition): boolean {
      return a.top !== b.top;
    },

    independentAreDifferent(a: RectPosition, b: RectPosition): boolean {
      return a.height !== b.height;
    },

    updateSystem(rect: ElementRect, position: RectPosition): void {
      rect.height.assignValue(position.height);
    },

    updateRect(rect: ElementRect, position: RectPosition): void {
      let style = rect.element.style;
      style.top = `${position.top}px`;
    }
  };

  export let YAxisHeight: YAxis = {

    constraint: YConstraint.HEIGHT,

    constrain(property: Property): YAxis {
      return YAxisBoth;
    },

    constrainedAreDifferent(a: RectPosition, b: RectPosition): boolean {
      return a.height !== b.height;
    },

    independentAreDifferent(a: RectPosition, b: RectPosition): boolean {
      return a.top !== b.top;
    },

    updateSystem(rect: ElementRect, position: RectPosition): void {
      rect.top.assignValue(position.top);
    },

    updateRect(rect: ElementRect, position: RectPosition): void {
      let style = rect.element.style;
      style.height = `${position.height}px`;
    }
  };

  export let YAxisNone: YAxis = {

    constraint: YConstraint.NONE,

    constrain(property: Property): YAxis {
      if (property === Property.HEIGHT) {
        return YAxisHeight;
      } else {
        return YAxisTop;
      }
    },

    constrainedAreDifferent(a: RectPosition, b: RectPosition): boolean {
      return false;
    },

    independentAreDifferent(a: RectPosition, b: RectPosition): boolean {
      return a.top !== b.top || a.height !== b.height;
    },

    updateSystem(rect: ElementRect, position: RectPosition): void {
      rect.top.assignValue(position.top);
      rect.height.assignValue(position.height);
    },

    updateRect(rect: ElementRect, position: RectPosition): void {}
  }

}
