
interface ElementOptions {
  element:    HTMLElement,
  container?: HTMLElement
}

class LayoutManager {

  private managers = [] as ElementManager[];

  constructor(
    private system: System
  ) {}

  register(element: HTMLElement, container?: HTMLElement): ElementManager {
    let m = new ElementManager(this.system, element, container);
    this.managers.push(m);
    return m;
  }

  updateSystem(): void {
    for (let manager of this.managers) {
      manager.updateSystem();
    }
  }

  updateLayout(): void {
    this.system.solve();
    for (let manager of this.managers) {
      manager.updateElement();
    }
  }

}
