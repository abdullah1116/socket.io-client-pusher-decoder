import { Socket, io as socketIoClient } from 'socket.io-client';
import { Subscriber } from './subscriber';
import { IListener } from './types';

export class Pusher {
  public _socket: Socket;
  public _subscribers: Record<
    string,
    { subscriber: Subscriber; listener: typeof IListener }
  > = {};

  constructor(url: string, options?: any) {
    this._socket = socketIoClient(url, {
      auth: (callback) =>
        callback({
          ...(options || {}),
          subscribers: Object.keys(this._subscribers),
        }),
    });
  }

  /**
   * Subscribe specified subscribers.
   * @param subscriberName Event name
   */
  public subscribe(subscriberName: string) {
    return (
      this._subscribers[subscriberName] || this.initSubscriber(subscriberName)
    ).subscriber;
  }

  private initSubscriber(subscriberName) {
    this._subscribers[subscriberName] = {} as any;

    this._subscribers[subscriberName].subscriber = new Subscriber(
      () => this.unSubscribe(subscriberName),
      (listener: typeof IListener) => {
        this._socket.emit('connection_subscribe', subscriberName);

        this._subscribers[subscriberName].listener = listener;
        this._socket.on(subscriberName, (eventName, data) =>
          listener(eventName, data)
        );
      }
    );

    return this._subscribers[subscriberName];
  }

  /**
   * Un-Subscribe specified subscribers.
   * @param subscriberName Event name
   */
  public unSubscribe(subscriberName: string) {
    if (this._subscribers[subscriberName]) {
      this._socket.emit('connection_un_subscribe', subscriberName);

      this._socket.off(
        subscriberName,
        this._subscribers[subscriberName].listener
      );

      delete this._subscribers[subscriberName].subscriber;
      delete this._subscribers[subscriberName];
    }

    return this;
  }

  /**
   * Un-Subscribe all subscribers.
   * !!WARNING!!! This will remove all subscribers
   */
  public unSubscribeAll() {
    Object.keys(this._subscribers).forEach((subscriberName) => {
      this.unSubscribe(subscriberName);
    });

    return this;
  }

  /**
   * Bind to all events of all subscribers.
   * @param subscriberName Subscribers name
   * @param listener Listener
   * @deprecated
   */
  public bind(subscriberName: string, listener: typeof IListener) {
    this._socket.on(subscriberName, listener);

    return this;
  }
}
