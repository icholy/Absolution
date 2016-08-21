
interface RectPosition {
  left:   number;
  top:    number;
  width:  number;
  height: number;
}

class Utils {

  static guid(): string {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
  }

  /**
   * http://javascript.info/tutorial/coordinates#the-right-way-elem-getboundingclientrect
   */
  static getRectPosition(element: HTMLElement): RectPosition {

    let bounds = element.getBoundingClientRect();

    let body = document.body;
    let docElem = document.documentElement;

    let scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
    let scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;

    let clientTop = docElem.clientTop || body.clientTop || 0;
    let clientLeft = docElem.clientLeft || body.clientLeft || 0;

    return {
      top:    bounds.top +  scrollTop - clientTop,
      left:   bounds.left + scrollLeft - clientLeft,
      width:  bounds.width,
      height: bounds.height
    };
  }

}
