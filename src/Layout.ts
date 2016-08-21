
class Layout {

  system = new Constraints.System();
  rects = [] as Rect[];

  constructor(root: HTMLElement) {

    let iterator = document.createNodeIterator(root, NodeFilter.SHOW_ELEMENT);

    this.rects.push(new DocumentRect(this.system));

    let el: HTMLElement;
    while (el = iterator.nextNode() as any) {
      this.handleNewElement(el);
    }
  }

  private handleNewElement(el: HTMLElement): void {

    const attributeMap = {
      "r-id":        "id",
      "r-left":      "left",
      "r-right":     "right",
      "r-top":       "top",
      "r-bottom":    "bottom",
      "r-width":     "width",
      "r-height":    "height",
      "r-center-x":  "center-x",
      "r-center-y":  "center-y",
      "r-register":  "register",
      "r-container": "container",
      "r-center-in": "center-in",

      "data-r-id":        "id",
      "data-r-left":      "left",
      "data-r-right":     "right",
      "data-r-top":       "top",
      "data-r-bottom":    "bottom",
      "data-r-width":     "width",
      "data-r-height":    "height",
      "data-r-center-x":  "center-x",
      "data-r-center-y":  "center-y",
      "data-r-register":  "register",
      "data-r-container": "container",
      "data-r-center-in": "center-in"
    };

      let isRegistered = false;
      let rect: ElementRect = null;

      for (let i = 0; i < el.attributes.length; i++) {
        let attr = el.attributes.item(i);
        if (!attributeMap.hasOwnProperty(attr.name)) {
          continue;
        }
        if (!isRegistered) {
          let id = this.getAttribute(el, "id");
          if (!id) {
            id = el.id ? el.id : Utils.guid();
          }
          let container = this.getAttribute(el, "contaner");
          if (!container) {
            container = "document";
          }
          rect = new ElementRect(id, el, container, this.system);
          this.rects.push(rect);
          isRegistered = true;
        }
        let property = attributeMap[attr.name];
        switch (property) {
          case "center-in":
            let parentId = attr.textContent;
            rect.constrain("center-x", `${parentId}.center-x`);
            rect.constrain("center-y", `${parentId}.center-y`);
            break;
          case "register":
          case "container":
          case "id":
            break;
          default:
            rect.constrain(property, attr.textContent);
        }
      }
  }

  private getAttribute(element: HTMLElement, name: string): string {
    if (element.hasAttribute(`r-${name}`)) {
      return element.getAttribute(`r-${name}`);
    }
    if (element.hasAttribute(`r-data-${name}`)) {
      return element.getAttribute(`r-data-${name}`);
    }
    return null;
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

  /**
   * Assign a value and update the system.
   */
  assign(name: string, value: number): void {
    this.system.assign(name, value);
    this.update();
  }

}
