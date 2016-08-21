
interface ElementOptions {
  element:    HTMLElement,
  container?: HTMLElement
}

class Layout {

  system = new Constraints.System();
  rects = [] as Rect[];

  constructor(root: HTMLElement) {

    const attributeMap = {
      "rLeft":    "left",
      "rRight":   "right",
      "rTop":     "top",
      "rBottom":  "bottom",
      "rWidth":   "width",
      "rHeight":  "height",
      "rCenterX": "center-x",
      "rCenterY": "center-y",
      "rCenterIn": "center-in"
      "rRegister": "register"
    };

    let iterator = document.createNodeIterator(root, NodeFilter.SHOW_ELEMENT);
    let el: HTMLElement;

    while (el = iterator.nextNode() as any) {
      let isRegistered = false;
      let rect = null;
      Object.keys(el.dataset).forEach(key => {
        if (!attributeMap.hasOwnProperty(key)) {
          return;
        }
        if (!isRegistered) {
          rect = this.register(el, null);
          isRegistered = true;
        }
        let property = attributeMap[key];
        switch (property) {
          case "center-in":
            let id = attributeMap[key];
            rect.constrain(`center-x`, `${id}.center-x`);
            rect.constrain(`center-y`, `${id}.center-y`);
            break;
          case "register":
            break;
          default:
            rect.constrain(property, el.dataset[key]);
        }
      });
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
