
module Robin {

  export const enum Axis { X, Y, NONE }

  export const enum Property {

    // X Axis
    LEFT, RIGHT, WIDTH, CENTER_X,

    // Y Axis
    TOP, BOTTOM, HEIGHT, CENTER_Y
  }

  export const nameToProperty = {
    "left":     Property.LEFT,
    "right":    Property.RIGHT,
    "width":    Property.WIDTH,
    "center-x": Property.CENTER_X,
    "top":      Property.TOP,
    "bottom":   Property.BOTTOM,
    "height":   Property.HEIGHT,
    "center-y": Property.CENTER_Y
  };

  export let propertyToAxis = {} as { [property: any]: Axis; };
  propertyToAxis[Property.BOTTOM]   = Axis.X;
  propertyToAxis[Property.LEFT]     = Axis.X;
  propertyToAxis[Property.WIDTH]    = Axis.X;
  propertyToAxis[Property.RIGHT]    = Axis.X;
  propertyToAxis[Property.CENTER_X] = Axis.X;
  propertyToAxis[Property.TOP]      = Axis.Y;
  propertyToAxis[Property.HEIGHT]   = Axis.Y;
  propertyToAxis[Property.BOTTOM]   = Axis.Y;
  propertyToAxis[Property.CENTER_Y] = Axis.Y;

  export interface XAxis {
    constrain(property: Property): XAxis;
    constrainedAreDifferent(a: RectPosition, b: RectPosition): boolean;
    independentAreDifferent(a: RectPosition, b: RectPosition): boolean;
    updateSystem(rect: ElementRect, position: RectPosition): void;
    updateRect(rect: ElementRect, position: RectPosition): void;
  }

  export interface YAxis {
    constrain(property: Property): YAxis;
    constrainedAreDifferent(a: RectPosition, b: RectPosition): boolean;
    independentAreDifferent(a: RectPosition, b: RectPosition): boolean;
    updateSystem(rect: ElementRect, position: RectPosition): void;
    updateRect(rect: ElementRect, position: RectPosition): void;
  }

  export let XAxisBoth: XAxis = {

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
