
class ElementManager extends RectManager {

  constructor(
    system: Constraints.System,

    private element:   HTMLElement,
    private container: HTMLElement
  ) {
    super(system, element.id);
  }

  getPosition(): RectPosition {
    return this.element.getBoundingClientRect();
  }

  updateRect(): void {
    let style = this.element.style;
    for (let property of this.constrained) {
      switch (property) {
        case Property.TOP:
          this.setStyle("top", this.top);
          break;
        case Property.HEIGHT:
          this.setStyle("height", this.height);
          break;
        case Property.LEFT:
          this.setStyle("left", this.left);
          break;
        case Property.WIDTH:
          this.setStyle("width", this.width);
          break;
      }
    }
  }

  private setStyle(name: string, variable: Constraints.Variable): void {
    let pixels = `${variable.getValue()}px`;
    if (this.isDebugEnabled) {
      console.debug(`(${this.id}) setting ${name} = ${pixels}`);
    }
    this.element.style[name] = pixels;
  }

}
