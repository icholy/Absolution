
module Absolution {

  /**
   * A watcher is responsible for triggering an update
   * when an element's properties change.
   */
  export interface Watcher {
    destroy(): void;
  }

  export class MutationObserverWatcher implements Watcher {

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

  export class NullWatcher implements Watcher {
    destroy(): void {
      // do nothing
    }
  }

}
