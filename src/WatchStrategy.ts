
module Robin {

  export interface WatchStrategy {
    destroy(): void;
  }

  export class MutationObserverStrategy implements WatchStrategy {

    private observer: MutationObserver;

    constructor(rect: ElementRect) {
      let updateSystem = rect.updateSystemPosition.bind(rect);
      this.observer = new MutationObserver(updateSystem);
      this.observer.observe(rect.element, {
        attributes:    true,
        characterData: true,
        childList:     true
      });
    }

    destroy(): void {
      this.observer.disconnect();
    }
  }

}
