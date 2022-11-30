import { io as Iio, Socket as ISocket } from 'socket.io-client';
declare class Connection {
    io: ISocket;
    constructor(io: typeof Iio, uri: string, opts?: any);
    bind(eventName: string, listener: typeof IListener): ISocket<import("@socket.io/component-emitter").DefaultEventsMap, import("@socket.io/component-emitter").DefaultEventsMap>;
    unbind(eventName: string, listener: typeof IListener): ISocket<import("@socket.io/component-emitter").DefaultEventsMap, import("@socket.io/component-emitter").DefaultEventsMap>;
}
export declare class Pusher {
    connection: Connection;
    private subscribers;
    constructor(io: typeof Iio, url: string, opts?: any);
    /**
     * Subscribe specified channels.
     * @param eventName Event name
     */
    subscribe(eventName: string): Channel;
    /**
     * Un-Subscribe specified channels.
     * @param eventName Event name
     */
    unsubscribe(eventName: string): this;
    /**
     * Un-Subscribe all channels.
     * !!WARNING!!! This will remove all subscribers
     */
    unsubscribe_all(): this;
    /**
     * Bind to all events of all channels.
     * @param eventName Event name
     * @param listener Listener
     */
    bind(eventName: string, listener: typeof IListener): void;
}
declare class Channel {
    private pusher;
    private subscriberName;
    eventListeners: Record<string, PusherBinder[]>;
    constructor(pusher: Pusher, subscriberName: string);
    private onEvent;
    /**
     * Bind to specified event of this channel.
     * @param eventName Event name
     * @param listener Listener
     */
    bind(eventName: string, listener: typeof ISpecifiedListener): void;
    /**
     * Un-bind all specified events of this channel.
     * @param eventName Event name
     */
    unbind(eventName: string): this;
    /**
     * Un-bind all events of this channel.
     */
    unbind_all(): this;
    /**
     * Un-subscribe this channel.
     */
    unSubscribe(): void;
}
declare class PusherBinder {
    private pusherChannel;
    private eventName;
    private listener;
    constructor(pusherChannel: Channel, eventName: string, listener: typeof ISpecifiedListener);
    emit(data: any): void;
    unbind(): void;
}
declare function IListener(eventName: string, data: any): void;
declare function ISpecifiedListener(data: any): void;
export interface IPusher extends Pusher {
}
export interface IChannel extends Channel {
}
export {};
