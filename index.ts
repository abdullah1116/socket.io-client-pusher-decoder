import { io, Socket } from 'socket.io-client';

export function initIoPusher(socket: Socket, _io: typeof io) {
  class IoPusher {
    public socket: Socket;
    public subscribers: Record<string, IoPusherSubscriber> = {};

    constructor(
      url: string,
      private props: {
        cluster: string;
        auth: any;
      }
    ) {
      this.socket = _io(url, {
        auth: (cb) => cb(props),
      });
    }

    public subscribe(channelName) {
      if (this.subscribers[channelName]) {
        return this.subscribers[channelName];
      }

      return (this.subscribers[channelName] = new IoPusherSubscriber(
        this,
        channelName
      ));
    }

    public unSubscribe(subscriberName) {
      if (this.subscribers[subscriberName]) {
        this.subscribers[subscriberName].unSubscribe();
      }

      return this;
    }

    public unSubscribeAll() {
      Object.keys(this.subscribers).forEach((subscriberName) => {
        if (this.subscribers[subscriberName]) {
          this.subscribers[subscriberName].unBindAll();

          delete this.subscribers[subscriberName];
        }
      });

      return this;
    }
  }

  class IoPusherSubscriber {
    public eventListeners: Record<string, IoPusherBinder[]> = {};

    constructor(private pusher: IoPusher, private subscriberName: string) {
      pusher.socket.on(subscriberName, (eventName, data) =>
        this.onEvent(eventName, data)
      );
    }

    public onEvent(eventName: string, data: any) {
      if (eventName) {
        if (this.eventListeners[eventName]) {
          this.eventListeners[eventName].forEach((listeners) => {
            listeners.emit(data);
          });
        }
      }
    }

    public bind(eventName, callback) {
      if (!this.eventListeners[eventName]) {
        this.eventListeners[eventName] = [];
      }

      this.eventListeners[eventName].push(
        new IoPusherBinder(this, eventName, callback)
      );
    }

    public unBind(eventName: string) {
      const eventListeners = this.eventListeners[eventName];

      if (Array.isArray(eventListeners) && eventListeners.length > 0) {
        eventListeners.forEach((listeners, i) => {
          listeners.unBind();
          delete eventListeners[i];
        });

        eventListeners.length = 0;
      }

      return this;
    }

    public unBindAll() {
      Object.keys(this.eventListeners).forEach((eventName) =>
        this.unBind(eventName)
      );

      return this;
    }

    public unSubscribe() {
      this.pusher.socket.off(this.subscriberName, this.onEvent);
      delete this.pusher.subscribe[this.subscriberName];
    }
  }

  class IoPusherBinder {
    constructor(
      private pusherChannel: IoPusherSubscriber,
      private eventName: string,
      private callback
    ) {}

    public emit(data) {
      this.callback(data);
    }

    public unBind() {
      const eventListeners = this.pusherChannel.eventListeners[this.eventName];
      if (Array.isArray(eventListeners) && eventListeners.length > 0) {
        const index = eventListeners.findIndex((v) => v === this);
        eventListeners.splice(index, 1);
      }
    }
  }

  return IoPusher;
}
