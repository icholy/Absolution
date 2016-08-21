
class LayoutManager {

  private managers = [] as ElementManager[];
  private system: System;

  notifyElementChanged(): void {
    this.system.clear();
    for (let manager of this.managers) {
      manager.updateSystem();
    }
    for (let manager of this.managers) {
      manager.updateElement();
    }
  }

  register(m: ElementManager): void {
    this.managers.push(m);
  }

}
