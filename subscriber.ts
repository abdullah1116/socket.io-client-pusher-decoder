import { Binder } from './binder';
import { IListener, ISpecifiedListener } from './types';

export class Subscriber {
  public _binders: Record<string, Binder[]> = {};

  constructor(
    unSubscribe: () => void,
    initListener: (_: typeof IListener) => void
  ) {
    this.unSubscribe = unSubscribe;

    initListener((eventName, data) => {
      if (eventName) {
        if (this._binders[eventName]) {
          this._binders[eventName].forEach((listeners) => {
            listeners.emit(data);
          });
        }
      }
    });
  }

  /**
   * Un-subscribe this subscriber.
   */
  public unSubscribe() {}

  //
  //
  //

  /**
   * Bind to specified event of this subscriber.
   * @param eventName Event name
   * @param listener Listener
   */
  public bind(eventName: string, listener: typeof ISpecifiedListener) {
    if (!this._binders[eventName]) {
      this._binders[eventName] = [];
    }

    this._binders[eventName].push(new Binder(this, eventName, listener));
  }

  /**
   * Un-bind all specified events of this subscriber.
   * @param eventName Event name
   */
  public unBind(eventName: string) {
    const eventListeners = this._binders[eventName];

    if (Array.isArray(eventListeners) && eventListeners.length > 0) {
      eventListeners.forEach((listeners, i) => {
        listeners.unbind();
        eventListeners.splice(i);
      });

      eventListeners.length = 0;
    }

    return this;
  }

  /**
   * Un-bind all events of this subscriber.
   */
  public unBindAll() {
    Object.keys(this._binders).forEach((eventName) => {
      this.unBind(eventName);
    });

    return this;
  }
}
