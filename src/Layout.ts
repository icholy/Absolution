
interface ElementOptions {
  element:    HTMLElement,
  container?: HTMLElement
}

class Layout {

  system = new Constraints.System();
  rects = [] as Rect[];

  constructor(root: HTMLElement) {

    const attributeMap = {
      "r-left":        "left",
      "r-right":       "right",
      "r-top":         "top",
      "r-bottom":      "bottom",
      "r-width":       "width",
      "r-height":      "height",
      "r-center-x":    "center-x",
      "r-center-y":    "center-y",
      "r-center-in":   "center-in",
      "r-register":    "register",
      "r-relative-to": "relative-to"
    };

    let iterator = document.createNodeIterator(root, NodeFilter.SHOW_ELEMENT);
    let el: HTMLElement;

    this.rects.push(new DocumentRect(this.system));

    while (el = iterator.nextNode() as any) {

      let isRegistered = false;
      let rect = null;

      for (let i = 0; i < el.attributes.length; i++) {
        let attr = el.attributes.item(i);
        if (!attributeMap.hasOwnProperty(attr.name)) {
          continue;
        }
        if (!isRegistered) {

          let container = null;
          if (el.hasAttribute("r-relative-to")) {
            let relativeTo = el.getAttribute("r-relative-to")
            container = document.getElementById(relativeTo);
          }

          let id = el.id ? el.id : this.guid();
          rect = new ElementRect(id, this.system, el, container);
          this.rects.push(rect);
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
          case "relative-to":
            break;
          default:
            rect.constrain(property, attr.textContent);
        }
      }
    }
  }

  /**
   * Update the system from the element's actual values
   */
  update(): void {
    for (let r of this.rects) {
      r.updateSystem();
    }
    this.system.solve();
    for (let r of this.rects) {
      r.updateRect();
    }
  }

  private guid(): string {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
  }

}