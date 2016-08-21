
class ElementRect extends AbstractRect {

  constructor(
    id:     string,
    system: Constraints.System,

    private element:   HTMLElement,
    private container: HTMLElement
  ) {
    super(system, id);
  }

  getPosition(): RectPosition {
    let inner = this.element.getBoundingClientRect();
    if (!this.container) {
      return inner;
    }
    let outer = this.container.getBoundingClientRect();
    return {
      left:   inner.left - outer.left,
      top:    inner.top - outer.top,
      width:  inner.width,
      height: inner.height
    };
  }

  setPosition(rect: RectPosition): void {
    let style = this.element.style;
    for (let property of this.constrained) {
      switch (property) {
        case Property.TOP:
          style.top = `${rect.top}px`;
          break;
        case Property.HEIGHT:
          style.height = `${rect.height}px`;
          break;
        case Property.LEFT:
          style.left = `${rect.left}px`;
          break;
        case Property.WIDTH:
          style.width = `${rect.width}px`;
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