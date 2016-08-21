
interface ElementOptions {
  element:    HTMLElement,
  container?: HTMLElement
}

class Layout {

  system = new Constraints.System();
  rects = [] as Rect[];

  constructor(root: HTMLElement) {

    const attributeMap = {
      "r-left":      "left",
      "r-right":     "right",
      "r-top":       "top",
      "r-bottom":    "bottom",
      "r-width":     "width",
      "r-height":    "height",
      "r-center-x":  "center-x",
      "r-center-y":  "center-y",
      "r-center-in": "center-in",
      "r-register":  "register",

      "data-r-left":      "left",
      "data-r-right":     "right",
      "data-r-top":       "top",
      "data-r-bottom":    "bottom",
      "data-r-width":     "width",
      "data-r-height":    "height",
      "data-r-center-x":  "center-x",
      "data-r-center-y":  "center-y",
      "data-r-center-in": "center-in",
      "data-r-register":  "register"
    };

    let iterator = document.createNodeIterator(root, NodeFilter.SHOW_ELEMENT);
    let el: HTMLElement;


    while (el = iterator.nextNode() as any) {

      let isRegistered = false;
      let rect = null;

      for (let i = 0; i < el.attributes.length; i++) {
        let attr = el.attributes.item(i);
        if (!attributeMap.hasOwnProperty(attr.name)) {
          continue;
        }
        if (!isRegistered) {
          rect = this.register(el, null);
          isRegistered = true;
        }
        let property = attributeMap[attr.name];
        switch (property) {
          case "center-in":
            let id = attr.textContent;
            rect.constrain(`center-x`, `${id}.center-x`);
            rect.constrain(`center-y`, `${id}.center-y`);
            break;
          case "register":
            break;
          default:
            rect.constrain(property, attr.textContent);
        }
      }
    }
  }

  /**
   * Register an element with the layout
   */
  register(element: HTMLElement, container?: HTMLElement): Rect {
    let r = new ElementRect(this.system, element, container);
    this.rects.push(r);
    return r;
  }

  /**
   * Update the system from the element's actual values
   */
  updateSystem(): void {
    for (let r of this.rects) {
      r.updateSystem();
    }
  }

  /**
   * Update the elements with the system's value
   */
  updateLayout(): void {
    this.system.solve();
    for (let r of this.rects) {
      r.updateRect();
    }
  }

}
