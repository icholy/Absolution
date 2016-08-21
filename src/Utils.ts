module Absolution {

  export interface RectPosition {
    left:   number;
    top:    number;
    width:  number;
    height: number;
  }

  export class Utils {

    /**
     * Generate GUID
     */
    static guid(): string {
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
      }
      return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
    }

    /**
     * Get the current viewports absolute position.
     */
    static getViewportRectPosition(): RectPosition {
      let el = document.documentElement;
      return {
        top:    el.scrollTop - el.clientTop,
        left:   el.scrollLeft - el.clientLeft,
        width:  el.clientWidth,
        height: el.clientHeight
      };
    }

    /**
     * Get an Element's absolute position
     */
    static getRectPosition(element: HTMLElement): RectPosition {
      let viewport = Utils.getViewportRectPosition();
      let bounds = element.getBoundingClientRect();
      return {
        top:    bounds.top + viewport.top,
        left:   bounds.left + viewport.left,
        width:  bounds.width,
        height: bounds.height
      };
    }

    /**
     * Format an error message from PEG.js
     */
    static formatParserError(e: SyntaxError, input: string): string {
      let loc = e.location.start;
      let message = e.message;
      let line = input.split(/\r\n|\r|\n/)[loc.line-1];
      let arrow = Array(loc.column).join("-") + "^";
      return `Line: ${loc.line} ${message}\n\n${line}\n${arrow}\n`;
    }

    /**
     * Iterate over all elements starting from the supplied root.
     */
    static forEachElement(root: HTMLElement, callback: (el: HTMLElement) => void): void {
      let iterator = document.createNodeIterator(root, NodeFilter.SHOW_ELEMENT);
      let el: HTMLElement;
      while (el = iterator.nextNode() as any) {
        callback(el);
      }
    }

  }

}
