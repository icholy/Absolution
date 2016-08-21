
class LayoutManager {

  private managers = [] as ElementManager[];
  private isBusy = false;

  constructor(
    private system: System
  ) {}

  register(m: ElementManager): void {
    this.managers.push(m);
  }

  elementChanged(): void {
    if (this.isBusy) {
      return;
    }
    this.isBusy = true;
    this.updateLayout();
    this.isBusy = false;
  }

  private updateLayout(): void {
    this.system.clear();
    for (let manager of this.managers) {
      manager.updateSystem();
    }
    for (let manager of this.managers) {
      manager.updateElement();
    }
  }

}
