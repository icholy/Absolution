
interface ElementOptions {
  element:    HTMLElement,
  container?: HTMLElement
}

class LayoutManager {

  system = new Constraints.System();
  managers = [] as ElementManager[];

  /**
   * Register an element with the layout
   */
  register(element: HTMLElement, container?: HTMLElement): ElementManager {
    let m = new ElementManager(this.system, element, container);
    this.managers.push(m);
    return m;
  }

  /**
   * Update the system from the element's actual values
   */
  updateSystem(): void {
    for (let manager of this.managers) {
      manager.updateSystem();
    }
  }

  /**
   * Update the elements with the system's value
   */
  updateLayout(): void {
    this.system.solve();
    for (let manager of this.managers) {
      manager.updateElement();
    }
  }

}
