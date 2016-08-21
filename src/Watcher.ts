
module Absolution {

  /**
   * A watcher is responsible for triggering an update
   * when an element's properties change.
   *
   * Note: this interface is still under development.
   */
  export interface Watcher {
    destroy(): void;
  }

  /**
   * A watcher that uses a MutationObserver to observe an element
   * for changes.
   */
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
