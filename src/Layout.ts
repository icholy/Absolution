module Robin {

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
    "r-align-x":   "align-x",
    "r-align-y":   "align-y",
    "r-size":      "size",
    "r-fill":      "fill",
    "r-style":     "style",
    "r-watch":     "watch",

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
    "data-r-center-in": "center-in",
    "data-r-align-x":   "align-x",
    "data-r-align-y":   "align-y",
    "data-r-size":      "size",
    "data-r-fill":      "fill",
    "data-r-style":     "style",
    "data-r-watch":     "watch"
  };

  export class Layout {

    system = new System();
    rects = [] as Rect[];
    digestID = 0;

    private updateIsRequested = false;

    constructor(root: HTMLElement) {

      // add the special rects
      this.rects.push(new ViewportRect(this));
      this.rects.push(new DocumentRect(this));
      this.rects.push(new BodyRect(this));

      // walk the dom and find elements with robin attributes
      let iterator = document.createNodeIterator(root, NodeFilter.SHOW_ELEMENT);
      let el: HTMLElement;
      while (el = iterator.nextNode() as any) {
        this.handleNewElement(el);
      }

      this.update();
    }

    private handleNewElement(el: HTMLElement): void {

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
          let container = this.getAttribute(el, "container");
          if (!container) {
            container = "document";
          }
          rect = new ElementRect(id, el, container, this);
          this.rects.push(rect);
          isRegistered = true;
        }

        this.applyProperty(rect, attributeMap[attr.name], attr.textContent);
      }

      if (isRegistered) {
        rect.initialize();
      }
    }

    private applyProperty(rect: ElementRect, name: string, value: string): void {
      switch (name) {
        case "watch":
          if (value !== "mutation") {
            throw new Error(
              `${rect.getId()}.r-watch value error: "${value}" is not a supported watcher`);
          }
          rect.addWatcher(new MutationObserverWatcher(rect));
          break;
        case "style":
          value.split(";").forEach(attr => {
            attr = attr.trim();
            if (attr === "") {
              return;
            }
            let parts = attr.split(":");
            if (parts.length !== 2) {
              throw new Error(`${rect.getId()}.r-style syntax error: "${attr}"`);
            }
            let [name, value] = parts;
            this.applyProperty(rect, name.trim(), value.trim());
          });
          break;
        case "center-in":
          rect.constrain("center-x", `${value}.center-x`);
          rect.constrain("center-y", `${value}.center-y`);
          break;
        case "align-x":
          rect.constrain("left", `${value}.left`);
          rect.constrain("right", `${value}.right`);
          break;
        case "align-y":
          rect.constrain("top", `${value}.top`);
          rect.constrain("bottom", `${value}.bottom`);
          break;
        case "size":
          rect.constrain("width", `${value}.width`);
          rect.constrain("height", `${value}.height`);
          break;
        case "fill":
          rect.constrain("top", `${value}.top`);
          rect.constrain("bottom", `${value}.bottom`);
          rect.constrain("left", `${value}.left`);
          rect.constrain("right", `${value}.right`);
          break;
        case "register":
        case "container":
        case "id":
          break;
        default:
          rect.constrain(name, value);
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
     * Request an update to occur the on the next
     * animation frame.
     */
    update(): void {
      if (this.updateIsRequested) {
        return;
      }
      this.updateIsRequested = true;
      window.requestAnimationFrame(() => {
        this.updateIsRequested = false;
        this.system.solve(this.digestID++);
      });
    }

    /**
     * Assign a value and update the system.
     */
    assign(name: string, value: number): void {
      this.system.assign(name, value);
      this.update();
    }

    /**
     * Get a rect by id
     */
    getRect(id: string): Rect {
      for (let rect of this.rects) {
        if (rect.getId() === id) {
          return rect;
        }
      }
      return null;
    }

  }

}
