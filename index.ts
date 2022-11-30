import { io as Iio, Socket as ISocket } from 'socket.io-client';

class Connection {
  public io: ISocket;

  constructor(io: typeof Iio, uri: string, opts?: any) {
    this.io = io(uri, opts);
  }

  public bind(eventName: string, listener: typeof IListener) {
    return this.io.on(eventName, listener);
  }

  public unbind(eventName: string, listener: typeof IListener) {
    return this.io.off(eventName, listener);
  }
}

export class Pusher {
  public connection: Connection;
  private subscribers: Record<string, Channel> = {};

  constructor(io: typeof Iio, url: string, opts?: any) {
    if (typeof io === undefined) {
      throw 'not initialized';
    }

    this.connection = new Connection(io, url, {
      auth: (cb) => cb(opts),
    });
  }

  /**
   * Subscribe specified channels.
   * @param eventName Event name
   */
  public subscribe(eventName: string) {
    if (this.subscribers[eventName]) {
      return this.subscribers[eventName];
    }

    return (this.subscribers[eventName] = new Channel(this, eventName));
  }

  /**
   * Un-Subscribe specified channels.
   * @param eventName Event name
   */
  public unsubscribe(eventName: string) {
    if (this.subscribers[eventName]) {
      this.subscribers[eventName].unSubscribe();
    }

    return this;
  }

  /**
   * Un-Subscribe all channels.
   * !!WARNING!!! This will remove all subscribers
   */
  public unsubscribe_all() {
    Object.keys(this.subscribers).forEach((eventName) => {
      if (this.subscribers[eventName]) {
        this.subscribers[eventName].unbind_all();

        delete this.subscribers[eventName];
      }
    });

    return this;
  }

  /**
   * Bind to all events of all channels.
   * @param eventName Event name
   * @param listener Listener
   */
  public bind(eventName: string, listener: typeof IListener) {
    this.connection.bind(eventName, listener);
  }
}

class Channel {
  public eventListeners: Record<string, PusherBinder[]> = {};

  constructor(private pusher: Pusher, private subscriberName: string) {
    pusher.connection.bind(subscriberName, (eventName, data) =>
      this.onEvent(eventName, data)
    );
  }

  private onEvent(eventName: string, data: any) {
    if (eventName) {
      if (this.eventListeners[eventName]) {
        this.eventListeners[eventName].forEach((listeners) => {
          listeners.emit(data);
        });
      }
    }
  }

  /**
   * Bind to specified event of this channel.
   * @param eventName Event name
   * @param listener Listener
   */
  public bind(eventName: string, listener: typeof ISpecifiedListener) {
    if (!this.eventListeners[eventName]) {
      this.eventListeners[eventName] = [];
    }

    this.eventListeners[eventName].push(
      new PusherBinder(this, eventName, listener)
    );
  }

  /**
   * Un-bind all specified events of this channel.
   * @param eventName Event name
   */
  public unbind(eventName: string) {
    const eventListeners = this.eventListeners[eventName];

    if (Array.isArray(eventListeners) && eventListeners.length > 0) {
      eventListeners.forEach((listeners, i) => {
        listeners.unbind();
        delete eventListeners[i];
      });

      eventListeners.length = 0;
    }

    return this;
  }

  /**
   * Un-bind all events of this channel.
   */
  public unbind_all() {
    Object.keys(this.eventListeners).forEach((eventName) =>
      this.unbind(eventName)
    );

    return this;
  }

  /**
   * Un-subscribe this channel.
   */
  public unSubscribe() {
    this.pusher.connection.unbind(this.subscriberName, this.onEvent);
    delete this.pusher.subscribe[this.subscriberName];
  }
}

class PusherBinder {
  constructor(
    private pusherChannel: Channel,
    private eventName: string,
    private listener: typeof ISpecifiedListener
  ) {}

  public emit(data) {
    this.listener(data);
  }

  public unbind() {
    const eventListeners = this.pusherChannel.eventListeners[this.eventName];
    if (Array.isArray(eventListeners) && eventListeners.length > 0) {
      const index = eventListeners.findIndex((v) => v === this);
      eventListeners.splice(index, 1);
    }
  }
}

declare function IListener(eventName: string, data: any): void;
declare function ISpecifiedListener(data: any): void;
export interface IPusher extends Pusher {}
export interface IChannel extends Channel {}
