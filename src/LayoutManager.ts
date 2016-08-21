
class LayoutManager {

  private managers = [] as ElementManager[];

  constructor(
    private system: System
  ) {}

  register(m: ElementManager): void {
    this.managers.push(m);
  }

  updateLayout(): void {
    for (let manager of this.managers) {
      manager.updateSystem();
    }
    this.system.solve();
    for (let manager of this.managers) {
      manager.updateElement();
    }
  }

}
