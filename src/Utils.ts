
interface RectPosition {
  left:   number;
  top:    number;
  width:  number;
  height: number;
}

class Utils {

  /**
   * Generate GUID
   *
   * http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
   */
  static guid(): string {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
  }

  static getViewportRectPosition(): RectPosition {

    let body = document.body;
    let docElem = document.documentElement;

    let scrollTop = window.pageYOffset || (docElem && docElem.scrollTop) || body.scrollTop;
    let scrollLeft = window.pageXOffset || (docElem && docElem.scrollLeft) || body.scrollLeft;

    let clientTop = (docElem && docElem.clientTop) || body.clientTop || 0;
    let clientLeft = (docElem && docElem.clientLeft) || body.clientLeft || 0;

    let width = window.innerWidth || (docElem && docElem.clientWidth) || body.clientHeight;
    let height = window.innerHeight || (docElem && docElem.clientHeight) || body.clientHeight;

    return {
      top:    scrollTop - clientTop,
      left:   scrollLeft - clientLeft,
      width:  width,
      height: height
    };
  }

  /**
   * Get an Element's absolute position
   *
   * http://javascript.info/tutorial/coordinates#the-right-way-elem-getboundingclientrect
   */
  static getRectPosition(element: HTMLElement): RectPosition {
    let viewport = Utils.getViewportRectPosition();
    let bounds = element.getBoundingClientRect();
    return {
      top:    bounds.top + viewport.top,
      left:   bounds.left + viewport.left,
      width:  bounds.width,
      height: bounds.height
    };
  }

}
