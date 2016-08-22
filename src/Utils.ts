module uzi {

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
        width:  element.offsetWidth,
        height: element.offsetHeight
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
     * Mark the element with the rect id.
     */
    static setRectId(element: HTMLElement, id: string): void {
      element.dataset["uziId"] = id;
    }

    /**
     * Get the rect id from an element.
     */
    static getRectId(element: HTMLElement): string {
      return element.dataset["uziId"];
    }

    /**
     * Iterate over all elements starting from the supplied root.
     */
    static forEachElement(root: HTMLElement, callback: (el: HTMLElement) => void): void {
      let iterator = document.createNodeIterator(root, NodeFilter.SHOW_ELEMENT, null, false);
      let el: HTMLElement;
      while (el = iterator.nextNode() as any) {
        callback(el);
      }
    }

    /**
     * Iterate over all <script> tags who's type is "text/uzi".
     */
    static forEachStyleScriptTag(callback: (el: HTMLScriptElement) => void): void {
      let scriptTags = document.getElementsByTagName("script");
      for (let i = 0; i < scriptTags.length; i++) {
        let scriptTag = scriptTags.item(i);
        if (scriptTag.getAttribute("type") === "text/uzi") {
          callback(scriptTag);
        }
      }
    }

    /**
     * Iterate over all elements matching the supplied selector.
     */
    static forEachSelector(selector: string, callback: (el: HTMLElement) => void): void {
      let elements = document.querySelectorAll(selector)
      for (let i = 0; i < elements.length; i++) {
        callback(elements.item(i) as any);
      }
    }

  }

}
