import { io as Iio, Socket as ISocket } from 'socket.io-client';

let io: typeof Iio;

export function initPusher(_io) {
  io = _io;
  return Pusher;
}

class Connection {
  private io: ISocket;

  constructor(uri: string, opts?: any) {
    if (typeof io === undefined) {
      throw 'not initialized';
    }

    this.io = io(uri, opts);
  }

  public bind(ev: string, listener: typeof IListener) {
    return this.io.on(ev, listener);
  }

  public unbind(ev: string, listener: typeof IListener) {
    return this.io.off(ev, listener);
  }
}

class Pusher {
  public connection: Connection;
  public subscribers: Record<string, Channel> = {};

  constructor(url: string, opts?: any) {
    this.connection = new Connection(url, {
      auth: (cb) => cb(opts),
    });
  }

  public subscribe(ev) {
    if (this.subscribers[ev]) {
      return this.subscribers[ev];
    }

    return (this.subscribers[ev] = new Channel(this, ev));
  }

  public unsubscribe(ev) {
    if (this.subscribers[ev]) {
      this.subscribers[ev].unSubscribe();
    }

    return this;
  }

  public unsubscribe_all() {
    Object.keys(this.subscribers).forEach((ev) => {
      if (this.subscribers[ev]) {
        this.subscribers[ev].unbind_all();

        delete this.subscribers[ev];
      }
    });

    return this;
  }

  public bind(ev: string, listner: typeof IListener) {
    this.connection.bind(ev, listner);
  }
}

class Channel {
  public eventListeners: Record<string, PusherBinder[]> = {};

  constructor(private pusher: Pusher, private subscriberName: string) {
    pusher.connection.bind(subscriberName, (eventName, data) =>
      this.onEvent(eventName, data)
    );
  }

  public onEvent(ev: string, data: any) {
    if (ev) {
      if (this.eventListeners[ev]) {
        this.eventListeners[ev].forEach((listeners) => {
          listeners.emit(data);
        });
      }
    }
  }

  public bind(ev, listner) {
    if (!this.eventListeners[ev]) {
      this.eventListeners[ev] = [];
    }

    this.eventListeners[ev].push(new PusherBinder(this, ev, listner));
  }

  public unbind(ev: string) {
    const eventListeners = this.eventListeners[ev];

    if (Array.isArray(eventListeners) && eventListeners.length > 0) {
      eventListeners.forEach((listeners, i) => {
        listeners.unbind();
        delete eventListeners[i];
      });

      eventListeners.length = 0;
    }

    return this;
  }

  public unbind_all() {
    Object.keys(this.eventListeners).forEach((ev) => this.unbind(ev));

    return this;
  }

  public unSubscribe() {
    this.pusher.connection.unbind(this.subscriberName, this.onEvent);
    delete this.pusher.subscribe[this.subscriberName];
  }
}

class PusherBinder {
  constructor(
    private pusherChannel: Channel,
    private ev: string,
    private listner
  ) {}

  public emit(data) {
    this.listner(data);
  }

  public unbind() {
    const eventListeners = this.pusherChannel.eventListeners[this.ev];
    if (Array.isArray(eventListeners) && eventListeners.length > 0) {
      const index = eventListeners.findIndex((v) => v === this);
      eventListeners.splice(index, 1);
    }
  }
}

declare function IListener(...args: any[]): void;
export interface IPusher extends Pusher {}
export interface IChannel extends Channel {}
