import { Subscriber } from './subscriber';
import { ISpecifiedListener } from './types';

export class Binder {
  constructor(
    private pusherSubscriber: Subscriber,
    private eventName: string,
    private listener: typeof ISpecifiedListener
  ) {}

  public emit(data) {
    this.listener(data);
  }

  public unbind() {
    const eventListeners = this.pusherSubscriber._binders[this.eventName];
    if (Array.isArray(eventListeners) && eventListeners.length > 0) {
      const index = eventListeners.findIndex((v) => v === this);
      eventListeners.splice(index, 1);
    }
  }
}
